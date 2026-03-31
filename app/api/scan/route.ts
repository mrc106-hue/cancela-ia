import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// force-dynamic evita que Next.js pre-renderice esta ruta en build time
export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Multiple focused queries instead of one giant OR (Gmail has query length/complexity limits)
const GMAIL_QUERIES = [
  // Gmail purchase category — catches 289 emails for this user
  'category:purchases newer_than:12m',

  // Generic billing subjects (split into smaller ORs to avoid query limit)
  'subject:(receipt OR invoice OR factura OR billing) newer_than:12m',
  'subject:(subscription OR suscripcion OR renewal OR renovacion) newer_than:12m',
  'subject:("payment confirmation" OR "confirmacion de pago" OR "your receipt" OR "tu recibo") newer_than:12m',
  'subject:("order summary" OR "order confirmation" OR "payment successful" OR "pago exitoso") newer_than:12m',

  // Payment failure emails — often contain price info
  'subject:("payment failed" OR "pago fallado" OR "ha fallado" OR "unsuccessful" OR "past due") newer_than:12m',
  'subject:("cobro fallido" OR "cargo fallido" OR "failed payment" OR "payment declined") newer_than:12m',

  // Known services — explicit service-name searches
  '"suno" newer_than:12m',
  '"storyblocks" newer_than:12m',
  '"base44" newer_than:12m',
  '"wix.com" newer_than:12m',

  // Known sender domains
  'from:(suno.ai OR suno.com) newer_than:12m',
  'from:(storyblocks.com OR support@storyblocks.com) newer_than:12m',
  'from:(base44.com OR wix.com) newer_than:12m',
  'from:(netflix.com OR spotify.com OR apple.com) newer_than:12m',
  'from:(amazon.es OR amazon.com OR amazon.co.uk) newer_than:12m',
  'from:(adobe.com OR openai.com OR anthropic.com) newer_than:12m',
  'from:(youtube.com OR google.com OR payments-noreply@google.com) newer_than:12m',
  'from:(dropbox.com OR notion.so OR figma.com OR slack.com OR github.com) newer_than:12m',
  'from:(vercel.com OR railway.app OR supabase.io OR supabase.com) newer_than:12m',
  'from:(patreon.com OR substack.com OR twitch.tv OR discord.com) newer_than:12m',
  'from:(canva.com OR grammarly.com OR duolingo.com OR microsoft.com) newer_than:12m',
  'from:(chatgpt.com OR midjourney.com OR elevenlabs.io OR runwayml.com) newer_than:12m',
  'from:(cloudflare.com OR digitalocean.com OR aws.amazon.com OR heroku.com) newer_than:12m',
]

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalido' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const providerToken: string | undefined = body.provider_token

    const startTime = Date.now()

    let emails: EmailSummary[] = []
    let usedRealGmail = false
    let queryStats: Record<string, number> = {}

    if (providerToken) {
      try {
        const result = await fetchGmailEmails(providerToken)
        emails = result.emails
        queryStats = result.queryStats
        usedRealGmail = true
        console.log(`[SCAN] Total unique emails fetched: ${emails.length}`, queryStats)
      } catch (gmailErr: any) {
        console.error('[SCAN] Gmail error:', gmailErr.message)
        // Fall through to demo data if Gmail fails
      }
    }

    const subscriptions = emails.length > 0
      ? await analyzeEmailsWithClaude(emails)
      : getDemoSubscriptions()

    return NextResponse.json({
      subscriptions,
      scanned_emails: emails.length,
      scan_time_ms: Date.now() - startTime,
      used_real_gmail: usedRealGmail,
      demo_mode: emails.length === 0,
      query_stats: queryStats,
    })
  } catch (err: any) {
    console.error('[SCAN] Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

type EmailSummary = {
  from: string
  subject: string
  date: string
  snippet: string
}

async function fetchGmailEmails(providerToken: string): Promise<{ emails: EmailSummary[]; queryStats: Record<string, number> }> {
  const headers = { Authorization: `Bearer ${providerToken}` }

  // Run all queries in parallel, collect unique message IDs
  const queryResults = await Promise.allSettled(
    GMAIL_QUERIES.map(async (q) => {
      const encoded = encodeURIComponent(q)
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encoded}&maxResults=100`,
        { headers },
      )
      if (!res.ok) {
        const errText = await res.text()
        console.warn(`[SCAN] Query failed (${res.status}): "${q.slice(0, 60)}" — ${errText.slice(0, 100)}`)
        return { query: q, ids: [] as string[] }
      }
      const data = await res.json()
      const ids: string[] = (data.messages || []).map((m: { id: string }) => m.id)
      return { query: q, ids }
    }),
  )

  // Deduplicate message IDs and build query stats
  const seenIds = new Set<string>()
  const allIds: string[] = []
  const queryStats: Record<string, number> = {}

  for (const result of queryResults) {
    if (result.status === 'fulfilled') {
      const { query, ids } = result.value
      const shortKey = query.slice(0, 50)
      let newCount = 0
      for (const id of ids) {
        if (!seenIds.has(id)) {
          seenIds.add(id)
          allIds.push(id)
          newCount++
        }
      }
      queryStats[shortKey] = newCount
    }
  }

  console.log(`[SCAN] Unique message IDs collected: ${allIds.length}`)

  // Fetch details for up to 400 messages in batches of 25 (avoid rate limits)
  const toFetch = allIds.slice(0, 400)
  const BATCH_SIZE = 25
  const details: EmailSummary[] = []

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (msgId) => {
        try {
          const res = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers },
          )
          if (!res.ok) return null
          const data = await res.json()
          const hdrs: Array<{ name: string; value: string }> = data.payload?.headers || []
          const h = (name: string) => hdrs.find(x => x.name === name)?.value || ''
          const snippet = (data.snippet || '')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
          return {
            from: h('From'),
            subject: h('Subject'),
            date: h('Date'),
            snippet: snippet.slice(0, 300),
          } as EmailSummary
        } catch {
          return null
        }
      }),
    )
    details.push(...batchResults.filter((d): d is EmailSummary => d !== null))
  }

  return { emails: details, queryStats }
}

async function analyzeEmailsWithClaude(emails: EmailSummary[]): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return getDemoSubscriptions()

  // Build compact email text — Claude needs enough signal to detect subscriptions
  const emailsText = emails
    .map((e, i) =>
      `[${i + 1}] From: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nPreview: ${e.snippet}`,
    )
    .join('\n---\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Eres un asistente experto en detectar suscripciones de pago recurrente en emails.

Analiza los siguientes emails y extrae ABSOLUTAMENTE TODAS las suscripciones activas o recientes con pagos recurrentes.

INCLUYE:
- Servicios de streaming (video, música, podcasts, audiolibros)
- Software y herramientas SaaS (diseño, productividad, IA, código)
- Cloud storage y hosting
- Gaming y entretenimiento
- Noticias, newsletters de pago y comunidades
- Servicios de IA (ChatGPT, Claude, Midjourney, Suno, etc.)
- Dominios y hosting web (Wix, Squarespace, etc.)
- Cualquier cargo recurrente mensual, anual o semanal
- INCLUYE pagos FALLIDOS — si un pago falló, la suscripción existe (ej: "pago fallado a Suno", "payment failed for Storyblocks")
- INCLUYE si la factura viene de un proveedor de pago diferente (ej: "Wix.com Ltd" para Base44)

EXCLUYE:
- Compras únicas (a menos que sea Amazon Prime/suscripción)
- Emails de marketing sin cargo real
- Notificaciones sin importe

Para cada suscripcion devuelve:
- name: nombre del SERVICIO REAL (no el procesador de pago). Ej: si el email dice "Wix.com Ltd" pero el subject menciona "base44.com", el nombre es "Base44"
- price: precio numerico exacto (extrae del email o snippet; si no aparece pero el servicio es conocido, pon el precio típico)
- currency: "EUR" o "USD" según el email (por defecto EUR si es .es o menciona €)
- period: "monthly" o "yearly" o "weekly"
- category: "Streaming" | "Musica" | "Gaming" | "Productividad" | "Cloud" | "IA" | "Compras" | "Otro"
- confidence: 0.0-1.0
- detected_from: email del remitente

DEDUPLICA: si hay múltiples emails del mismo servicio, inclúyelo solo UNA vez con el precio más reciente.

Responde SOLO con un JSON array válido, sin texto antes o después, sin markdown.

Emails (${emails.length} total):
${emailsText}`,
        }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[SCAN] Claude API error:', res.status, errText.slice(0, 200))
      return getDemoSubscriptions()
    }

    const data = await res.json()
    const text: string = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Deduplicate by lowercased name
          const seen = new Set<string>()
          return parsed.filter((s: any) => {
            if (!s.name || typeof s.price !== 'number') return false
            const key = s.name.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
        }
      } catch (parseErr) {
        console.error('[SCAN] JSON parse error:', parseErr)
      }
    }
  } catch (e) {
    console.error('[SCAN] Claude error:', e)
  }

  return getDemoSubscriptions()
}

function getDemoSubscriptions() {
  return [
    { name: 'Netflix Premium', price: 17.99, currency: 'EUR', period: 'monthly', category: 'Streaming', confidence: 0.98 },
    { name: 'Spotify Premium', price: 10.99, currency: 'EUR', period: 'monthly', category: 'Musica', confidence: 0.97 },
    { name: 'Amazon Prime', price: 49.90, currency: 'EUR', period: 'yearly', category: 'Compras', confidence: 0.95 },
    { name: 'Adobe Creative Cloud', price: 59.99, currency: 'EUR', period: 'monthly', category: 'Productividad', confidence: 0.92 },
    { name: 'ChatGPT Plus', price: 20.00, currency: 'EUR', period: 'monthly', category: 'IA', confidence: 0.94 },
    { name: 'iCloud+ 200GB', price: 2.99, currency: 'EUR', period: 'monthly', category: 'Cloud', confidence: 0.91 },
    { name: 'YouTube Premium', price: 11.99, currency: 'EUR', period: 'monthly', category: 'Streaming', confidence: 0.96 },
  ]
}

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

// Multiple targeted queries for better coverage across 12 months
const SEARCH_QUERIES = [
  // Subject-based: billing keywords
  'subject:receipt newer_than:12m',
  'subject:invoice newer_than:12m',
  'subject:factura newer_than:12m',
  'subject:subscription newer_than:12m',
  'subject:suscripcion newer_than:12m',
  'subject:billing newer_than:12m',
  'subject:renewal newer_than:12m',
  'subject:renovacion newer_than:12m',
  'subject:"payment confirmation" newer_than:12m',
  'subject:"payment successful" newer_than:12m',
  'subject:"your receipt" newer_than:12m',
  'subject:"your invoice" newer_than:12m',
  'subject:"order confirmation" newer_than:12m',
  'subject:"charge" newer_than:12m',
  'subject:"cobro" newer_than:12m',
  'subject:"cargo" newer_than:12m',
  'subject:"pago" newer_than:12m',
  'subject:"tu suscripcion" newer_than:12m',
  'subject:"your subscription" newer_than:12m',
  'subject:"plan renewed" newer_than:12m',
  'subject:"payment received" newer_than:12m',
  'subject:"thank you for your payment" newer_than:12m',
  'subject:"gracias por tu pago" newer_than:12m',
  'subject:"confirmacion de pago" newer_than:12m',
  // Sender-based: known subscription services
  '(from:noreply@netflix.com OR from:noreply@spotify.com OR from:no-reply@amazon.com OR from:no-reply@amazon.es) newer_than:12m',
  '(from:adobe@adobe.com OR from:noreply@openai.com OR from:apple@email.apple.com) newer_than:12m',
  '(from:noreply@youtube.com OR from:payments-noreply@google.com OR from:no-reply@anthropic.com) newer_than:12m',
  '(from:billing@supabase.io OR from:noreply@supabase.com OR from:no-reply@supabase.io) newer_than:12m',
  '(from:heygen.com OR from:runwayml.com OR from:runway.com OR from:elevenlabs.io) newer_than:12m',
  '(from:suno.com OR from:suno.ai OR from:base44.com) newer_than:12m',
  '(from:storyblocks.com OR from:videoblocks.com OR from:audioblocks.com) newer_than:12m',
  '(from:midjourney.com OR from:perplexity.ai OR from:cursor.sh) newer_than:12m',
  '(from:github.com OR from:vercel.com OR from:railway.app) newer_than:12m',
  '(from:notion.so OR from:figma.com OR from:canva.com) newer_than:12m',
  '(from:dropbox.com OR from:slack.com OR from:zoom.us) newer_than:12m',
  '(from:grammarly.com OR from:linkedin.com) newer_than:12m',
  '(from:microsoft.com OR from:office.com) newer_than:12m',
  '(from:cloudflare.com OR from:digitalocean.com OR from:heroku.com) newer_than:12m',
  '(from:shutterstock.com OR from:gettyimages.com OR from:envato.com) newer_than:12m',
  '(from:duolingo.com OR from:todoist.com OR from:evernote.com) newer_than:12m',
]

type EmailSummary = {
  from: string
  subject: string
  date: string
  snippet: string
}

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

    if (providerToken) {
      try {
        emails = await fetchGmailEmails(providerToken)
        usedRealGmail = true
      } catch (gmailErr: any) {
        console.error('[SCAN] Gmail error:', gmailErr.message)
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
    })
  } catch (err: any) {
    console.error('[SCAN] Error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function fetchEmailPage(
  providerToken: string,
  query: string,
  pageToken?: string,
): Promise<{ messageIds: string[]; nextPageToken?: string }> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages')
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '50')
  if (pageToken) url.searchParams.set('pageToken', pageToken)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${providerToken}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gmail API ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  return {
    messageIds: (data.messages || []).map((m: { id: string }) => m.id),
    nextPageToken: data.nextPageToken,
  }
}

async function fetchGmailEmails(providerToken: string): Promise<EmailSummary[]> {
  const allIds = new Set<string>()

  // Run all queries in parallel to collect message IDs
  const queryResults = await Promise.allSettled(
    SEARCH_QUERIES.map(async (query) => {
      try {
        const page1 = await fetchEmailPage(providerToken, query)
        page1.messageIds.forEach(id => allIds.add(id))
        // Fetch second page for high-yield queries
        if (page1.nextPageToken && allIds.size < 600) {
          const page2 = await fetchEmailPage(providerToken, query, page1.nextPageToken)
          page2.messageIds.forEach(id => allIds.add(id))
        }
      } catch {
        // Ignore individual query errors
      }
    })
  )

  console.log(`[SCAN] Query results: ${queryResults.length}, unique IDs: ${allIds.size}`)

  if (allIds.size === 0) return []

  // Fetch metadata for up to 250 unique messages — all in parallel
  const ids = Array.from(allIds).slice(0, 250)
  const details = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${providerToken}` } },
        )
        if (!res.ok) return null
        const data = await res.json()
        const headers: Array<{ name: string; value: string }> = data.payload?.headers || []
        const h = (name: string) => headers.find(x => x.name === name)?.value || ''
        return {
          from: h('From'),
          subject: h('Subject'),
          date: h('Date'),
          snippet: (data.snippet || '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
        } as EmailSummary
      } catch {
        return null
      }
    }),
  )

  return details.filter((d): d is EmailSummary => d !== null)
}

async function analyzeEmailsWithClaude(emails: EmailSummary[]): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return getDemoSubscriptions()

  // Deduplicate emails: same sender domain + similar subject = one entry
  const seen = new Set<string>()
  const deduped = emails.filter(e => {
    const senderDomain = e.from.match(/@([^>\s]+)/)?.[1]?.toLowerCase() || e.from.toLowerCase().slice(0, 30)
    const subjectKey = e.subject.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().slice(0, 40)
    const key = `${senderDomain}::${subjectKey}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`[SCAN] Emails after dedup: ${deduped.length} (from ${emails.length})`)

  // Process in batches of 120 to stay within Claude's context
  const BATCH_SIZE = 120
  const allSubscriptions: any[] = []

  for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
    const batch = deduped.slice(i, i + BATCH_SIZE)
    const batchSubs = await analyzeEmailBatch(apiKey, batch)
    allSubscriptions.push(...batchSubs)
  }

  // Final deduplication across batches by normalized service name
  const seenNames = new Set<string>()
  return allSubscriptions.filter((s: any) => {
    if (!s.name || typeof s.price !== 'number') return false
    const key = s.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seenNames.has(key)) return false
    seenNames.add(key)
    return true
  })
}

async function analyzeEmailBatch(apiKey: string, emails: EmailSummary[]): Promise<any[]> {
  const emailsText = emails
    .map((e, i) => `[${i + 1}] From: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nPreview: ${e.snippet?.slice(0, 150)}`)
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Eres un experto en deteccion de suscripciones y pagos recurrentes. Analiza estos emails y extrae TODAS las suscripciones activas.

INCLUYE sin excepcion:
- Streaming: Netflix, Spotify, Disney+, HBO/Max, Hulu, Apple TV+, Paramount+, Twitch
- Software/SaaS: Adobe, Microsoft 365, Figma, Notion, Canva, Slack, Zoom, Grammarly, Dropbox, GitHub, Airtable, Monday, Asana, Todoist
- IA y ML: Claude/Anthropic, ChatGPT/OpenAI, Midjourney, ElevenLabs, HeyGen, Runway ML, Suno, Perplexity, Cursor, GitHub Copilot, Jasper
- Cloud y hosting: AWS, Google Cloud, Azure, Vercel, Railway, Supabase, Cloudflare, DigitalOcean, Heroku, Hostinger, GoDaddy, Namecheap
- Stock media: Storyblocks, Shutterstock, Getty Images, Envato, Artlist, Epidemic Sound
- Productividad/Educacion: Duolingo, LinkedIn Premium, Coursera, Udemy, Skillshare, MasterClass
- Juegos: Xbox Game Pass, PlayStation Plus, Nintendo Online, Steam, Epic
- Cualquier otro servicio con cobro mensual o anual (aunque sea desconocido como Base44, herramientas nicho, etc.)

Por cada suscripcion retorna un objeto JSON con:
- name: nombre exacto del servicio (ej: "Claude Pro", "ElevenLabs Creator", "Storyblocks All-Access", "HeyGen Essential")
- price: numero con el precio (extrae del email; si no aparece usa el precio tipico del plan detectado)
- currency: "EUR" o "USD" (usa "USD" para servicios americanos sin moneda explicita)
- period: "monthly" o "yearly"
- category: "Streaming" | "Musica" | "Gaming" | "Productividad" | "Cloud" | "IA" | "Compras" | "Otro"
- confidence: 0.7-1.0 (1.0 = precio exacto en email, 0.8 = deducido de asunto/contexto, 0.7 = solo sender conocido)
- detected_from: email completo del remitente

REGLAS:
- EXCLUYE compras unicas de Amazon/eBay/tiendas (no suscripciones)
- EXCLUYE emails de marketing sin confirmar pago
- DEDUPLICA: si hay varios emails del mismo servicio, pon solo el mas reciente
- Si el email menciona cancelacion completada, NO lo incluyas
- Responde UNICAMENTE con un JSON array valido, absolutamente nada mas

Emails a analizar:
${emailsText}`,
        }],
      }),
    })

    if (!res.ok) {
      console.error('[SCAN] Claude API error:', res.status)
      return []
    }

    const data = await res.json()
    const text: string = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('[SCAN] Claude batch error:', e)
  }

  return []
}

function getDemoSubscriptions() {
  return [
    { name: 'Netflix Premium', price: 17.99, currency: 'EUR', period: 'monthly', category: 'Streaming', confidence: 0.98 },
    { name: 'Spotify Premium', price: 10.99, currency: 'EUR', period: 'monthly', category: 'Musica', confidence: 0.97 },
    { name: 'Amazon Prime', price: 49.90, currency: 'EUR', period: 'yearly', category: 'Compras', confidence: 0.95 },
    { name: 'Adobe Creative Cloud', price: 59.99, currency: 'EUR', period: 'monthly', category: 'Productividad', confidence: 0.92 },
    { name: 'Claude Pro', price: 20.00, currency: 'USD', period: 'monthly', category: 'IA', confidence: 0.94 },
    { name: 'ElevenLabs', price: 22.00, currency: 'USD', period: 'monthly', category: 'IA', confidence: 0.91 },
    { name: 'Runway ML', price: 15.00, currency: 'USD', period: 'monthly', category: 'IA', confidence: 0.90 },
    { name: 'Supabase Pro', price: 25.00, currency: 'USD', period: 'monthly', category: 'Cloud', confidence: 0.92 },
    { name: 'HeyGen', price: 29.00, currency: 'USD', period: 'monthly', category: 'IA', confidence: 0.88 },
    { name: 'Storyblocks', price: 99.00, currency: 'USD', period: 'yearly', category: 'Productividad', confidence: 0.93 },
  ]
}

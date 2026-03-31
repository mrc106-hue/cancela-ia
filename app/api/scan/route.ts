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

const GMAIL_QUERY = [
  'subject:receipt',
  'subject:invoice',
  'subject:factura',
  'subject:subscription',
  'subject:suscripcion',
  'subject:billing',
  'subject:renewal',
  'subject:renovacion',
  'subject:"payment confirmation"',
  'subject:"confirmacion de pago"',
  'subject:"your receipt"',
  'subject:"tu recibo"',
  'subject:"order confirmation"',
  'subject:"confirmacion de pedido"',
  'subject:"payment successful"',
  'subject:"pago exitoso"',
  'from:noreply@netflix.com',
  'from:noreply@spotify.com',
  'from:no-reply@amazon.es',
  'from:no-reply@amazon.com',
  'from:adobe@adobe.com',
  'from:noreply@openai.com',
  'from:apple@email.apple.com',
  'from:noreply@youtube.com',
  'from:payments-noreply@google.com',
].join(' OR ')

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

async function fetchGmailEmails(providerToken: string): Promise<EmailSummary[]> {
  const query = encodeURIComponent(`(${GMAIL_QUERY}) newer_than:12m`)

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=100`,
    { headers: { Authorization: `Bearer ${providerToken}` } },
  )

  if (!listRes.ok) {
    const errText = await listRes.text()
    throw new Error(`Gmail API error ${listRes.status}: ${errText.slice(0, 200)}`)
  }

  const listData = await listRes.json()
  const messages: Array<{ id: string }> = listData.messages || []
  if (messages.length === 0) return []

  // Fetch metadata for up to 40 messages in parallel batches
  const toFetch = messages.slice(0, 40)
  const details = await Promise.all(
    toFetch.map(async (msg) => {
      try {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
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

  // Build compact email text for Claude
  const emailsText = emails
    .map((e, i) => `[${i + 1}] From: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nPreview: ${e.snippet?.slice(0, 200)}`)
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Eres un asistente que analiza emails para detectar suscripciones de pago recurrente.

Analiza estos emails y extrae TODAS las suscripciones unicas con pagos recurrentes (streaming, software, cloud, gaming, musica, productividad, IA, etc).

Para cada suscripcion incluye:
- name: nombre del servicio (ej: "Netflix Premium", "Spotify", "Adobe Creative Cloud")
- price: precio numerico exacto (extrae del email, si no hay pon el tipico para ese servicio)
- currency: "EUR" o "USD" segun el email
- period: "monthly" o "yearly" o "weekly"
- category: "Streaming" | "Musica" | "Gaming" | "Productividad" | "Cloud" | "IA" | "Compras" | "Otro"
- confidence: numero 0.0-1.0 (cuanto confias en la deteccion)
- detected_from: email del remitente

Reglas:
- EXCLUYE compras unicas (Amazon compras, etc) a menos que sea Prime/suscripcion
- EXCLUYE emails de marketing sin cargo real
- DEDUPLICA: si hay multiples emails del mismo servicio, incluyelo solo UNA vez
- Si el precio no esta claro, usa el precio tipico del servicio
- Responde SOLO con JSON array, sin texto antes o despues

Emails a analizar:
${emailsText}`,
        }],
      }),
    })

    if (!res.ok) {
      console.error('[SCAN] Claude API error:', res.status)
      return getDemoSubscriptions()
    }

    const data = await res.json()
    const text: string = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
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

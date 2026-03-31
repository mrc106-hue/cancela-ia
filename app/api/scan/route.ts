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

// Phase 1: Subject/keyword queries for billing-related emails
const BILLING_QUERIES = [
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
  'subject:charge newer_than:12m',
  'subject:cobro newer_than:12m',
  'subject:cargo newer_than:12m',
  'subject:pago newer_than:12m',
  'subject:"tu suscripcion" newer_than:12m',
  'subject:"payment failed" newer_than:12m',
  'subject:"pago fallado" newer_than:12m',
  'subject:"ha fallado" newer_than:12m',
  'subject:recibo newer_than:12m',
  'subject:"plan" subject:"upgrade" newer_than:12m',
]

// Phase 2: Direct service name queries - search by sender/name
const SERVICE_QUERIES = [
  'from:suno newer_than:12m',
  'from:storyblocks newer_than:12m',
  'from:base44 newer_than:12m',
  'from:wix.com newer_than:12m',
  'from:elevenlabs newer_than:12m',
  'from:heygen newer_than:12m',
  'from:runwayml newer_than:12m',
  'from:runway newer_than:12m',
  'from:supabase newer_than:12m',
  'from:railway.app newer_than:12m',
  'from:anthropic newer_than:12m',
  'from:claude newer_than:12m',
  'from:openai newer_than:12m',
  'from:midjourney newer_than:12m',
  'from:spotify newer_than:12m',
  'from:netflix newer_than:12m',
  'from:adobe newer_than:12m',
  'from:canva newer_than:12m',
  'from:notion newer_than:12m',
  'from:figma newer_than:12m',
  'from:github newer_than:12m',
  'from:vercel newer_than:12m',
  'from:cloudflare newer_than:12m',
  'from:stripe newer_than:12m',
  'from:paypal newer_than:12m',
  'from:cursor newer_than:12m',
  'from:perplexity newer_than:12m',
  'from:loom newer_than:12m',
  'from:grammarly newer_than:12m',
  'from:leonardo newer_than:12m',
  'from:zapier newer_than:12m',
  'from:airtable newer_than:12m',
  'from:monday newer_than:12m',
  'from:asana newer_than:12m',
  'from:slack newer_than:12m',
  'from:zoom newer_than:12m',
  'from:recurly newer_than:12m',
  'from:paddle newer_than:12m',
  'from:chargebee newer_than:12m',
  'from:google subject:storage newer_than:12m',
  'from:apple subject:receipt newer_than:12m',
  'from:amazon subject:prime newer_than:12m',
]

// Phase 3: Gmail category for purchases
const CATEGORY_QUERIES = [
  'category:purchases newer_than:12m',
  'label:compras newer_than:12m',
]

async function fetchGmailMessages(token: string, query: string, maxResults = 30): Promise<string[]> {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.messages || []).map((m: any) => m.id)
  } catch {
    return []
  }
}

async function fetchEmailDetail(token: string, messageId: string): Promise<any | null> {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const msg = await res.json()

    const headers = msg.payload?.headers || []
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

    let bodyText = msg.snippet || ''
    try {
      const parts = msg.payload?.parts || []
      if (msg.payload?.body?.data) {
        bodyText = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8')
      } else if (parts.length > 0) {
        for (const part of parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8')
            break
          }
        }
        if (bodyText === msg.snippet) {
          for (const part of parts) {
            if (part.mimeType === 'text/html' && part.body?.data) {
              const html = Buffer.from(part.body.data, 'base64').toString('utf-8')
              bodyText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 2000)
              break
            }
          }
        }
      }
    } catch {
      // Keep snippet as fallback
    }

    return {
      id: messageId,
      from: getHeader('From'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      snippet: msg.snippet || '',
      body: bodyText.substring(0, 2000),
    }
  } catch {
    return null
  }
}

function getDemoSubscriptions() {
  return [
    { name: 'Netflix Premium', price: 17.99, currency: '\u20ac', frequency: 'Mensual', category: 'Streaming', confidence: 98, lastCharge: '2026-03-15' },
    { name: 'Spotify Premium', price: 10.99, currency: '\u20ac', frequency: 'Mensual', category: 'Musica', confidence: 97, lastCharge: '2026-03-10' },
    { name: 'Amazon Prime', price: 49.90, currency: '\u20ac', frequency: 'Anual', category: 'Compras', confidence: 95, lastCharge: '2026-01-15' },
    { name: 'Adobe Creative Cloud', price: 59.99, currency: '\u20ac', frequency: 'Mensual', category: 'Productividad', confidence: 92, lastCharge: '2026-03-01' },
    { name: 'Claude Pro', price: 20.00, currency: '$', frequency: 'Mensual', category: 'IA', confidence: 94, lastCharge: '2026-03-05' },
    { name: 'ElevenLabs', price: 22.00, currency: '$', frequency: 'Mensual', category: 'IA', confidence: 91, lastCharge: '2026-03-08' },
    { name: 'Runway ML', price: 15.00, currency: '$', frequency: 'Mensual', category: 'IA', confidence: 90, lastCharge: '2026-03-12' },
    { name: 'Supabase Pro', price: 25.00, currency: '$', frequency: 'Mensual', category: 'Cloud', confidence: 92, lastCharge: '2026-03-01' },
    { name: 'HeyGen', price: 29.00, currency: '$', frequency: 'Mensual', category: 'IA', confidence: 88, lastCharge: '2026-03-07' },
    { name: 'Suno Pro', price: 10.00, currency: '\u20ac', frequency: 'Mensual', category: 'IA', confidence: 90, lastCharge: '2026-02-28' },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const providerToken = body.provider_token

    if (!providerToken) {
      console.log('[scan] No provider_token -- returning demo data')
      return NextResponse.json({
        subscriptions: getDemoSubscriptions(),
        emailsScanned: 0,
        isDemo: true,
      })
    }

    console.log('[scan] Starting real Gmail scan with provider_token')
    const allMessageIds = new Set<string>()

    // Phase 1: Billing keyword queries
    console.log('[scan] Phase 1: Billing queries...')
    const billingBatch1 = BILLING_QUERIES.slice(0, 12)
    const billingBatch2 = BILLING_QUERIES.slice(12)

    const billingResults1 = await Promise.all(billingBatch1.map(q => fetchGmailMessages(providerToken, q, 30)))
    billingResults1.flat().forEach(id => allMessageIds.add(id))

    const billingResults2 = await Promise.all(billingBatch2.map(q => fetchGmailMessages(providerToken, q, 30)))
    billingResults2.flat().forEach(id => allMessageIds.add(id))

    console.log(`[scan] Phase 1 found ${allMessageIds.size} unique messages`)

    // Phase 2: Direct service name queries
    console.log('[scan] Phase 2: Service name queries...')
    const serviceBatch1 = SERVICE_QUERIES.slice(0, 15)
    const serviceBatch2 = SERVICE_QUERIES.slice(15, 30)
    const serviceBatch3 = SERVICE_QUERIES.slice(30)

    const serviceResults1 = await Promise.all(serviceBatch1.map(q => fetchGmailMessages(providerToken, q, 20)))
    serviceResults1.flat().forEach(id => allMessageIds.add(id))
    const serviceResults2 = await Promise.all(serviceBatch2.map(q => fetchGmailMessages(providerToken, q, 20)))
    serviceResults2.flat().forEach(id => allMessageIds.add(id))
    const serviceResults3 = await Promise.all(serviceBatch3.map(q => fetchGmailMessages(providerToken, q, 20)))
    serviceResults3.flat().forEach(id => allMessageIds.add(id))

    console.log(`[scan] Phase 2 total: ${allMessageIds.size} unique messages`)

    // Phase 3: Category queries
    console.log('[scan] Phase 3: Category queries...')
    const categoryResults = await Promise.all(CATEGORY_QUERIES.map(q => fetchGmailMessages(providerToken, q, 50)))
    categoryResults.flat().forEach(id => allMessageIds.add(id))

    console.log(`[scan] All phases total: ${allMessageIds.size} unique messages`)

    // Fetch full details for up to 400 unique messages
    const messageIds = Array.from(allMessageIds).slice(0, 400)
    console.log(`[scan] Fetching details for ${messageIds.length} messages...`)

    const emails: any[] = []
    for (let i = 0; i < messageIds.length; i += 30) {
      const batch = messageIds.slice(i, i + 30)
      const results = await Promise.all(batch.map(id => fetchEmailDetail(providerToken, id)))
      emails.push(...results.filter(Boolean))
    }

    console.log(`[scan] Got ${emails.length} email details`)

    if (emails.length === 0) {
      console.log('[scan] No emails found, returning demo')
      return NextResponse.json({ subscriptions: getDemoSubscriptions(), emailsScanned: 0, isDemo: true })
    }

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const allSubscriptions: any[] = []
    const seenServices = new Set<string>()

    for (let i = 0; i < emails.length; i += 80) {
      const batch = emails.slice(i, i + 80)
      const emailSummaries = batch.map((e: any, idx: number) =>
        `[Email ${i + idx + 1}]\nFrom: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nBody: ${e.body}`
      ).join('\n---\n')

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `You are analyzing real emails to detect ALL subscriptions and recurring payments. Be EXTREMELY thorough - every subscription matters.

CRITICAL RULES:
- ANY email from a SaaS, AI tool, cloud service, streaming platform, or recurring billing service IS a subscription
- Payment failure emails ("payment failed", "pago fallado") STILL indicate an active subscription
- Emails from Stripe, PayPal, Recurly, Paddle, or Wix billing on behalf of a service count as that service's subscription
- If you see "Wix.com Ltd" billing for "base44.com", that's a Base44 subscription
- If you see "Suno" with payment amounts, that's a Suno subscription
- If you see "Storyblocks" with order/invoice info, that's a Storyblocks subscription
- Look at BOTH the sender name AND the email body for service identification
- Extract the EXACT price from the email body when available
- Include ALL SaaS tools: AI tools (Claude, ChatGPT, Midjourney, Runway, HeyGen, ElevenLabs, Suno, Leonardo, Cursor, Perplexity), cloud hosting (Supabase, Railway, Vercel, AWS, Cloudflare), dev tools (GitHub Copilot, Figma, Notion), stock media (Storyblocks, Shutterstock, Adobe Stock), website builders (Base44, Wix, Squarespace), streaming (Netflix, Spotify, Disney+, HBO), storage (Google One, iCloud, Dropbox), and ANY other recurring service

Already detected services (skip these): ${Array.from(seenServices).join(', ') || 'none yet'}

Here are the emails:
${emailSummaries}

Return ONLY valid JSON array. Each item must have:
- name: Service name (clean, capitalized)
- price: Number (the amount charged)
- currency: "$" or "EUR"
- frequency: "Mensual" or "Anual"
- category: "IA", "Cloud", "Streaming", "Musica", "Productividad", "Compras", "Media", "Dev Tools", or "Otro"
- confidence: 60-100 (how confident this is a real subscription)
- lastCharge: "YYYY-MM-DD" (date of most recent email about this service)

Return [] if no subscriptions found. JSON ONLY, no explanation.`
          }],
        }),
      })

      if (claudeRes.ok) {
        const claudeData = await claudeRes.json()
        const text = claudeData.content?.[0]?.text || '[]'
        try {
          const jsonMatch = text.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const subs = JSON.parse(jsonMatch[0])
            for (const sub of subs) {
              const key = sub.name?.toLowerCase()?.trim()
              if (key && !seenServices.has(key)) {
                seenServices.add(key)
                allSubscriptions.push(sub)
              }
            }
          }
        } catch (e) {
          console.error('[scan] Failed to parse Claude response:', e)
        }
      }
    }

    console.log(`[scan] Found ${allSubscriptions.length} subscriptions from ${emails.length} emails`)

    return NextResponse.json({
      subscriptions: allSubscriptions.length > 0 ? allSubscriptions : getDemoSubscriptions(),
      emailsScanned: emails.length,
      isDemo: allSubscriptions.length === 0,
    })

  } catch (error: any) {
    console.error('[scan] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

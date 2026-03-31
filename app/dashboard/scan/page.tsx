'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

type ScanResult = {
  name: string
  price: number
  currency: string
  period: string
  category: string
  confidence: number
  detected_from?: string
}

const CATEGORY_ICONS: Record<string, string> = {
  Streaming: '📺',
  Musica: '🎵',
  Gaming: '🎮',
  Productividad: '💼',
  Cloud: '☁️',
  IA: '🤖',
  Compras: '🛍️',
  Otro: '📦',
}

const SERVICE_COLORS: Record<string, string> = {
  Netflix: '#E50914',
  Spotify: '#1DB954',
  Amazon: '#FF9900',
  Disney: '#113CCF',
  Adobe: '#FF0000',
  Apple: '#555555',
  Google: '#4285F4',
  Microsoft: '#00A4EF',
  YouTube: '#FF0000',
  Figma: '#A259FF',
  ChatGPT: '#10A37F',
  Notion: '#ffffff',
  Duolingo: '#58CC02',
  LinkedIn: '#0A66C2',
  Dropbox: '#0061FF',
  Canva: '#00C4CC',
  Grammarly: '#15C39A',
  Slack: '#4A154B',
  Zoom: '#2D8CFF',
}

function getServiceColor(name: string): string {
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color
  }
  return '#7C3AED'
}

export default function ScanPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('')
  const [results, setResults] = useState<ScanResult[]>([])
  const [error, setError] = useState('')
  const [emailCount, setEmailCount] = useState(0)
  const [usedGmail, setUsedGmail] = useState(false)
  const [saving, setSaving] = useState(false)

  async function startScan() {
    setScanning(true)
    setError('')
    setProgress(0)
    setResults([])

    try {
      // Phase 1: Get session + provider token
      setPhase('Conectando con tu cuenta de Gmail...')
      setProgress(10)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesion activa. Por favor inicia sesion de nuevo.')

      // provider_token from session (only available right after login)
      // Fallback 1: our custom localStorage key saved at auth callback
      // Fallback 2: read directly from Supabase's session storage
      let providerToken = session.provider_token
      if (!providerToken) {
        const stored = localStorage.getItem('cancelaia_gmail_token')
        const exp = Number(localStorage.getItem('cancelaia_gmail_token_exp') || 0)
        if (stored && Date.now() < exp) {
          providerToken = stored
        }
      }
      if (!providerToken) {
        try {
          const rawSession = localStorage.getItem('sb-adjsmbeygddxpjsemctp-auth-token')
          if (rawSession) {
            const parsed = JSON.parse(rawSession)
            providerToken = parsed?.provider_token || null
          }
        } catch { /* ignore parse errors */ }
      }

      // Phase 2: Searching
      setPhase('Buscando emails de suscripciones y recibos...')
      setProgress(25)
      await new Promise(r => setTimeout(r, 500))

      // Phase 3: Scanning
      setPhase('Escaneando tu bandeja de entrada...')
      setProgress(45)

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider_token: providerToken }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Error al escanear emails')
      }

      // Phase 4: AI analysis
      setPhase('Analizando con IA...')
      setProgress(75)
      await new Promise(r => setTimeout(r, 400))

      const data = await res.json()
      setEmailCount(data.scanned_emails || 0)
      setUsedGmail(data.used_real_gmail || false)

      // Phase 5: Done
      setPhase('Escaneo completado')
      setProgress(100)
      setResults(data.subscriptions || [])

    } catch (err: any) {
      setError(err.message || 'Error durante el escaneo')
    } finally {
      setScanning(false)
    }
  }

  async function saveResults() {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); return }

    for (const sub of results) {
      await supabase.from('cancelaia_subscriptions').upsert({
        user_id: session.user.id,
        name: sub.name,
        price: sub.price,
        currency: sub.currency || 'EUR',
        period: sub.period || 'monthly',
        status: 'active',
        category: sub.category,
        confidence: sub.confidence,
        source_email: sub.detected_from || null,
        detected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,name' })
    }

    router.push('/dashboard')
  }

  const totalMonthly = results.reduce((sum, r) => {
    return sum + (r.period === 'yearly' ? r.price / 12 : r.price)
  }, 0)

  return (
    <>
      <div className="dash-header">
        <div>
          <h1>Escanear emails</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Detecta automaticamente todas tus suscripciones activas
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          {/* Scanner animation area */}
          <div style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {scanning && (
              <div style={{
                position: 'absolute',
                top: 0, left: '-100%',
                width: '200%', height: 2,
                background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                animation: 'scan-line 2s linear infinite',
              }} />
            )}

            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
              background: scanning ? 'var(--primary-soft)' : 'var(--bg-elevated)',
              border: `2px solid ${scanning ? 'var(--primary)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 42, transition: 'all 0.3s',
              animation: scanning ? 'pulse-glow 2s ease-in-out infinite' : 'none',
            }}>
              {scanning ? '🔍' : '📧'}
            </div>

            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', marginBottom: 12 }}>
              {scanning ? phase : 'Listo para escanear'}
            </h2>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 10, margin: '16px 0',
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                color: '#F43F5E', fontSize: '0.85rem', textAlign: 'left',
              }}>
                <strong>Error:</strong> {error}
                {error.includes('sesion') && (
                  <div style={{ marginTop: 8 }}>
                    <a href="/login" style={{ color: '#7C3AED', textDecoration: 'underline' }}>
                      Volver a iniciar sesion →
                    </a>
                  </div>
                )}
              </div>
            )}

            {scanning ? (
              <div style={{ marginTop: 24 }}>
                <div style={{
                  height: 6, borderRadius: 3, background: 'var(--bg-elevated)',
                  overflow: 'hidden', marginBottom: 12,
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: 'var(--gradient-primary)',
                    width: `${progress}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {progress}% completado
                </p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', margin: '0 auto 32px', maxWidth: 420, lineHeight: 1.6 }}>
                  Nuestra IA analizara tus emails de los ultimos 12 meses para detectar
                  recibos, renovaciones y pagos recurrentes de suscripciones.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={startScan}
                  style={{ minWidth: 200 }}
                >
                  🔍 Iniciar escaneo
                </button>

                <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 36 }}>
                  {[
                    { icon: '🔒', text: 'Solo leemos recibos' },
                    { icon: '⚡', text: 'Menos de 60 seg' },
                    { icon: '🤖', text: 'IA detecta todo' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.text}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info box */}
          {!scanning && !error && (
            <div style={{
              padding: '16px 20px', borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Como funciona:</strong> Buscamos en tu Gmail emails
              de servicios como Netflix, Spotify, Adobe, Amazon, Apple y otros 50+ servicios. Solo leemos el
              remitente, asunto y un extracto — nunca el contenido personal de tus emails.
            </div>
          )}
        </div>
      ) : (
        /* Results view */
        <div>
          {/* Summary banner */}
          <div style={{
            padding: '20px 24px', borderRadius: 'var(--radius-lg)',
            background: usedGmail ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${usedGmail ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
            marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 28 }}>{usedGmail ? '✅' : '⚠️'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>
                {results.length} suscripciones detectadas
                {usedGmail && emailCount > 0 && ` en ${emailCount} emails`}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {usedGmail
                  ? `Gasto mensual estimado: ${totalMonthly.toFixed(2)}€/mes`
                  : 'Modo demo — inicia sesion de nuevo para escanear tu Gmail real'
                }
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={saveResults}
              disabled={saving}
              style={{ whiteSpace: 'nowrap' }}
            >
              {saving ? 'Guardando...' : '💾 Guardar y continuar'}
            </button>
          </div>

          {/* Results list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((sub, i) => {
              const color = getServiceColor(sub.name)
              const icon = CATEGORY_ICONS[sub.category] || '📦'
              const monthlyPrice = sub.period === 'yearly' ? sub.price / 12 : sub.price

              return (
                <div key={i} className="sub-card" style={{ padding: '14px 18px' }}>
                  <div className="sub-logo" style={{ background: `${color}18`, color, fontWeight: 700 }}>
                    {sub.name[0]}
                  </div>
                  <div className="sub-info">
                    <div className="sub-name">{sub.name}</div>
                    <div className="sub-detail">
                      {icon} {sub.category}
                      {' · '}
                      {sub.period === 'yearly' ? 'Anual' : sub.period === 'weekly' ? 'Semanal' : 'Mensual'}
                      {' · '}
                      <span style={{ color: 'var(--success)', fontSize: '0.78rem' }}>
                        IA: {Math.round(sub.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                      {sub.price.toFixed(2)}{sub.currency === 'USD' ? '$' : '€'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      /{sub.period === 'yearly' ? 'año' : sub.period === 'weekly' ? 'sem' : 'mes'}
                    </div>
                    {sub.period === 'yearly' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({monthlyPrice.toFixed(2)}€/mes)
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={saveResults}
              disabled={saving}
            >
              {saving ? 'Guardando...' : `💾 Guardar ${results.length} suscripciones`}
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 12 }}>
              Podras gestionar y cancelar cada suscripcion desde el panel
            </p>
          </div>
        </div>
      )}
    </>
  )
}

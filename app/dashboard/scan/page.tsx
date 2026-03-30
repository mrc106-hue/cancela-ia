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
}

export default function ScanPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('')
  const [results, setResults] = useState<ScanResult[]>([])
  const [error, setError] = useState('')

  async function startScan() {
    setScanning(true)
    setError('')
    setProgress(0)

    try {
      // Phase 1: Connect
      setPhase('Conectando con Gmail...')
      setProgress(10)
      await new Promise(r => setTimeout(r, 800))

      // Phase 2: Fetching
      setPhase('Buscando emails de suscripciones...')
      setProgress(30)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesion activa')

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Error escaneando emails')
      }

      // Phase 3: Analyzing
      setPhase('Analizando con IA...')
      setProgress(60)

      const data = await res.json()
      setProgress(80)

      // Phase 4: Saving
      setPhase('Guardando resultados...')
      setResults(data.subscriptions || [])
      setProgress(100)
      setPhase('Escaneo completado')

    } catch (err: any) {
      setError(err.message || 'Error durante el escaneo')
    } finally {
      setScanning(false)
    }
  }

  async function saveResults() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    for (const sub of results) {
      await supabase.from('cancelaia_subscriptions').upsert({
        user_id: session.user.id,
        name: sub.name,
        price: sub.price,
        currency: sub.currency || 'EUR',
        period: sub.period || 'monthly',
        status: 'active',
        category: sub.category,
        detected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,name' })
    }

    router.push('/dashboard')
  }

  return (
    <>
      <div className="dash-header">
        <div>
          <h1>Escanear emails</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Detecta automaticamente todas tus suscripciones
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="scan-container" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          {scanning && <div className="scan-line active" />}

          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
            background: scanning ? 'var(--primary-soft)' : 'var(--bg-elevated)',
            border: `2px solid ${scanning ? 'var(--primary)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, transition: 'all 0.3s',
            animation: scanning ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          }}>
            {scanning ? '🔍' : '📧'}
          </div>

          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', marginBottom: 12 }}>
            {scanning ? phase : 'Listo para escanear'}
          </h2>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              color: '#F43F5E', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {scanning ? (
            <>
              <div style={{
                height: 6, borderRadius: 3, background: 'var(--bg-elevated)',
                overflow: 'hidden', margin: '24px 0',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: 'var(--gradient-primary)',
                  width: `${progress}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {progress}% completado
              </p>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
                Nuestra IA analizara tus emails para detectar recibos de suscripciones, renovaciones y pagos recurrentes.
              </p>
              <button className="btn btn-primary btn-lg" onClick={startScan}>
                🔍 Iniciar escaneo
              </button>
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32 }}>
                {[
                  { icon: '🔒', text: 'Solo leemos recibos' },
                  { icon: '⚡', text: 'Menos de 30 segundos' },
                  { icon: '🤖', text: 'Deteccion con IA' },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Results view */
        <div>
          <div style={{
            padding: '20px 24px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <div style={{ fontWeight: 600 }}>
                {results.length} suscripciones detectadas
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Gasto total: {results.reduce((s, r) => s + r.price, 0).toFixed(2)}€/mes
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={saveResults}>
              Guardar y continuar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((sub, i) => (
              <div key={i} className="sub-card">
                <div className="sub-logo">{sub.name[0]}</div>
                <div className="sub-info">
                  <div className="sub-name">{sub.name}</div>
                  <div className="sub-detail">{sub.category} · Confianza: {Math.round(sub.confidence * 100)}%</div>
                </div>
                <div className="sub-price">
                  {sub.price.toFixed(2)}€
                  <div className="sub-price-period">/{sub.period === 'yearly' ? 'anyo' : 'mes'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

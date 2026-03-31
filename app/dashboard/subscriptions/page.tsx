'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { getCancelInfo, DIFFICULTY_LABELS } from '../../../lib/cancel-urls'

type Subscription = {
  id: string
  name: string
  price: number
  currency: string
  period: string
  status: 'active' | 'cancelled' | 'paused'
  category?: string
  detected_at: string
  cancelled_at?: string
  next_renewal?: string
  confidence?: number
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

function getServiceColor(name: string): string {
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color
  }
  return '#7C3AED'
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all')
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [markingDone, setMarkingDone] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('cancelaia_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('status', { ascending: true })
        .order('price', { ascending: false })
      setSubs(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function markCancelled(id: string) {
    setMarkingDone(true)
    await supabase.from('cancelaia_subscriptions').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('id', id)
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s))
    setMarkingDone(false)
    setSelectedSub(null)
  }

  const filtered = subs.filter(s => filter === 'all' || s.status === filter)
  const activeSubs = subs.filter(s => s.status === 'active')
  const cancelledSubs = subs.filter(s => s.status === 'cancelled')
  const totalMonthly = activeSubs.reduce((sum, s) => sum + (s.period === 'yearly' ? s.price / 12 : s.price), 0)
  const totalSaved = cancelledSubs.reduce((sum, s) => sum + (s.period === 'yearly' ? s.price / 12 : s.price), 0)

  const filters = [
    { key: 'all' as const, label: 'Todas', count: subs.length },
    { key: 'active' as const, label: 'Activas', count: activeSubs.length },
    { key: 'cancelled' as const, label: 'Canceladas', count: cancelledSubs.length },
  ]

  // Cancel info for selected subscription
  const cancelInfo = selectedSub ? getCancelInfo(selectedSub.name) : null

  return (
    <>
      <div className="dash-header">
        <div>
          <h1>Suscripciones</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {activeSubs.length} activas · {totalMonthly.toFixed(2)}€/mes
            {totalSaved > 0 && ` · Ahorrado: ${totalSaved.toFixed(2)}€/mes`}
          </p>
        </div>
        <Link href="/dashboard/scan" className="btn btn-secondary">
          🔍 Nuevo escaneo
        </Link>
      </div>

      {/* Summary cards */}
      {subs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
          <div style={{
            padding: '16px 20px', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>{activeSubs.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Activas</div>
          </div>
          <div style={{
            padding: '16px 20px', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F59E0B' }}>{totalMonthly.toFixed(2)}€</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Gasto/mes</div>
          </div>
          <div style={{
            padding: '16px 20px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--success)' }}>{totalSaved.toFixed(2)}€</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Ahorro/mes</div>
          </div>
          <div style={{
            padding: '16px 20px', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#06B6D4' }}>{(totalMonthly * 12).toFixed(0)}€</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Gasto anual</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-glass btn-sm'}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
            animation: 'spin-slow 1s linear infinite', margin: '0 auto 16px',
          }} />
          Cargando suscripciones...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60,
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {filter === 'cancelled' ? '🎉' : '📭'}
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: filter === 'all' ? 24 : 0 }}>
            {filter === 'all'
              ? 'No tienes suscripciones guardadas todavia'
              : filter === 'cancelled'
                ? 'No has cancelado ninguna suscripcion aun'
                : 'No hay suscripciones activas'}
          </p>
          {filter === 'all' && (
            <Link href="/dashboard/scan" className="btn btn-primary">
              🔍 Escanear emails
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(sub => {
            const color = getServiceColor(sub.name)
            const icon = CATEGORY_ICONS[sub.category || 'Otro'] || '📦'
            const monthlyPrice = sub.period === 'yearly' ? sub.price / 12 : sub.price
            const isCancelled = sub.status === 'cancelled'
            const hasCancelInfo = !!getCancelInfo(sub.name)

            return (
              <div
                key={sub.id}
                className="sub-card"
                style={{ opacity: isCancelled ? 0.55 : 1, padding: '14px 18px' }}
              >
                <div className="sub-logo" style={{ background: `${color}18`, color, fontWeight: 700 }}>
                  {sub.name[0]}
                </div>
                <div className="sub-info">
                  <div className="sub-name">{sub.name}</div>
                  <div className="sub-detail">
                    {icon} {sub.category || 'General'}
                    {' · '}
                    {isCancelled
                      ? `Cancelada ${sub.cancelled_at ? new Date(sub.cancelled_at).toLocaleDateString('es') : ''}`
                      : sub.next_renewal
                        ? `Renueva: ${new Date(sub.next_renewal).toLocaleDateString('es')}`
                        : sub.period === 'monthly' ? 'Mensual' : sub.period === 'yearly' ? 'Anual' : 'Semanal'
                    }
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {sub.price.toFixed(2)}{sub.currency === 'USD' ? '$' : '€'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    /{sub.period === 'yearly' ? 'año' : sub.period === 'weekly' ? 'sem' : 'mes'}
                  </div>
                  {sub.period === 'yearly' && !isCancelled && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({monthlyPrice.toFixed(2)}€/mes)
                    </div>
                  )}
                </div>
                {!isCancelled ? (
                  <button
                    className="btn-cancel"
                    onClick={() => setSelectedSub(sub)}
                    title={hasCancelInfo ? 'Ver instrucciones de cancelacion' : 'Cancelar'}
                  >
                    {hasCancelInfo ? '🚫 Cancelar' : 'Cancelar'}
                  </button>
                ) : (
                  <span className="badge badge-success">Ahorrado</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {selectedSub && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSub(null) }}
        >
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 28px',
            maxWidth: 500, width: '100%',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: `${getServiceColor(selectedSub.name)}18`,
                color: getServiceColor(selectedSub.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700,
              }}>
                {selectedSub.name[0]}
              </div>
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', marginBottom: 4 }}>
                  Cancelar {selectedSub.name}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {selectedSub.price.toFixed(2)}€/{selectedSub.period === 'yearly' ? 'año' : 'mes'}
                  {selectedSub.period === 'yearly' && ` · ${(selectedSub.price / 12).toFixed(2)}€/mes`}
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {cancelInfo ? (
              <>
                {/* Difficulty badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dificultad:</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                    background: `${DIFFICULTY_LABELS[cancelInfo.difficulty].color}18`,
                    color: DIFFICULTY_LABELS[cancelInfo.difficulty].color,
                    border: `1px solid ${DIFFICULTY_LABELS[cancelInfo.difficulty].color}40`,
                  }}>
                    {DIFFICULTY_LABELS[cancelInfo.difficulty].label}
                  </span>
                </div>

                {/* Steps */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                    Pasos para cancelar:
                  </p>
                  <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cancelInfo.steps.map((step, i) => (
                      <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--primary-soft)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700,
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 3 }}>
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Note */}
                {cancelInfo.note && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 10, marginBottom: 20,
                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                    fontSize: '0.82rem', color: '#F59E0B', lineHeight: 1.5,
                  }}>
                    ⚠️ {cancelInfo.note}
                  </div>
                )}

                {/* CTA buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a
                    href={cancelInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                  >
                    🌐 Ir a cancelar
                  </a>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => markCancelled(selectedSub.id)}
                    disabled={markingDone}
                  >
                    {markingDone ? '...' : '✅ Ya cancelé'}
                  </button>
                </div>
              </>
            ) : (
              /* No cancel info — generic */
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
                  No tenemos instrucciones especificas para <strong>{selectedSub.name}</strong>.
                  Busca "cancelar {selectedSub.name}" en Google o accede a la configuracion de tu cuenta en el servicio.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={`https://www.google.com/search?q=como+cancelar+${encodeURIComponent(selectedSub.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                  >
                    🔍 Buscar instrucciones
                  </a>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => markCancelled(selectedSub.id)}
                    disabled={markingDone}
                  >
                    {markingDone ? '...' : '✅ Ya cancelé'}
                  </button>
                </div>
              </>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
              Haz clic en "Ya cancelé" cuando hayas completado la cancelacion en el servicio
            </p>
          </div>
        </div>
      )}
    </>
  )
}

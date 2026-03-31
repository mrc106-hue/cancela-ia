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

  // Single subscription modal (legacy individual flow)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [markingDone, setMarkingDone] = useState(false)

  // Multi-select state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [showBulkPanel, setShowBulkPanel] = useState(false)
  // Track which subs in the bulk panel have been marked cancelled
  const [bulkCancelled, setBulkCancelled] = useState<Set<string>>(new Set())
  const [bulkMarking, setBulkMarking] = useState<Set<string>>(new Set())

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

  async function markBulkCancelled(id: string) {
    setBulkMarking(prev => new Set(prev).add(id))
    await supabase.from('cancelaia_subscriptions').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('id', id)
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s))
    setBulkCancelled(prev => new Set(prev).add(id))
    setBulkMarking(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function toggleCheck(id: string) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = subs.filter(s => filter === 'all' || s.status === filter)
  const activeSubs = subs.filter(s => s.status === 'active')
  const cancelledSubs = subs.filter(s => s.status === 'cancelled')
  const totalMonthly = activeSubs.reduce((sum, s) => sum + (s.period === 'yearly' ? s.price / 12 : s.price), 0)
  const totalSaved = cancelledSubs.reduce((sum, s) => sum + (s.period === 'yearly' ? s.price / 12 : s.price), 0)

  const activeFiltered = filtered.filter(s => s.status === 'active')
  const allActiveChecked = activeFiltered.length > 0 && activeFiltered.every(s => checkedIds.has(s.id))

  function toggleSelectAll() {
    if (allActiveChecked) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(activeFiltered.map(s => s.id)))
    }
  }

  const checkedSubs = subs.filter(s => checkedIds.has(s.id))

  const filters = [
    { key: 'all' as const, label: 'Todas', count: subs.length },
    { key: 'active' as const, label: 'Activas', count: activeSubs.length },
    { key: 'cancelled' as const, label: 'Canceladas', count: cancelledSubs.length },
  ]

  // Cancel info for single subscription modal
  const cancelInfo = selectedSub ? getCancelInfo(selectedSub.name) : null

  function openBulkPanel() {
    setBulkCancelled(new Set())
    setBulkMarking(new Set())
    setShowBulkPanel(true)
  }

  function closeBulkPanel() {
    setShowBulkPanel(false)
    // Remove from checkedIds those that were cancelled
    if (bulkCancelled.size > 0) {
      setCheckedIds(prev => {
        const next = new Set(prev)
        bulkCancelled.forEach(id => next.delete(id))
        return next
      })
    }
  }

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

      {/* Filter tabs + select all */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-glass btn-sm'}
          >
            {f.label} ({f.count})
          </button>
        ))}
        {activeFiltered.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="btn btn-glass btn-sm"
            style={{ marginLeft: 'auto', fontSize: '0.8rem' }}
          >
            {allActiveChecked ? '☑ Deseleccionar todo' : '☐ Seleccionar todas'}
          </button>
        )}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: checkedIds.size > 0 ? 90 : 0 }}>
          {filtered.map(sub => {
            const color = getServiceColor(sub.name)
            const icon = CATEGORY_ICONS[sub.category || 'Otro'] || '📦'
            const monthlyPrice = sub.period === 'yearly' ? sub.price / 12 : sub.price
            const isCancelled = sub.status === 'cancelled'
            const hasCancelInfo = !!getCancelInfo(sub.name)
            const isChecked = checkedIds.has(sub.id)

            return (
              <div
                key={sub.id}
                className="sub-card"
                style={{
                  opacity: isCancelled ? 0.55 : 1,
                  padding: '14px 18px',
                  outline: isChecked ? '2px solid var(--primary)' : 'none',
                  transition: 'outline 0.15s',
                }}
              >
                {/* Checkbox for active subs */}
                {!isCancelled && (
                  <div
                    onClick={() => toggleCheck(sub.id)}
                    style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                      border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                      background: isChecked ? 'var(--primary)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', marginRight: 4,
                    }}
                  >
                    {isChecked && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                )}
                <div className="sub-logo" style={{ background: `${color}18`, color, fontWeight: 700 }}>
                  {isCancelled ? '✓' : sub.name[0]}
                </div>
                <div className="sub-info">
                  <div className="sub-name" style={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                    {sub.name}
                  </div>
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

      {/* Floating action bar when items are selected */}
      {checkedIds.size > 0 && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--bg-card)', border: '1px solid var(--primary)',
          borderRadius: 'var(--radius-xl)', padding: '14px 24px',
          boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
          backdropFilter: 'blur(12px)',
          minWidth: 320,
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
              {checkedIds.size}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {' '}suscripci{checkedIds.size === 1 ? 'ón' : 'ones'} seleccionada{checkedIds.size === 1 ? '' : 's'}
            </span>
          </div>
          <button
            className="btn btn-glass btn-sm"
            onClick={() => setCheckedIds(new Set())}
            style={{ fontSize: '0.8rem' }}
          >
            Limpiar
          </button>
          <button
            className="btn btn-primary"
            onClick={openBulkPanel}
          >
            🚫 Cancelar seleccionadas
          </button>
        </div>
      )}

      {/* Single subscription cancel modal */}
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

            {/* Honest disclaimer */}
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5,
            }}>
              ℹ️ <strong>Cancelacion manual:</strong> Te llevamos directamente a la pagina oficial del servicio para que tu completes la cancelacion. No cancelamos por ti.
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
                    href={`https://www.google.com/search?q=como+cancelar+suscripcion+${encodeURIComponent(selectedSub.name)}`}
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
              Haz clic en "Ya cancelé" solo cuando hayas completado la cancelacion en el servicio
            </p>
          </div>
        </div>
      )}

      {/* Bulk cancel panel */}
      {showBulkPanel && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeBulkPanel() }}
        >
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 24px',
            maxWidth: 560, width: '100%',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', flex: 1 }}>
                Cancelar {checkedSubs.length} suscripci{checkedSubs.length === 1 ? 'on' : 'ones'}
              </h2>
              <button
                onClick={closeBulkPanel}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Honest disclaimer */}
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5,
            }}>
              ℹ️ <strong>Proceso manual guiado:</strong> Para cada servicio te damos el enlace directo y los pasos. Tu eres quien cancela en cada plataforma. Cuando lo hayas hecho, marca como cancelado para actualizar tu lista.
            </div>

            {/* List of selected subscriptions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {checkedSubs.map(sub => {
                const color = getServiceColor(sub.name)
                const info = getCancelInfo(sub.name)
                const isDone = bulkCancelled.has(sub.id) || sub.status === 'cancelled'
                const isMarking = bulkMarking.has(sub.id)

                return (
                  <div
                    key={sub.id}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                      background: isDone ? 'rgba(16,185,129,0.04)' : 'var(--bg-secondary)',
                      padding: '16px',
                      transition: 'all 0.3s',
                    }}
                  >
                    {/* Sub header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isDone ? 0 : 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: `${color}18`, color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 17, fontWeight: 700,
                      }}>
                        {isDone ? '✓' : sub.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 600, fontSize: '0.95rem',
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}>
                          {sub.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {sub.price.toFixed(2)}€/{sub.period === 'yearly' ? 'año' : 'mes'}
                          {info && (
                            <span style={{
                              marginLeft: 8, padding: '1px 7px', borderRadius: 12,
                              fontSize: '0.72rem', fontWeight: 600,
                              background: `${DIFFICULTY_LABELS[info.difficulty].color}18`,
                              color: DIFFICULTY_LABELS[info.difficulty].color,
                            }}>
                              {DIFFICULTY_LABELS[info.difficulty].label}
                            </span>
                          )}
                        </div>
                      </div>
                      {isDone && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 20,
                          background: 'rgba(16,185,129,0.12)', color: '#10B981',
                          fontSize: '0.78rem', fontWeight: 600,
                        }}>
                          Cancelada
                        </span>
                      )}
                    </div>

                    {!isDone && info && (
                      <>
                        {/* Steps (compact) */}
                        <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                          {info.steps.map((step, i) => (
                            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{
                                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--primary-soft)', color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700,
                              }}>
                                {i + 1}
                              </span>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 2 }}>
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>

                        {info.note && (
                          <div style={{
                            padding: '8px 12px', borderRadius: 8, marginBottom: 12,
                            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                            fontSize: '0.78rem', color: '#F59E0B', lineHeight: 1.5,
                          }}>
                            ⚠️ {info.note}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                          <a
                            href={info.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                          >
                            🌐 Ir a cancelar
                          </a>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => markBulkCancelled(sub.id)}
                            disabled={isMarking}
                          >
                            {isMarking ? '...' : '✅ Ya cancelé'}
                          </button>
                        </div>
                      </>
                    )}

                    {!isDone && !info && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={`https://www.google.com/search?q=como+cancelar+suscripcion+${encodeURIComponent(sub.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.8rem' }}
                        >
                          🔍 Buscar como cancelar
                        </a>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => markBulkCancelled(sub.id)}
                          disabled={isMarking}
                        >
                          {isMarking ? '...' : '✅ Ya cancelé'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary footer */}
            {bulkCancelled.size > 0 && (
              <div style={{
                marginTop: 20, padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981', marginBottom: 4 }}>
                  {bulkCancelled.size} cancelada{bulkCancelled.size === 1 ? '' : 's'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {(() => {
                    const saved = subs
                      .filter(s => bulkCancelled.has(s.id))
                      .reduce((sum, s) => sum + (s.period === 'yearly' ? s.price / 12 : s.price), 0)
                    return `Ahorraras ${saved.toFixed(2)}€/mes`
                  })()}
                </div>
              </div>
            )}

            <button
              className="btn btn-glass"
              style={{ width: '100%', marginTop: 16 }}
              onClick={closeBulkPanel}
            >
              {bulkCancelled.size === checkedSubs.length && checkedSubs.length > 0
                ? '✅ Listo, cerrar'
                : 'Cerrar'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all')
  const [cancelling, setCancelling] = useState<string | null>(null)

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

  async function handleCancel(id: string) {
    setCancelling(id)
    await supabase.from('cancelaia_subscriptions').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('id', id)
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s))
    setCancelling(null)
  }

  const filtered = subs.filter(s => filter === 'all' || s.status === filter)
  const totalActive = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.period === 'yearly' ? s.price / 12 : s.price), 0)

  const filters = [
    { key: 'all', label: 'Todas', count: subs.length },
    { key: 'active', label: 'Activas', count: subs.filter(s => s.status === 'active').length },
    { key: 'cancelled', label: 'Canceladas', count: subs.filter(s => s.status === 'cancelled').length },
  ] as const

  return (
    <>
      <div className="dash-header">
        <div>
          <h1>Suscripciones</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {subs.filter(s => s.status === 'active').length} activas · {totalActive.toFixed(2)}€/mes
          </p>
        </div>
        <Link href="/dashboard/scan" className="btn btn-secondary">
          🔍 Nuevo escaneo
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
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
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin-slow 1s linear infinite', margin: '0 auto 16px' }} />
          Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60,
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <p style={{ color: 'var(--text-muted)' }}>No hay suscripciones en esta categoria</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(sub => (
            <div key={sub.id} className="sub-card" style={{ opacity: sub.status === 'cancelled' ? 0.5 : 1 }}>
              <div className="sub-logo" style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
              }}>
                {sub.name[0]}
              </div>
              <div className="sub-info">
                <div className="sub-name">{sub.name}</div>
                <div className="sub-detail">
                  {sub.category || 'General'} ·{' '}
                  {sub.status === 'cancelled'
                    ? `Cancelada ${sub.cancelled_at ? new Date(sub.cancelled_at).toLocaleDateString('es') : ''}`
                    : sub.period === 'monthly' ? 'Mensual' : 'Anual'
                  }
                </div>
              </div>
              <div className="sub-price">
                {sub.price.toFixed(2)}€
                <div className="sub-price-period">/{sub.period === 'yearly' ? 'anyo' : 'mes'}</div>
              </div>
              {sub.status === 'active' ? (
                <button
                  className="btn-cancel"
                  onClick={() => handleCancel(sub.id)}
                  disabled={cancelling === sub.id}
                >
                  {cancelling === sub.id ? '...' : 'Cancelar'}
                </button>
              ) : (
                <span className="badge badge-success">Ahorrado</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

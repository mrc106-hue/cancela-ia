'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type Subscription = {
  id: string
  name: string
  price: number
  currency: string
  period: string
  status: 'active' | 'cancelled' | 'paused'
  detected_at: string
  next_renewal?: string
  category?: string
}

export default function Dashboard() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUser(session.user)

      const { data } = await supabase
        .from('cancelaia_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setSubs(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const activeSubs = subs.filter(s => s.status === 'active')
  const cancelledSubs = subs.filter(s => s.status === 'cancelled')
  const totalMonthly = activeSubs.reduce((sum, s) => {
    if (s.period === 'yearly') return sum + (s.price / 12)
    return sum + s.price
  }, 0)
  const totalSaved = cancelledSubs.reduce((sum, s) => {
    if (s.period === 'yearly') return sum + (s.price / 12)
    return sum + s.price
  }, 0)

  return (
    <>
      <div className="dash-header">
        <div>
          <h1>Panel de control</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Bienvenido, {user?.user_metadata?.full_name || 'usuario'}
          </p>
        </div>
        <Link href="/dashboard/scan" className="btn btn-primary">
          🔍 Escanear emails
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value purple">{activeSubs.length}</div>
          <div className="stat-label">Suscripciones activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value amber">{totalMonthly.toFixed(2)}€</div>
          <div className="stat-label">Gasto mensual</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">{totalSaved.toFixed(2)}€</div>
          <div className="stat-label">Ahorro mensual</div>
        </div>
        <div className="stat-card">
          <div className="stat-value cyan">{cancelledSubs.length}</div>
          <div className="stat-label">Canceladas</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin-slow 1s linear infinite', margin: '0 auto 16px' }} />
          Cargando suscripciones...
        </div>
      ) : subs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 80,
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', marginBottom: 8 }}>
            Sin suscripciones detectadas
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Escanea tu correo para detectar automaticamente todas tus suscripciones activas
          </p>
          <Link href="/dashboard/scan" className="btn btn-primary btn-lg">
            🔍 Escanear mis emails
          </Link>
        </div>
      ) : (
        <>
          {/* Active subscriptions */}
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', marginBottom: 16 }}>
            Suscripciones activas ({activeSubs.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {activeSubs.map(sub => (
              <SubscriptionCard key={sub.id} sub={sub} onCancel={async () => {
                await supabase.from('cancelaia_subscriptions').update({ status: 'cancelled' }).eq('id', sub.id)
                setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'cancelled' as const } : s))
              }} />
            ))}
          </div>

          {cancelledSubs.length > 0 && (
            <>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-muted)' }}>
                Canceladas ({cancelledSubs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.6 }}>
                {cancelledSubs.map(sub => (
                  <SubscriptionCard key={sub.id} sub={sub} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

function SubscriptionCard({ sub, onCancel }: { sub: any; onCancel?: () => void }) {
  const colors: Record<string, string> = {
    Netflix: '#E50914', Spotify: '#1DB954', Amazon: '#FF9900', Disney: '#113CCF',
    Adobe: '#FF0000', Apple: '#555', Google: '#4285F4', Microsoft: '#00A4EF',
    YouTube: '#FF0000', Figma: '#A259FF', ChatGPT: '#10A37F', Notion: '#fff',
  }
  const color = Object.entries(colors).find(([k]) => sub.name.includes(k))?.[1] || 'var(--primary)'

  return (
    <div className="sub-card">
      <div className="sub-logo" style={{ background: `${color}15`, color }}>
        {sub.name[0]}
      </div>
      <div className="sub-info">
        <div className="sub-name">{sub.name}</div>
        <div className="sub-detail">
          {sub.status === 'cancelled' ? 'Cancelada' : sub.next_renewal ? `Renueva: ${new Date(sub.next_renewal).toLocaleDateString('es')}` : sub.period === 'monthly' ? 'Mensual' : 'Anual'}
        </div>
      </div>
      <div className="sub-price">
        {sub.price.toFixed(2)}€
        <div className="sub-price-period">/{sub.period === 'yearly' ? 'anyo' : 'mes'}</div>
      </div>
      {sub.status === 'active' && onCancel && (
        <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
      )}
      {sub.status === 'cancelled' && (
        <span className="badge badge-success">Ahorrado</span>
      )}
    </div>
  )
}

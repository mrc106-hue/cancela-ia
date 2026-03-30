'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type User = { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      setUser(session.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login')
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin-slow 1s linear infinite' }} />
    </div>
  )

  const navItems = [
    { href: '/dashboard', label: 'Panel', icon: '📊' },
    { href: '/dashboard/scan', label: 'Escanear', icon: '🔍' },
    { href: '/dashboard/subscriptions', label: 'Suscripciones', icon: '📋' },
    { href: '/dashboard/settings', label: 'Ajustes', icon: '⚙️' },
  ]

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo">CancelaIA</Link>
        <nav className="dash-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', marginBottom: 8 }}>
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                style={{ width: 32, height: 32, borderRadius: '50%' }}
              />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--primary-soft)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'var(--primary)',
              }}>
                {(user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.user_metadata?.full_name || user?.email}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Plan Gratis</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="dash-nav-item"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="dash-main">
        {children}
      </main>
    </div>
  )
}

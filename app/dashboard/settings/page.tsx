'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUser(session.user)

      const { data } = await supabase
        .from('cancelaia_users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando...</div>
  )

  return (
    <>
      <div className="dash-header">
        <h1>Ajustes</h1>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 20 }}>Perfil</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" style={{ width: 56, height: 56, borderRadius: '50%' }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: 'var(--primary)',
            }}>
              {(user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {user?.user_metadata?.full_name || user?.email}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 20 }}>Plan actual</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 8 }}>
              {(profile?.plan || 'free').toUpperCase()}
            </span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
              {profile?.plan === 'free'
                ? 'Escaneo basico, hasta 5 suscripciones'
                : 'Escaneo ilimitado, cancelacion con un clic'
              }
            </p>
          </div>
          {profile?.plan === 'free' && (
            <button className="btn btn-primary">Actualizar a Pro</button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 20 }}>Notificaciones</h3>
        {[
          { label: 'Alertas de renovacion', desc: 'Recibe un aviso 3 dias antes de cada renovacion' },
          { label: 'Informe mensual', desc: 'Resumen mensual de gastos y ahorro' },
          { label: 'Nuevas suscripciones', desc: 'Notificacion cuando se detecta una nueva suscripcion' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{item.desc}</div>
            </div>
            <div style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
              background: 'var(--primary)', padding: 2, transition: 'background 0.2s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                transform: 'translateX(20px)', transition: 'transform 0.2s',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'rgba(244,63,94,0.2)' }}>
        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 12, color: 'var(--accent)' }}>Zona de peligro</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
          Eliminar tu cuenta borrara todos tus datos permanentemente.
        </p>
        <button className="btn-cancel">Eliminar cuenta</button>
      </div>
    </>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/gmail.readonly',
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-card">
          <Link href="/" className="nav-logo" style={{ display: 'inline-block', marginBottom: 40, fontSize: '1.5rem' }}>
            CancelaIA
          </Link>
          <h1>Bienvenido de nuevo</h1>
          <p>Conecta tu cuenta para gestionar tus suscripciones</p>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              color: '#F43F5E', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-google btn-lg"
            style={{ width: '100%', marginBottom: 16 }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
            Al continuar aceptas nuestros{' '}
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terminos de uso</a> y{' '}
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Politica de privacidad</a>
          </p>

          <div style={{ marginTop: 40, padding: '16px 20px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Acceso seguro a Gmail</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Solo leemos recibos de suscripciones. Nunca accedemos a emails personales, contactos ni otra informacion.
            </p>
          </div>
        </div>
      </div>

      <div className="login-right">
        {/* Right panel visual */}
        <div style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 32px',
            background: 'var(--primary-soft)', border: '2px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, animation: 'float 6s ease-in-out infinite',
          }}>
            💰
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 700, marginBottom: 16 }}>
            Ahorra hasta <span style={{ color: 'var(--success)' }}>847€</span> al anyo
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Nuestros usuarios ahorran de media 70€ al mes cancelando suscripciones que no necesitan.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32 }}>
            {[
              { icon: '⚡', label: '30 segundos' },
              { icon: '🔒', label: '100% seguro' },
              { icon: '✨', label: 'Gratis' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

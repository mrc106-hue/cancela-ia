'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { searchParams } = new URL(window.location.href)
      const code = searchParams.get('code')

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Save provider_token to localStorage so it survives session refreshes
        // Google access tokens expire in 1 hour but are valid for scanning
        if (session.provider_token) {
          localStorage.setItem('cancelaia_gmail_token', session.provider_token)
          localStorage.setItem('cancelaia_gmail_token_exp', String(Date.now() + 55 * 60 * 1000))
        }

        // Ensure user profile exists in DB
        const { data: existing } = await supabase
          .from('cancelaia_users')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (!existing) {
          await supabase.from('cancelaia_users').insert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            plan: 'free',
          })
        }

        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
        animation: 'spin-slow 1s linear infinite',
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Conectando tu cuenta...</p>
    </div>
  )
}

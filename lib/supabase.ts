import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization — evita crash en build time cuando las env vars no existen
let _supabase: SupabaseClient | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Missing SUPABASE env vars')
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Mantener export para compatibilidad — pero usar getter lazy
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop]
  }
})

// Server-side client with service role
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

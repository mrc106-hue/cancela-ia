-- ============================================================
-- CancelaIA — Schema completo
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- Usuarios
CREATE TABLE IF NOT EXISTS cancelaia_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  stripe_customer_id TEXT,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suscripciones detectadas
CREATE TABLE IF NOT EXISTS cancelaia_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES cancelaia_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  period TEXT DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly', 'weekly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused')),
  category TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  next_renewal TIMESTAMPTZ,
  source_email TEXT,
  confidence DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Historial de escaneos
CREATE TABLE IF NOT EXISTS cancelaia_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES cancelaia_users(id) ON DELETE CASCADE,
  emails_scanned INTEGER DEFAULT 0,
  subscriptions_found INTEGER DEFAULT 0,
  scan_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE cancelaia_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancelaia_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancelaia_scans ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "users_own_data" ON cancelaia_users FOR ALL USING (auth.uid() = id);
CREATE POLICY "subs_own_data" ON cancelaia_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "scans_own_data" ON cancelaia_scans FOR ALL USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "service_all_users" ON cancelaia_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_subs" ON cancelaia_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_scans" ON cancelaia_scans FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subs_user ON cancelaia_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON cancelaia_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_scans_user ON cancelaia_scans(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_cancelaia_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cancelaia_users_updated BEFORE UPDATE ON cancelaia_users
  FOR EACH ROW EXECUTE FUNCTION update_cancelaia_updated_at();
CREATE TRIGGER cancelaia_subs_updated BEFORE UPDATE ON cancelaia_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_cancelaia_updated_at();

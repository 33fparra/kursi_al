-- ============================================================
-- leku.al — Migración inicial
-- Ejecutar completo en: Supabase > SQL Editor
-- ============================================================

-- ── Tablas ──────────────────────────────────────────────────

-- Tasas diarias (una fila por par de monedas por día)
CREATE TABLE IF NOT EXISTS daily_rates (
  id         BIGSERIAL PRIMARY KEY,
  date       DATE        NOT NULL,
  base       CHAR(3)     NOT NULL,   -- 'EUR'
  target     CHAR(3)     NOT NULL,   -- 'ALL'
  rate       NUMERIC(12, 6) NOT NULL,
  source     TEXT        DEFAULT 'fawazahmed0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, base, target)
);

CREATE INDEX IF NOT EXISTS idx_daily_rates_date ON daily_rates (date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_rates_pair ON daily_rates (base, target);

-- Comisiones de proveedores de remesas
CREATE TABLE IF NOT EXISTS provider_fees (
  id         BIGSERIAL PRIMARY KEY,
  provider   TEXT           NOT NULL,  -- 'wise' | 'remitly' | 'bank'
  pair       TEXT           NOT NULL,  -- 'EUR_ALL'
  fee_pct    NUMERIC(5, 4),            -- 0.0095 = 0.95%
  fee_fixed  NUMERIC(8, 2),            -- comisión fija en moneda origen
  updated_at TIMESTAMPTZ    DEFAULT NOW(),
  UNIQUE (provider, pair)
);

-- Registro de clics en botones de afiliado
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id         BIGSERIAL PRIMARY KEY,
  provider   TEXT           NOT NULL,  -- 'wise' | 'remitly'
  amount     NUMERIC(10, 2),
  currency   CHAR(3),
  clicked_at TIMESTAMPTZ    DEFAULT NOW()
);

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE daily_rates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_fees    ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- daily_rates: lectura pública, escritura solo service_role
CREATE POLICY "daily_rates_public_read"  ON daily_rates
  FOR SELECT TO anon   USING (true);
CREATE POLICY "daily_rates_service_write" ON daily_rates
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "daily_rates_service_update" ON daily_rates
  FOR UPDATE TO service_role USING (true);

-- provider_fees: lectura pública, escritura solo service_role
CREATE POLICY "provider_fees_public_read"   ON provider_fees
  FOR SELECT TO anon   USING (true);
CREATE POLICY "provider_fees_service_write" ON provider_fees
  FOR ALL    TO service_role USING (true) WITH CHECK (true);

-- affiliate_clicks: INSERT anónimo (tracking), lectura solo service_role
CREATE POLICY "affiliate_clicks_anon_insert"  ON affiliate_clicks
  FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "affiliate_clicks_service_read" ON affiliate_clicks
  FOR ALL    TO service_role USING (true);

-- ── Datos iniciales: comisiones de proveedores ───────────────

INSERT INTO provider_fees (provider, pair, fee_pct, fee_fixed) VALUES
  ('wise',    'EUR_ALL', 0.0095, 0.00),
  ('wise',    'GBP_ALL', 0.0085, 0.00),
  ('wise',    'USD_ALL', 0.0120, 0.00),
  ('remitly', 'EUR_ALL', 0.0000, 3.99),
  ('remitly', 'GBP_ALL', 0.0000, 2.99),
  ('remitly', 'USD_ALL', 0.0000, 3.99),
  ('bank',    'EUR_ALL', 0.0350, 0.00),
  ('bank',    'GBP_ALL', 0.0350, 0.00),
  ('bank',    'USD_ALL', 0.0350, 0.00)
ON CONFLICT (provider, pair) DO NOTHING;

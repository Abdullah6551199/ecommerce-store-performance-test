-- Stage 20: Tax Management + Shipping Zones

-- 1. Tax Rates Table
CREATE TABLE IF NOT EXISTS tax_rates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  country TEXT NOT NULL,
  state TEXT,
  city TEXT,
  rate REAL NOT NULL,
  label TEXT,
  tax_type TEXT DEFAULT 'exclusive',
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(country, state, city)
);

-- 2. Tax Settings Table (Global)
CREATE TABLE IF NOT EXISTS tax_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  is_enabled INTEGER DEFAULT 1,
  default_rate REAL DEFAULT 0,
  default_label TEXT DEFAULT 'Tax',
  default_tax_type TEXT DEFAULT 'exclusive',
  apply_to_shipping INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. Shipping Zones Table
CREATE TABLE IF NOT EXISTS shipping_zones (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  name TEXT NOT NULL,
  countries TEXT NOT NULL,
  states TEXT,
  rate_type TEXT DEFAULT 'flat',
  rate REAL DEFAULT 0,
  free_shipping_threshold REAL,
  min_order_value REAL,
  delivery_time_min INTEGER,
  delivery_time_max INTEGER,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_rates_country ON tax_rates(country);
CREATE INDEX IF NOT EXISTS idx_tax_rates_country_state ON tax_rates(country, state);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_sort ON shipping_zones(sort_order);

-- 4. Extend Orders table with tax & shipping metadata (safe idempotent column additions)
ALTER TABLE orders ADD COLUMN country TEXT;
ALTER TABLE orders ADD COLUMN state TEXT;
ALTER TABLE orders ADD COLUMN tax_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN tax_rate REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN tax_label TEXT;
ALTER TABLE orders ADD COLUMN shipping_zone_id TEXT;

-- 5. Pre-seed Default Tax Rates (INSERT OR IGNORE)
INSERT OR IGNORE INTO tax_rates (id, country, state, city, rate, label, tax_type, created_at, updated_at)
VALUES 
  ('tax_pk_default', 'PK', NULL, NULL, 17.0, 'GST', 'exclusive', datetime('now'), datetime('now')),
  ('tax_in_default', 'IN', NULL, NULL, 18.0, 'GST', 'exclusive', datetime('now'), datetime('now')),
  ('tax_us_ca', 'US', 'CA', NULL, 7.25, 'Sales Tax', 'exclusive', datetime('now'), datetime('now')),
  ('tax_us_ny', 'US', 'NY', NULL, 4.0, 'Sales Tax', 'exclusive', datetime('now'), datetime('now')),
  ('tax_us_tx', 'US', 'TX', NULL, 6.25, 'Sales Tax', 'exclusive', datetime('now'), datetime('now')),
  ('tax_us_default', 'US', NULL, NULL, 0.0, 'Sales Tax', 'exclusive', datetime('now'), datetime('now')),
  ('tax_gb_default', 'GB', NULL, NULL, 20.0, 'VAT', 'inclusive', datetime('now'), datetime('now')),
  ('tax_ae_default', 'AE', NULL, NULL, 5.0, 'VAT', 'exclusive', datetime('now'), datetime('now')),
  ('tax_sa_default', 'SA', NULL, NULL, 15.0, 'VAT', 'exclusive', datetime('now'), datetime('now')),
  ('tax_bd_default', 'BD', NULL, NULL, 15.0, 'VAT', 'exclusive', datetime('now'), datetime('now'));

-- 6. Pre-seed Default Tax Settings (INSERT OR IGNORE)
INSERT OR IGNORE INTO tax_settings (id, is_enabled, default_rate, default_label, default_tax_type, apply_to_shipping, created_at, updated_at)
VALUES ('tax_settings_default', 1, 0, 'Tax', 'exclusive', 0, datetime('now'), datetime('now'));

-- 7. Pre-seed Default Shipping Zones (INSERT OR IGNORE)
INSERT OR IGNORE INTO shipping_zones (id, name, countries, states, rate_type, rate, free_shipping_threshold, min_order_value, delivery_time_min, delivery_time_max, is_active, sort_order, created_at, updated_at)
VALUES
  ('zone_pk_domestic', 'Pakistan Domestic', '["PK"]', NULL, 'flat', 5.0, 100.0, NULL, 2, 3, 1, 0, datetime('now'), datetime('now')),
  ('zone_south_asia', 'South Asia', '["IN","BD","LK","NP"]', NULL, 'flat', 15.0, 150.0, NULL, 4, 7, 1, 1, datetime('now'), datetime('now')),
  ('zone_middle_east', 'Middle East', '["AE","SA","QA","KW","BH","OM"]', NULL, 'flat', 20.0, 200.0, NULL, 3, 5, 1, 2, datetime('now'), datetime('now')),
  ('zone_north_america', 'North America', '["US","CA","MX"]', NULL, 'flat', 25.0, 250.0, NULL, 5, 10, 1, 3, datetime('now'), datetime('now')),
  ('zone_europe', 'Europe', '["GB","DE","FR","IT","ES","NL","BE","SE"]', NULL, 'flat', 25.0, 250.0, NULL, 5, 8, 1, 4, datetime('now'), datetime('now')),
  ('zone_rest_of_world', 'Rest of World', '["*"]', NULL, 'flat', 35.0, NULL, NULL, 7, 14, 1, 5, datetime('now'), datetime('now'));

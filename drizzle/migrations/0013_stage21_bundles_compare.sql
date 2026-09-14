-- Migration: 0013_stage21_bundles_compare.sql
-- Stage 21: Product Bundles + Compare Products

-- 1. Product Bundles Table
CREATE TABLE IF NOT EXISTS product_bundles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  bundle_price REAL NOT NULL,
  original_price REAL NOT NULL,
  discount_percentage REAL,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  is_featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Bundle Items Table
CREATE TABLE IF NOT EXISTS bundle_items (
  id TEXT PRIMARY KEY,
  bundle_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  quantity INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (bundle_id) REFERENCES product_bundles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_bundles_status ON product_bundles(status);
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON product_bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundles_featured ON product_bundles(is_featured);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product ON bundle_items(product_id);

-- 4. Pre-seed Initial High-Converting Starter Bundles
-- Bundle 1: Endurance Trio (Apex Velocity Runner $160 + Aero-Knit Tee $58 + Vapor-Shield Windbreaker $140 = $358, Bundle Price $268 => ~25% off)
INSERT OR IGNORE INTO product_bundles (
  id,
  tenant_id,
  name,
  slug,
  description,
  bundle_price,
  original_price,
  discount_percentage,
  image_url,
  status,
  is_featured,
  sort_order,
  created_at,
  updated_at
) VALUES (
  'bundle-endurance-trio',
  'default',
  'Endurance Performance Trio',
  'endurance-performance-trio',
  'Complete elite training kit featuring the Apex Velocity Runner X1, breathable Aero-Knit compression tee, and ultralight Vapor-Shield windbreaker. Engineered for maximum speed and endurance.',
  268.0,
  358.0,
  25.14,
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
  'active',
  1,
  1,
  datetime('now'),
  datetime('now')
);

INSERT OR IGNORE INTO bundle_items (id, bundle_id, product_id, variant_id, quantity, sort_order)
VALUES 
  ('bitem-endurance-1', 'bundle-endurance-trio', 'prod-apex-vrx1', NULL, 1, 1),
  ('bitem-endurance-2', 'bundle-endurance-trio', 'prod-aero-knit-tee', NULL, 1, 2),
  ('bitem-endurance-3', 'bundle-endurance-trio', 'prod-vapor-jacket', NULL, 1, 3);

-- Bundle 2: Elite Marathon Duo (Apex Velocity Runner $160 + Pulse Enduro Carbon Pro $185 = $345, Bundle Price $275 => ~20% off)
INSERT OR IGNORE INTO product_bundles (
  id,
  tenant_id,
  name,
  slug,
  description,
  bundle_price,
  original_price,
  discount_percentage,
  image_url,
  status,
  is_featured,
  sort_order,
  created_at,
  updated_at
) VALUES (
  'bundle-elite-marathon-duo',
  'default',
  'Elite Marathon Duo',
  'elite-marathon-duo',
  'The ultimate dual footwear rotation for long distance runners. Pair the Apex Velocity Runner with the Pulse Enduro Carbon Pro for race day and tempo training.',
  275.0,
  345.0,
  20.29,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
  'active',
  1,
  2,
  datetime('now'),
  datetime('now')
);

INSERT OR IGNORE INTO bundle_items (id, bundle_id, product_id, variant_id, quantity, sort_order)
VALUES 
  ('bitem-marathon-1', 'bundle-elite-marathon-duo', 'prod-apex-vrx1', NULL, 1, 1),
  ('bitem-marathon-2', 'bundle-elite-marathon-duo', 'prod-pulse-enduro', NULL, 1, 2);

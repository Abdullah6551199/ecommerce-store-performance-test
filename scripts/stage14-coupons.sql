-- Stage 14: Coupons & Discounts Schema and Initial Seed Migration

ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_code TEXT;
ALTER TABLE orders ADD COLUMN discount_type TEXT;

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  value REAL NOT NULL,
  min_order_value REAL,
  max_discount REAL,
  apply_to TEXT DEFAULT 'all',
  apply_to_id TEXT,
  buy_quantity INTEGER,
  get_quantity INTEGER,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  first_order_only INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 1,
  is_auto_apply INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS coupon_usages (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  customer_email TEXT,
  customer_id TEXT,
  discount_amount REAL NOT NULL,
  used_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_order_id ON coupon_usages(order_id);

-- Seed initial test coupons representing all 8 coupon types
INSERT OR IGNORE INTO coupons (id, code, description, type, value, min_order_value, max_discount, apply_to, is_visible, is_auto_apply, is_featured, is_active, created_at, updated_at)
VALUES 
  ('coup_save10', 'SAVE10', '10% off your entire order', 'percentage', 10, 0, NULL, 'all', 1, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('coup_flat20', 'FLAT20', '$20 off orders over $50', 'fixed', 20, 50, NULL, 'all', 1, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('coup_freeship', 'FREESHIP', 'Free express shipping on orders over $30', 'free_shipping', 0, 30, NULL, 'all', 1, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('coup_spend100', 'SPEND100', 'Spend $100+ and receive 15% off', 'min_order', 15, 100, 50, 'all', 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('coup_welcome10', 'WELCOME10', '10% off for first-time shoppers', 'first_order', 10, 0, 30, 'all', 1, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO coupons (id, code, description, type, value, buy_quantity, get_quantity, apply_to, is_visible, is_auto_apply, is_featured, is_active, created_at, updated_at)
VALUES 
  ('coup_buy2get1', 'BUY2GET1', 'Buy 2 items, get 1 free', 'buy_x_get_y', 1, 2, 1, 'all', 1, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO coupons (id, code, description, type, value, apply_to, is_visible, is_auto_apply, is_featured, is_active, created_at, updated_at)
VALUES 
  ('coup_shoes15', 'SHOES15', '15% off all Footwear products', 'category', 15, 'category', 1, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('coup_apex20', 'APEX20', '$20 off Apex series gear', 'product', 20, 'product', 1, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

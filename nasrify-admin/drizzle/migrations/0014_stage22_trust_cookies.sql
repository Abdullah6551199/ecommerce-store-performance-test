-- Stage 22: Trust Badges, Payment Icons, and Cookie Consent Settings Schema & Seeds

-- 1. Trust Badges Table
CREATE TABLE IF NOT EXISTS trust_badges (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  icon TEXT NOT NULL,              -- Lucide icon name (e.g., 'shield-check', 'truck', 'refresh-cw')
  title TEXT NOT NULL,              -- e.g., "Secure Checkout"
  description TEXT,                 -- e.g., "256-bit SSL Encryption"
  location TEXT DEFAULT 'all',     -- 'all', 'product', 'cart', 'checkout', 'footer'
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Payment Icons Table
CREATE TABLE IF NOT EXISTS payment_icons (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  name TEXT NOT NULL,              -- e.g., "Visa", "Mastercard"
  icon_svg TEXT,                    -- SVG or icon identifier
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. Cookie Consent Settings Table
CREATE TABLE IF NOT EXISTS cookie_consent_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  is_enabled INTEGER DEFAULT 1,
  banner_title TEXT DEFAULT 'We use cookies',
  banner_message TEXT DEFAULT 'We use cookies to improve your experience, analyze traffic, and personalize content.',
  accept_text TEXT DEFAULT 'Accept All',
  reject_text TEXT DEFAULT 'Reject All',
  customize_text TEXT DEFAULT 'Customize',
  position TEXT DEFAULT 'bottom',  -- 'bottom', 'top'
  theme TEXT DEFAULT 'light',       -- 'light', 'dark'
  analytics_enabled INTEGER DEFAULT 1,
  marketing_enabled INTEGER DEFAULT 1,
  functional_enabled INTEGER DEFAULT 1,
  cookie_policy_content TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trust_badges_active ON trust_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_trust_badges_location ON trust_badges(location);
CREATE INDEX IF NOT EXISTS idx_payment_icons_active ON payment_icons(is_active);

-- Pre-seed Default Trust Badges
INSERT OR IGNORE INTO trust_badges (id, icon, title, description, location, sort_order, is_active, created_at, updated_at) VALUES
('tb_secure', 'shield-check', 'Secure Checkout', '256-bit SSL Encryption', 'all', 1, 1, datetime('now'), datetime('now')),
('tb_returns', 'refresh-cw', '30-Day Returns', 'Hassle-free returns', 'all', 2, 1, datetime('now'), datetime('now')),
('tb_shipping', 'truck', 'Free Shipping', 'On orders over $50', 'all', 3, 1, datetime('now'), datetime('now')),
('tb_support', 'headphones', '24/7 Support', 'We are here to help', 'all', 4, 1, datetime('now'), datetime('now')),
('tb_authentic', 'badge-check', '100% Authentic', 'Genuine products only', 'all', 5, 1, datetime('now'), datetime('now')),
('tb_payment', 'credit-card', 'Safe Payment', 'Multiple payment options', 'all', 6, 1, datetime('now'), datetime('now'));

-- Pre-seed Default Payment Icons
INSERT OR IGNORE INTO payment_icons (id, name, sort_order, is_active, created_at, updated_at) VALUES
('pi_visa', 'Visa', 1, 1, datetime('now'), datetime('now')),
('pi_mastercard', 'Mastercard', 2, 1, datetime('now'), datetime('now')),
('pi_amex', 'American Express', 3, 1, datetime('now'), datetime('now')),
('pi_paypal', 'PayPal', 4, 1, datetime('now'), datetime('now')),
('pi_applepay', 'Apple Pay', 5, 1, datetime('now'), datetime('now')),
('pi_googlepay', 'Google Pay', 6, 1, datetime('now'), datetime('now'));

-- Pre-seed Default Cookie Settings
INSERT OR IGNORE INTO cookie_consent_settings (id, is_enabled, created_at, updated_at) VALUES
('cookies_default', 1, datetime('now'), datetime('now'));

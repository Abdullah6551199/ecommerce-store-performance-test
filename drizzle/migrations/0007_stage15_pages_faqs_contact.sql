-- Stage 15: Pages CMS, FAQs, and Contact Messages tables
-- 1. Pages table (CMS)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- HTML or JSON
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  show_in_footer INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  is_default INTEGER DEFAULT 0, -- true for About, Privacy, etc.
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE(slug)
);

-- 2. FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 3. Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read);

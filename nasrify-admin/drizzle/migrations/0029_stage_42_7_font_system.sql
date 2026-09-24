-- Migration 0029: Stage 42.7 Font System

CREATE TABLE IF NOT EXISTS `fonts` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `slug` TEXT NOT NULL UNIQUE,
  `family` TEXT NOT NULL,
  `category` TEXT NOT NULL,
  `variants` TEXT NOT NULL,
  `styles` TEXT NOT NULL,
  `subsets` TEXT NOT NULL,
  `license` TEXT,
  `source` TEXT,
  `is_curated` INTEGER DEFAULT 0,
  `is_active` INTEGER DEFAULT 1,
  `preview_url` TEXT,
  `file_urls` TEXT NOT NULL,
  `total_size_kb` INTEGER,
  `created_at` INTEGER,
  `updated_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `font_settings` (
  `id` TEXT PRIMARY KEY DEFAULT 'default' NOT NULL,
  `default_heading_font` TEXT DEFAULT 'inter',
  `default_body_font` TEXT DEFAULT 'inter',
  `preload_fonts` TEXT,
  `enable_local_hosting` INTEGER DEFAULT 1,
  `font_display` TEXT DEFAULT 'swap',
  `updated_at` INTEGER
);

CREATE INDEX IF NOT EXISTS `idx_fonts_slug` ON `fonts` (`slug`);
CREATE INDEX IF NOT EXISTS `idx_fonts_category` ON `fonts` (`category`);
CREATE INDEX IF NOT EXISTS `idx_fonts_curated` ON `fonts` (`is_curated`);
CREATE INDEX IF NOT EXISTS `idx_fonts_active` ON `fonts` (`is_active`);

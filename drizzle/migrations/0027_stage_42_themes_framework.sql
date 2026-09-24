-- Migration: 0027_stage_42_themes_framework.sql
-- Description: Themes Framework core tables (themes, active_theme, theme_audit_log)

CREATE TABLE IF NOT EXISTS `themes` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `slug` TEXT NOT NULL UNIQUE,
  `name` TEXT NOT NULL,
  `version` TEXT DEFAULT '1.0.0',
  `description` TEXT,
  `author` TEXT DEFAULT 'Nasrify',
  `author_url` TEXT,
  `preview_url` TEXT,
  `screenshot_urls` TEXT,
  `category` TEXT,
  `theme_json` TEXT NOT NULL,
  `is_built_in` INTEGER DEFAULT 0,
  `status` TEXT DEFAULT 'published',
  `created_at` INTEGER,
  `updated_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `active_theme` (
  `id` TEXT PRIMARY KEY DEFAULT 'default' NOT NULL,
  `theme_id` TEXT NOT NULL,
  `theme_json` TEXT NOT NULL,
  `activated_at` INTEGER,
  `activated_by` TEXT
);

CREATE TABLE IF NOT EXISTS `theme_audit_log` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `theme_id` TEXT NOT NULL,
  `action` TEXT NOT NULL,
  `performed_by` TEXT,
  `created_at` INTEGER
);

CREATE INDEX IF NOT EXISTS `idx_themes_slug` ON `themes` (`slug`);
CREATE INDEX IF NOT EXISTS `idx_themes_status` ON `themes` (`status`);
CREATE INDEX IF NOT EXISTS `idx_theme_audit_theme_id` ON `theme_audit_log` (`theme_id`);

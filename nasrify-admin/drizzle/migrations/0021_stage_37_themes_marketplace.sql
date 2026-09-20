-- Migration: 0021_stage_37_themes_marketplace.sql
-- Description: Themes Marketplace Hub tables for theme listings, versions, and store installs

CREATE TABLE IF NOT EXISTS `theme_marketplace_listings` (
  `id` text PRIMARY KEY NOT NULL,
  `theme_id` text NOT NULL,
  `version` text NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `author` text,
  `author_url` text,
  `preview_url` text,
  `screenshot_urls` text,
  `category` text,
  `pricing` text DEFAULT 'free' NOT NULL,
  `price` real DEFAULT 0,
  `status` text DEFAULT 'draft' NOT NULL,
  `submitted_by` text,
  `submitted_at` integer,
  `approved_by` text,
  `approved_at` integer,
  `rejection_reason` text,
  `download_url` text,
  `config_json` text,
  `changelog` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `theme_marketplace_versions` (
  `id` text PRIMARY KEY NOT NULL,
  `listing_id` text NOT NULL,
  `version` text NOT NULL,
  `submitted_at` integer NOT NULL,
  `config_json` text,
  `download_url` text,
  `status` text DEFAULT 'pending' NOT NULL,
  `notes` text
);

CREATE TABLE IF NOT EXISTS `theme_marketplace_installs` (
  `id` text PRIMARY KEY NOT NULL,
  `listing_id` text NOT NULL,
  `store_id` text DEFAULT 'default-store' NOT NULL,
  `installed_at` integer NOT NULL,
  `uninstalled_at` integer,
  `status` text DEFAULT 'active' NOT NULL
);

-- Indexes for lightning fast queries and filtering
CREATE INDEX IF NOT EXISTS `idx_theme_listings_theme_id` ON `theme_marketplace_listings` (`theme_id`);
CREATE INDEX IF NOT EXISTS `idx_theme_listings_status` ON `theme_marketplace_listings` (`status`);
CREATE INDEX IF NOT EXISTS `idx_theme_listings_category` ON `theme_marketplace_listings` (`category`);
CREATE INDEX IF NOT EXISTS `idx_theme_versions_listing_id` ON `theme_marketplace_versions` (`listing_id`);
CREATE INDEX IF NOT EXISTS `idx_theme_installs_listing_id` ON `theme_marketplace_installs` (`listing_id`);
CREATE INDEX IF NOT EXISTS `idx_theme_installs_store_id` ON `theme_marketplace_installs` (`store_id`);

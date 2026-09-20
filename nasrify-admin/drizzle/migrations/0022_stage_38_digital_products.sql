-- Migration: 0022_stage_38_digital_products.sql
-- Description: Digital Products app tables for digital files, secure download tokens, and licenses

CREATE TABLE IF NOT EXISTS `digital_products` (
  `id` text PRIMARY KEY NOT NULL,
  `product_id` text NOT NULL,
  `files_json` text NOT NULL,
  `download_limit` integer DEFAULT 5 NOT NULL,
  `expiry_days` integer DEFAULT 30 NOT NULL,
  `license_enabled` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `digital_downloads` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `product_id` text NOT NULL,
  `customer_id` text,
  `customer_email` text,
  `file_name` text NOT NULL,
  `r2_key` text NOT NULL,
  `download_token` text NOT NULL,
  `downloaded_count` integer DEFAULT 0 NOT NULL,
  `max_downloads` integer DEFAULT 5 NOT NULL,
  `expires_at` integer,
  `created_at` integer NOT NULL,
  `last_download_at` integer
);

CREATE TABLE IF NOT EXISTS `digital_licenses` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `product_id` text NOT NULL,
  `license_key` text UNIQUE NOT NULL,
  `customer_email` text,
  `status` text DEFAULT 'active' NOT NULL,
  `created_at` integer NOT NULL
);

-- Indexes for ultra-fast lookup
CREATE INDEX IF NOT EXISTS `idx_digital_products_product_id` ON `digital_products` (`product_id`);
CREATE INDEX IF NOT EXISTS `idx_digital_downloads_order_id` ON `digital_downloads` (`order_id`);
CREATE INDEX IF NOT EXISTS `idx_digital_downloads_token` ON `digital_downloads` (`download_token`);
CREATE INDEX IF NOT EXISTS `idx_digital_downloads_customer_email` ON `digital_downloads` (`customer_email`);
CREATE INDEX IF NOT EXISTS `idx_digital_licenses_order_id` ON `digital_licenses` (`order_id`);
CREATE INDEX IF NOT EXISTS `idx_digital_licenses_key` ON `digital_licenses` (`license_key`);

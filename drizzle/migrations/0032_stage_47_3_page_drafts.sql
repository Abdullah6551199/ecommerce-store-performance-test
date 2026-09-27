-- Migration: 0032_stage_47_3_page_drafts.sql
-- Description: Multi-page theme visual editor drafts per page type

CREATE TABLE IF NOT EXISTS `theme_page_drafts` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `theme_id` TEXT NOT NULL,
  `page_type` TEXT NOT NULL,
  `draft_json` TEXT NOT NULL,
  `updated_by` TEXT,
  `updated_at` INTEGER
);

CREATE INDEX IF NOT EXISTS `idx_theme_page_drafts_theme_id` ON `theme_page_drafts` (`theme_id`);
CREATE INDEX IF NOT EXISTS `idx_theme_page_drafts_page_type` ON `theme_page_drafts` (`theme_id`, `page_type`);

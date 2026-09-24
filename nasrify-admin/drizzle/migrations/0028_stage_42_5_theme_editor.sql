-- Migration: 0028_stage_42_5_theme_editor.sql
-- Description: Theme Visual Editor draft and history tables

CREATE TABLE IF NOT EXISTS `theme_drafts` (
  `id` TEXT PRIMARY KEY DEFAULT 'active-draft' NOT NULL,
  `theme_id` TEXT NOT NULL,
  `draft_json` TEXT NOT NULL,
  `updated_by` TEXT,
  `updated_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `theme_editor_history` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `theme_id` TEXT NOT NULL,
  `action` TEXT NOT NULL,
  `snapshot_json` TEXT,
  `performed_by` TEXT,
  `created_at` INTEGER
);

CREATE INDEX IF NOT EXISTS `idx_theme_drafts_theme_id` ON `theme_drafts` (`theme_id`);
CREATE INDEX IF NOT EXISTS `idx_theme_history_theme_id` ON `theme_editor_history` (`theme_id`);

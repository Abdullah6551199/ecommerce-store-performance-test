-- Migration: 0023_stage_37c_reviews.sql
-- Description: Marketplace reviews and rating tables for apps and themes

CREATE TABLE IF NOT EXISTS `marketplace_reviews` (
  `id` text PRIMARY KEY NOT NULL,
  `listing_type` text NOT NULL,
  `listing_id` text NOT NULL,
  `user_id` text,
  `user_email` text,
  `user_name` text,
  `rating` integer NOT NULL,
  `title` text,
  `body` text,
  `helpful_count` integer DEFAULT 0 NOT NULL,
  `status` text DEFAULT 'published' NOT NULL,
  `team_response` text,
  `team_response_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `marketplace_review_votes` (
  `id` text PRIMARY KEY NOT NULL,
  `review_id` text NOT NULL,
  `user_id` text NOT NULL,
  `vote_type` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_reviews_listing` ON `marketplace_reviews` (`listing_type`, `listing_id`);
CREATE INDEX IF NOT EXISTS `idx_reviews_status` ON `marketplace_reviews` (`status`);
CREATE INDEX IF NOT EXISTS `idx_reviews_user` ON `marketplace_reviews` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_review_votes_review` ON `marketplace_review_votes` (`review_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `uq_reviews_listing_user` ON `marketplace_reviews` (`listing_type`, `listing_id`, `user_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `uq_review_votes_user` ON `marketplace_review_votes` (`review_id`, `user_id`);

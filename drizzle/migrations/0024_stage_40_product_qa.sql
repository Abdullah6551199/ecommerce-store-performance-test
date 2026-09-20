-- Migration: 0024_stage_40_product_qa.sql
-- Description: Product Q&A app tables for questions, answers, and customer upvotes

CREATE TABLE IF NOT EXISTS `product_questions` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `product_id` TEXT NOT NULL,
  `customer_id` TEXT,
  `customer_name` TEXT NOT NULL,
  `customer_email` TEXT NOT NULL,
  `question` TEXT NOT NULL,
  `status` TEXT DEFAULT 'pending' NOT NULL,
  `answer_count` INTEGER DEFAULT 0 NOT NULL,
  `upvote_count` INTEGER DEFAULT 0 NOT NULL,
  `is_pinned` INTEGER DEFAULT 0 NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `product_answers` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `question_id` TEXT NOT NULL,
  `author_type` TEXT NOT NULL,
  `author_id` TEXT,
  `author_name` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `status` TEXT DEFAULT 'published' NOT NULL,
  `upvote_count` INTEGER DEFAULT 0 NOT NULL,
  `is_accepted` INTEGER DEFAULT 0 NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `product_qa_upvotes` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `target_type` TEXT NOT NULL,
  `target_id` TEXT NOT NULL,
  `customer_id` TEXT,
  `customer_email` TEXT,
  `created_at` INTEGER NOT NULL,
  UNIQUE(`target_type`, `target_id`, `customer_email`)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS `idx_qa_questions_product_id` ON `product_questions` (`product_id`);
CREATE INDEX IF NOT EXISTS `idx_qa_questions_status` ON `product_questions` (`status`);
CREATE INDEX IF NOT EXISTS `idx_qa_answers_question_id` ON `product_answers` (`question_id`);
CREATE INDEX IF NOT EXISTS `idx_qa_upvotes_target` ON `product_qa_upvotes` (`target_type`, `target_id`);

-- Migration 0030: Stage 45 Chatbot App

CREATE TABLE IF NOT EXISTS `chatbot_settings` (
  `id` TEXT PRIMARY KEY DEFAULT 'default' NOT NULL,
  `enabled` INTEGER DEFAULT 1,
  `xkiro_api_key` TEXT,
  `preferred_model` TEXT DEFAULT 'deepseek/deepseek-v4.1-flash:free',
  `fallback_models` TEXT DEFAULT '["mistralai/mistral-medium-3.5:free","minimax/minimax-m3:free","qwen/qwen3.6-plus:free"]',
  `system_prompt` TEXT,
  `max_tokens` INTEGER DEFAULT 300,
  `temperature` REAL DEFAULT 0.7,
  `welcome_message` TEXT DEFAULT 'Hi! How can I help you today?',
  `placeholder_text` TEXT DEFAULT 'Ask about products, orders, shipping...',
  `position` TEXT DEFAULT 'bottom-right',
  `accent_color` TEXT DEFAULT '#25D366',
  `updated_at` INTEGER
);

CREATE TABLE IF NOT EXISTS `chatbot_conversations` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `session_id` TEXT NOT NULL,
  `role` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `model_used` TEXT,
  `tokens_used` INTEGER,
  `created_at` INTEGER
);

CREATE INDEX IF NOT EXISTS `idx_chatbot_session` ON `chatbot_conversations` (`session_id`);
CREATE INDEX IF NOT EXISTS `idx_chatbot_created` ON `chatbot_conversations` (`created_at`);

INSERT OR REPLACE INTO app_marketplace_listings (
  id, app_id, version, name, description, author, author_url, icon_url, category, pricing, price, status, submitted_by, submitted_at, approved_by, approved_at, rejection_reason, download_url, manifest_json, changelog, created_at, updated_at
) VALUES (
  'listing_chatbot', 'chatbot', '1.0.0', 'AI Chatbot', 'Smart, store-aware customer support chatbot powered by xKiro multi-model fallback.', 'Nasrify', 'https://nasrify.com', '/icons/chatbot.svg', 'marketing', 'free', 0, 'approved', 'system@nasrify.com', 1789869533519, 'admin@apexstore.com', 1789869533519, NULL, NULL, '{"id":"chatbot","name":"AI Chatbot","version":"1.0.0","description":"Smart, store-aware customer support chatbot powered by xKiro multi-model fallback.","author":"Nasrify","authorUrl":"https://nasrify.com","icon":"icon.svg","pricing":"free","category":"marketing","permissions":["read:products","read:orders","read:customers","read:settings"],"extensionPoints":["storefront.floating","admin.dashboard.widget"],"databaseTables":["chatbot_settings","chatbot_conversations"],"workerScope":{"admin":["admin/"],"storefront":["storefront/"],"shared":["manifest.json","icon.svg","lib/","shared/"]},"settingsSchema":{"enabled":{"type":"boolean","default":true,"label":"Enable AI Chatbot"},"preferredModel":{"type":"select","options":["deepseek/deepseek-v4.1-flash:free","minimax/minimax-m3:free","mistralai/mistral-medium-3.5:free","qwen/qwen3.6-plus:free","qwen/qwen3.5-397b-a17b:free"],"default":"deepseek/deepseek-v4.1-flash:free","label":"Preferred Model"},"maxTokens":{"type":"number","default":300,"min":100,"max":1000,"label":"Max Tokens"},"temperature":{"type":"number","default":0.7,"min":0,"max":1,"label":"Temperature"},"position":{"type":"select","options":["bottom-right","bottom-left"],"default":"bottom-right","label":"Widget Position"},"requireLogin":{"type":"boolean","default":false,"label":"Require Customer Login"},"rateLimitPerHour":{"type":"number","default":30,"min":5,"max":200,"label":"Session Rate Limit (Per Hour)"}}}', '1.0.0 — Initial release', 1789869533519, 1789869533519
);

INSERT OR REPLACE INTO app_marketplace_versions (
  id, listing_id, version, submitted_at, manifest_json, download_url, status, notes
) VALUES (
  'version_chatbot_1_0_0', 'listing_chatbot', '1.0.0', 1789869533519, '{"id":"chatbot","name":"AI Chatbot","version":"1.0.0","description":"Smart, store-aware customer support chatbot powered by xKiro multi-model fallback.","author":"Nasrify","authorUrl":"https://nasrify.com","icon":"icon.svg","pricing":"free","category":"marketing","permissions":["read:products","read:orders","read:customers","read:settings"],"extensionPoints":["storefront.floating","admin.dashboard.widget"],"databaseTables":["chatbot_settings","chatbot_conversations"],"workerScope":{"admin":["admin/"],"storefront":["storefront/"],"shared":["manifest.json","icon.svg","lib/","shared/"]}}', NULL, 'approved', 'Initial verified release'
);

INSERT OR REPLACE INTO installed_apps (
  id, version, enabled, installed_at, updated_at
) VALUES (
  'chatbot', '1.0.0', 1, 1789869533519, 1789869533519
);

INSERT OR IGNORE INTO chatbot_settings (
  id, enabled, preferred_model, fallback_models, max_tokens, temperature, welcome_message, placeholder_text, position, accent_color, updated_at
) VALUES (
  'default', 1, 'deepseek/deepseek-v4.1-flash:free', '["mistralai/mistral-medium-3.5:free","minimax/minimax-m3:free","qwen/qwen3.6-plus:free"]', 300, 0.7, 'Hi! How can I help you today?', 'Ask about products, orders, shipping...', 'bottom-right', '#25D366', 1789869533519
);

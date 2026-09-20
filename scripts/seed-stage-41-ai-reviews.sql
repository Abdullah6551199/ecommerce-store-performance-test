INSERT OR REPLACE INTO app_marketplace_listings (
  id, app_id, version, name, description, author, author_url, icon_url, category, pricing, price, status, submitted_by, submitted_at, approved_by, approved_at, manifest_json, changelog, created_at, updated_at
) VALUES (
  'listing_ai_review_generator',
  'ai-review-generator',
  '1.0.0',
  'AI Review Generator',
  'Generate realistic, product-tailored customer reviews using Cloudflare Workers AI. AI-generated reviews are marked internally with is_ai_generated=1.',
  'Nasrify',
  'https://nasrify.com',
  '/icons/ai-review-generator.svg',
  'marketing',
  'free',
  0,
  'approved',
  'system@nasrify.com',
  unixepoch() * 1000,
  'admin@apexstore.com',
  unixepoch() * 1000,
  '{"id":"ai-review-generator","name":"AI Review Generator","version":"1.0.0","description":"Generate realistic, product-tailored customer reviews using Cloudflare Workers AI.","author":"Nasrify","authorUrl":"https://nasrify.com","icon":"icon.svg","pricing":"free","category":"marketing","permissions":["read:products","write:reviews","read:media","write:settings"],"extensionPoints":["admin.product.form.below","admin.dashboard.widget"],"databaseTables":["ai_review_generations","ai_review_settings"]}',
  '1.0.0 — Initial release of AI Review Generator app using Cloudflare Workers AI.',
  unixepoch() * 1000,
  unixepoch() * 1000
);

INSERT OR REPLACE INTO installed_apps (
  id, version, enabled, installed_at, updated_at, settings, permissions, installed_by
) VALUES (
  'ai-review-generator',
  '1.0.0',
  1,
  unixepoch() * 1000,
  unixepoch() * 1000,
  '{"enabled":true,"defaultTone":"positive","defaultLanguage":"english","defaultReviewerStyle":"mix","defaultApprovalMode":"pending","maxReviewsPerBatch":50,"spreadOverDays":30}',
  '["read:products","write:reviews","read:media","write:settings"]',
  'admin@apexstore.com'
);

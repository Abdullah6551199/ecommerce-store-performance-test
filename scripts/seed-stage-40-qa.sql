INSERT OR REPLACE INTO app_marketplace_listings (
  id, app_id, version, name, description, author, author_url, icon_url, category, pricing, price, status, submitted_by, submitted_at, approved_by, approved_at, manifest_json, changelog, created_at, updated_at
) VALUES (
  'listing_product_qa',
  'product-qa',
  '1.0.0',
  'Product Q&A',
  'Allow shoppers to ask questions directly on product pages, receive answers from store admins, and upvote helpful community responses.',
  'Nasrify',
  'https://nasrify.com',
  '/icons/product-qa.svg',
  'marketing',
  'free',
  0,
  'approved',
  'system@nasrify.com',
  unixepoch() * 1000,
  'admin@apexstore.com',
  unixepoch() * 1000,
  '{"id":"product-qa","name":"Product Q&A","version":"1.0.0","description":"Allow shoppers to ask questions directly on product pages, receive answers from store admins, and upvote helpful community responses.","author":"Nasrify","authorUrl":"https://nasrify.com","icon":"icon.svg","pricing":"free","category":"marketing","permissions":["read:products","read:customers","write:settings"],"extensionPoints":["storefront.product.below","admin.dashboard.widget","admin.product.form.below"],"databaseTables":["product_questions","product_answers","product_qa_upvotes"]}',
  '1.0.0 — Initial release of Product Q&A app with community upvoting and admin answers.',
  unixepoch() * 1000,
  unixepoch() * 1000
);

INSERT OR REPLACE INTO installed_apps (
  id, version, enabled, installed_at, updated_at, settings, permissions, installed_by
) VALUES (
  'product-qa',
  '1.0.0',
  1,
  unixepoch() * 1000,
  unixepoch() * 1000,
  '{"enabled":true,"requireLogin":false,"autoPublish":false,"allowGuestQuestions":true,"showUpvotes":true,"maxQuestionsPerProduct":50,"questionsPerPage":10,"notifyAdminOnNewQuestion":true}',
  '["read:products","read:customers","write:settings"]',
  'admin@apexstore.com'
);

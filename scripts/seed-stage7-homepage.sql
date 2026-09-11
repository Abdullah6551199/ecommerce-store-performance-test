-- Stage 7 Homepage Sections & Store Settings Seed Script

-- 1. Insert or Replace Global Store Settings
INSERT OR REPLACE INTO settings (id, key, value, created_at, updated_at)
VALUES (
  'setting-store-main',
  'store_settings',
  '{"storeName":"ApexStore","tagline":"High-Performance Athletic Gear & Technical Apparel","description":"Next-generation sports equipment and technical apparel engineered for peak human performance.","logoUrl":"","logoText":"ApexStore","contactEmail":"support@apexstore.com","contactPhone":"+1 (800) 555-APEX","contactAddress":"100 Velocity Blvd, San Francisco, CA","socialLinks":{"twitter":"https://twitter.com","instagram":"https://instagram.com","facebook":"https://facebook.com","github":"https://github.com","youtube":"https://youtube.com"},"headerNav":[{"label":"Home","url":"/"},{"label":"Products","url":"/search"},{"label":"Categories","url":"/#categories-section"},{"label":"Featured","url":"/#featured-products"}],"footerLinks":[{"title":"Explore","links":[{"label":"All Products","url":"/search"},{"label":"Featured Collections","url":"/#featured-products"},{"label":"Categories","url":"/#categories-section"},{"label":"Performance Gear","url":"/search?q=runner"}]},{"title":"Company","links":[{"label":"Our Story","url":"/#brand-story"},{"label":"Engineering Philosophy","url":"/#hero-section"},{"label":"Admin Portal","url":"/admin/products"},{"label":"Privacy Policy","url":"#"}]},{"title":"Customer Care","links":[{"label":"Shipping Policy","url":"#"},{"label":"Returns & Exchanges","url":"#"},{"label":"Support Desk","url":"mailto:support@apexstore.com"},{"label":"System Health","url":"/api/health"}]}],"announcementText":"🚀 Flash Launch — Free Express Shipping on Orders Over $100","announcementUrl":"/search","showAnnouncement":true,"copyrightText":"ApexStore Commerce Inc. All rights reserved."}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 2. Insert or Replace Homepage Sections
INSERT OR REPLACE INTO homepage_sections (id, type, title, content, image_url, sort_order, is_active, created_at, updated_at)
VALUES (
  'sec-hero-banner',
  'hero',
  'Main Hero Showcase',
  '{"heading":"Curated Collections Engineered for Excellence.","subheading":"Discover precision athletic gear crafted for high-intensity training, trail endurance, and everyday speed. Browse our dynamic collections and featured items below.","badgeText":"New Season Collection • Engineered For Speed","buttonText":"Shop Featured","buttonUrl":"#featured-products","secondaryButtonText":"Explore Categories","secondaryButtonUrl":"#categories-section","alignment":"left"}',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1600&auto=format&fit=crop',
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO homepage_sections (id, type, title, content, image_url, sort_order, is_active, created_at, updated_at)
VALUES (
  'sec-categories-grid',
  'categories',
  'Curated Collections',
  '{"heading":"Explore Disciplines","subheading":"Engineered gear categorized for high-intensity training, trail performance, and everyday velocity.","badgeText":"Dynamic Categories","maxItems":6,"viewAllUrl":"/search"}',
  NULL,
  2,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO homepage_sections (id, type, title, content, image_url, sort_order, is_active, created_at, updated_at)
VALUES (
  'sec-featured-products',
  'featured_products',
  'Featured Performance Catalog',
  '{"heading":"Featured Products","subheading":"Hand-picked essentials crafted for peak performance and durability.","badgeText":"Featured Innovations","maxItems":4,"viewAllUrl":"/search"}',
  NULL,
  3,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO homepage_sections (id, type, title, content, image_url, sort_order, is_active, created_at, updated_at)
VALUES (
  'sec-promo-banner',
  'promo_banner',
  'Mid-Season Breakthrough Banner',
  '{"heading":"Accelerate Beyond Limits with Carbon-Plate Tech","subheading":"Experience 32% greater energy return with our award-winning composite foam and zero-friction matrix. Engineered for athletes who push boundaries.","badgeText":"Limited Edition Release","buttonText":"Discover Apex Velocity","buttonUrl":"/product/apex-velocity-runner-x1","bannerStyle":"split"}',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop',
  4,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO homepage_sections (id, type, title, content, image_url, sort_order, is_active, created_at, updated_at)
VALUES (
  'sec-brand-story',
  'brand_story',
  'The Apex Standard Brand Story',
  '{"heading":"Built at the Intersection of Innovation & Human Potential","subheading":"Our Performance Manifesto","narrativeText":"We engineer apparel and equipment with relentless attention to biomechanics and endurance. Featherlight materials, hyper-durable composites, and uncompromising ergonomics for athletes who refuse to settle. Every product is stress-tested in elite training facilities.","statItems":[{"label":"Fast Dispatch","value":"< 24h","desc":"Express delivery dispatch"},{"label":"Energy Return","value":"+32%","desc":"Carbon-matrix tech"},{"label":"Active Athletes","value":"25,000+","desc":"Worldwide community"},{"label":"Customer Rating","value":"99.4%","desc":"Verified athlete satisfaction"}],"ctaText":"Explore The Full Catalog","ctaUrl":"/search"}',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  5,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 3. Seed Core Categories to Ensure Rich Category Grid
INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, sort_order, status, created_at, updated_at)
VALUES 
  ('cat-footwear', 'Footwear', 'footwear', 'Trail, marathon, and high-velocity running shoes.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-apparel', 'Technical Apparel', 'apparel', 'Moisture-wicking, thermal-adaptive athletic wear.', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=800&auto=format&fit=crop', 2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-equipment', 'Pro Equipment', 'equipment', 'Precision gym essentials, resistance tools, and accessories.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop', 3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-recovery', 'Recovery & Tech', 'recovery', 'Post-workout massage tech, compression gear, and hydration.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop', 4, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Update the sample product to reference cat-footwear
UPDATE products SET category_id = 'cat-footwear' WHERE id = 'prod-apex-vrx1';

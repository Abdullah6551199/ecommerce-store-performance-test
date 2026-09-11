-- Stage 11: Cleanup all infrastructure/technology references from D1 remote database

-- 1. Update store_settings
UPDATE settings
SET value = '{"storeName":"ApexStore","tagline":"High-Performance Athletic Gear & Technical Apparel","description":"Next-generation sports equipment and technical apparel engineered for peak human performance.","logoUrl":"","logoText":"ApexStore","contactEmail":"support@apexstore.com","contactPhone":"+1 (800) 555-APEX","contactAddress":"100 Velocity Blvd, San Francisco, CA","socialLinks":{"twitter":"https://twitter.com","instagram":"https://instagram.com","facebook":"https://facebook.com","github":"https://github.com","youtube":"https://youtube.com"},"headerNav":[{"label":"Home","url":"/"},{"label":"Products","url":"/search"},{"label":"Categories","url":"/#categories-section"},{"label":"Featured","url":"/#featured-products"}],"footerLinks":[{"title":"Explore","links":[{"label":"All Products","url":"/search"},{"label":"Featured Collections","url":"/#featured-products"},{"label":"Categories","url":"/#categories-section"},{"label":"Performance Gear","url":"/search?q=runner"}]},{"title":"Company","links":[{"label":"Our Story","url":"/#brand-story"},{"label":"Engineering Philosophy","url":"/#hero-section"},{"label":"Admin Portal","url":"/admin/products"},{"label":"Privacy Policy","url":"#"}]},{"title":"Customer Care","links":[{"label":"Shipping Policy","url":"#"},{"label":"Returns & Exchanges","url":"#"},{"label":"Support Desk","url":"mailto:support@apexstore.com"},{"label":"System Health","url":"/api/health"}]}],"announcementText":"🚀 Flash Launch — Free Express Shipping on Orders Over $100","announcementUrl":"/search","showAnnouncement":true,"copyrightText":"ApexStore Commerce Inc. All rights reserved."}',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'store_settings';

-- 2. Update theme_settings
UPDATE settings
SET value = '{"colors":{"primary":"#18C729","secondary":"#12a822","accent":"#FEF500","background":"#080e0a","text":"#f4f7f5","mutedText":"#9ca3af","border":"rgba(255, 255, 255, 0.15)","success":"#10b981","error":"#ef4444"},"typography":{"headingFont":"Inter, system-ui, sans-serif","bodyFont":"Inter, system-ui, sans-serif","buttonFont":"Inter, system-ui, sans-serif"},"design":{"containerWidth":"1280px","borderRadius":"12px","cardRadius":"24px","buttonRadius":"12px","shadows":"medium","spacing":"normal"},"other":{"storeLogo":"","favicon":"","announcementBarText":"🚀 Flash Launch — Free Express Shipping on Orders Over $100"}}',
    updated_at = CURRENT_TIMESTAMP
WHERE key = 'theme_settings';

-- 3. Update homepage_sections hero banner
UPDATE homepage_sections
SET content = '{"heading":"Curated Collections Engineered for Excellence.","subheading":"Discover precision athletic gear crafted for high-intensity training, trail endurance, and everyday speed. Browse our dynamic collections and featured items below.","badgeText":"New Season Collection • Engineered For Speed","buttonText":"Shop Featured","buttonUrl":"#featured-products","secondaryButtonText":"Explore Categories","secondaryButtonUrl":"#categories-section","alignment":"left"}',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'sec-hero-banner';

-- 4. Update homepage_sections featured products
UPDATE homepage_sections
SET content = '{"heading":"Featured Products","subheading":"Hand-picked essentials crafted for peak performance and durability.","badgeText":"Featured Innovations","maxItems":4,"viewAllUrl":"/search"}',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'sec-featured-products';

-- 5. Update homepage_sections brand story
UPDATE homepage_sections
SET content = '{"heading":"Built at the Intersection of Innovation & Human Potential","subheading":"Our Performance Manifesto","narrativeText":"We engineer apparel and equipment with relentless attention to biomechanics and endurance. Featherlight materials, hyper-durable composites, and uncompromising ergonomics for athletes who refuse to settle. Every product is stress-tested in elite athletic facilities.","statItems":[{"label":"Fast Dispatch","value":"< 24h","desc":"Express delivery dispatch"},{"label":"Energy Return","value":"+32%","desc":"Carbon-matrix tech"},{"label":"Active Athletes","value":"25,000+","desc":"Worldwide community"},{"label":"Customer Rating","value":"99.4%","desc":"Verified athlete satisfaction"}],"ctaText":"Explore The Full Catalog","ctaUrl":"/search"}',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'sec-brand-story';

-- 6. Update products seo_description
UPDATE products
SET seo_description = 'Shop Apex Velocity Runner X1 with customizable colors and sizes. Fast express delivery.',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'prod-apex-vrx1';


-- Seed 3 Showcase Approved Themes for Nasrify Themes Hub (Stage 37B)

INSERT OR REPLACE INTO theme_marketplace_listings (
  id, theme_id, version, name, description, author, author_url, preview_url,
  screenshot_urls, category, pricing, price, status, submitted_by, submitted_at,
  approved_by, approved_at, rejection_reason, download_url, config_json, changelog,
  created_at, updated_at
) VALUES (
  'listing_minimal_noir',
  'minimal-noir',
  '1.0.0',
  'Minimal Noir',
  'An ultra-clean monochrome theme with refined typography, high-contrast borders, and conversion-focused product grids.',
  'Nasrify Design Studio',
  'https://nasrify.com',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  '["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80","https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80"]',
  'Minimal',
  'free',
  0.0,
  'approved',
  'admin@apexstore.com',
  1758300000000,
  'admin@apexstore.com',
  1758300100000,
  NULL,
  NULL,
  '{"colors":{"primary":"#18181B","secondary":"#27272A","accent":"#71717A","background":"#FAFAFA","surface":"#FFFFFF","text":"#09090B"},"typography":{"headingFont":"Inter, sans-serif","bodyFont":"Inter, sans-serif","scale":"1.15"},"layout":{"borderRadius":"8px","headerStyle":"minimal","productCardStyle":"clean-border"},"features":["Ultra-clean typography","Zero layout shift","High-contrast monochrome","Conversion optimized"]}',
  'v1.0.0: Initial public release with full edge responsiveness and monochrome design tokens.',
  1758300000000,
  1758300100000
);

INSERT OR REPLACE INTO theme_marketplace_versions (
  id, listing_id, version, submitted_at, config_json, download_url, status, notes
) VALUES (
  'version_minimal_noir_1',
  'listing_minimal_noir',
  '1.0.0',
  1758300000000,
  '{"colors":{"primary":"#18181B","secondary":"#27272A","accent":"#71717A","background":"#FAFAFA","surface":"#FFFFFF","text":"#09090B"}}',
  NULL,
  'approved',
  'Initial release'
);

INSERT OR REPLACE INTO theme_marketplace_listings (
  id, theme_id, version, name, description, author, author_url, preview_url,
  screenshot_urls, category, pricing, price, status, submitted_by, submitted_at,
  approved_by, approved_at, rejection_reason, download_url, config_json, changelog,
  created_at, updated_at
) VALUES (
  'listing_bold_velocity',
  'bold-velocity',
  '1.2.0',
  'Bold Velocity',
  'A high-octane, vibrant aesthetic with dynamic gradients, punchy accents, and expressive product badges for street & sportswear.',
  'Velocity Lab',
  'https://velocity.design',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
  '["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"]',
  'Bold',
  'paid',
  49.00,
  'approved',
  'admin@apexstore.com',
  1758301000000,
  'admin@apexstore.com',
  1758301100000,
  NULL,
  NULL,
  '{"colors":{"primary":"#FF3366","secondary":"#7928CA","accent":"#00DFD8","background":"#0D0D11","surface":"#181820","text":"#FFFFFF"},"typography":{"headingFont":"Oswald, sans-serif","bodyFont":"Inter, sans-serif","scale":"1.3"},"layout":{"borderRadius":"16px","headerStyle":"floating","productCardStyle":"glow"},"features":["Neon gradient accents","Dynamic product badges","Dark mode native","Interactive hover physics"]}',
  'v1.2.0: Added dynamic badge support and performance tuning.',
  1758301000000,
  1758301100000
);

INSERT OR REPLACE INTO theme_marketplace_versions (
  id, listing_id, version, submitted_at, config_json, download_url, status, notes
) VALUES (
  'version_bold_velocity_1',
  'listing_bold_velocity',
  '1.2.0',
  1758301000000,
  '{"colors":{"primary":"#FF3366","secondary":"#7928CA","accent":"#00DFD8","background":"#0D0D11","surface":"#181820","text":"#FFFFFF"}}',
  NULL,
  'approved',
  'Version 1.2.0 release'
);

INSERT OR REPLACE INTO theme_marketplace_listings (
  id, theme_id, version, name, description, author, author_url, preview_url,
  screenshot_urls, category, pricing, price, status, submitted_by, submitted_at,
  approved_by, approved_at, rejection_reason, download_url, config_json, changelog,
  created_at, updated_at
) VALUES (
  'listing_luxe_atelier',
  'luxe-atelier',
  '1.0.4',
  'Luxe Atelier',
  'An editorial luxury fashion theme crafted with warm neutral tones, serif headlines, gold foil accents, and spacious layouts.',
  'Maison Design',
  'https://maison.paris',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
  '["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80","https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"]',
  'Luxury',
  'paid',
  79.00,
  'approved',
  'admin@apexstore.com',
  1758302000000,
  'admin@apexstore.com',
  1758302100000,
  NULL,
  NULL,
  '{"colors":{"primary":"#8C7355","secondary":"#B39D82","accent":"#D4AF37","background":"#FDFBF7","surface":"#FFFFFF","text":"#2A2621"},"typography":{"headingFont":"Playfair Display, serif","bodyFont":"Cormorant Garamond, serif","scale":"1.25"},"layout":{"borderRadius":"4px","headerStyle":"centered","productCardStyle":"editorial"},"features":["Editorial serif typography","Gold foil accent palette","Airy spacious whitespace","High-end lookbook layout"]}',
  'v1.0.4: Refined font pairings and typography scales.',
  1758302000000,
  1758302100000
);

INSERT OR REPLACE INTO theme_marketplace_versions (
  id, listing_id, version, submitted_at, config_json, download_url, status, notes
) VALUES (
  'version_luxe_atelier_1',
  'listing_luxe_atelier',
  '1.0.4',
  1758302000000,
  '{"colors":{"primary":"#8C7355","secondary":"#B39D82","accent":"#D4AF37","background":"#FDFBF7","surface":"#FFFFFF","text":"#2A2621"}}',
  NULL,
  'approved',
  'Initial luxury launch'
);

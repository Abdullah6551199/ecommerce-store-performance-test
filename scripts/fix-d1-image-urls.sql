-- Stage 8: Fix Image URLs in Cloudflare D1
-- Rewrites legacy dead domain 'https://assets.ecommerce-store.workers.dev/' to local edge proxy '/api/media/'

UPDATE product_images 
SET image_url = REPLACE(image_url, 'https://assets.ecommerce-store.workers.dev/', '/api/media/') 
WHERE image_url LIKE '%assets.ecommerce-store.workers.dev%';

UPDATE product_variants 
SET image_url = REPLACE(image_url, 'https://assets.ecommerce-store.workers.dev/', '/api/media/') 
WHERE image_url LIKE '%assets.ecommerce-store.workers.dev%';

UPDATE media 
SET url = REPLACE(url, 'https://assets.ecommerce-store.workers.dev/', '/api/media/') 
WHERE url LIKE '%assets.ecommerce-store.workers.dev%';

UPDATE homepage_sections 
SET image_url = REPLACE(image_url, 'https://assets.ecommerce-store.workers.dev/', '/api/media/') 
WHERE image_url LIKE '%assets.ecommerce-store.workers.dev%';

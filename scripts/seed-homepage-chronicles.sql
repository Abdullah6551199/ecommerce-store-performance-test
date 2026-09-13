-- ==============================================================================
-- Stage 20: Homepage Chronicles Polish - Categories, Products & Sections Seed
-- Database: ecommerce-perf-db
-- ==============================================================================

-- 1. Ensure Categories (5 main categories + 1 special category)
INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, sort_order, status, created_at, updated_at) VALUES
('cat-footwear', 'Footwear', 'footwear', 'Engineered marathon road runners, carbon plate racers, and trail endurance shoes.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=75', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-apparel', 'Technical Apparel', 'apparel', 'Micro-knit seamless compression tops, featherlight moisture-wicking tights, and layers.', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=75', 2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-equipment', 'Pro Equipment', 'equipment', 'High-tensile Olympic barbells, calibrated cast iron weights, and precision conditioning gear.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=75', 3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-recovery', 'Recovery & Tech', 'recovery', 'Percussive therapy guns, pneumatic compression boots, and active recovery tech.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=75', 4, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-accessories', 'Accessories', 'accessories', 'Ergonomic hydration vests, polarized sports eyewear, and ultra-durable training packs.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=75', 5, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-new-arrivals', 'New Arrivals', 'new-arrivals', 'Fresh drops from the Spring Purple Collection engineered for peak athletic motion.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=75', 6, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Insert or Replace 10 Products with full metadata
INSERT OR REPLACE INTO products (
  id, name, slug, short_description, description, sku, price, sale_price, cost_price,
  stock_quantity, stock_status, low_stock_threshold, track_inventory, allow_backorders,
  category_id, brand, tags, status, compare_at_price, seo_title, seo_description, created_at, updated_at
) VALUES
-- Product 1: Footwear
(
  'prod-apex-vrx1',
  'Apex Velocity Runner X1',
  'apex-velocity-runner-x1',
  'Marathon-tested road racer with full-length carbon composite plate and responsive foam.',
  'Engineered for long-distance marathon dominance. The Apex Velocity Runner X1 features an aerospace-grade carbon fiber propulsion plate sandwiched between twin layers of ultra-light supercritical foam, delivering an unrivaled 32% energy return on every strike.',
  'APX-VRX1-BLK',
  160.00,
  139.99,
  65.00,
  45,
  'in_stock',
  5,
  1,
  0,
  'cat-footwear',
  'Apex Athletic',
  '["shoes", "running", "marathon", "carbon", "bestseller"]',
  'published',
  160.00,
  'Apex Velocity Runner X1 | High Performance Road Shoe',
  'Experience superior energy return with the Apex Velocity Runner X1 marathon shoe.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 2: Footwear
(
  'prod-pulse-enduro',
  'Pulse Enduro Carbon Pro',
  'pulse-enduro-carbon-pro',
  'All-terrain trail runner built with reinforced Kevlar mesh and ultra-grip Vibram lugs.',
  'Tackle steep technical climbs and slick descents with unwavering stability. The Pulse Enduro Carbon Pro integrates targeted arch support, breathable water-shedding mesh, and dual-density cushioning.',
  'PLS-END-PRO',
  185.00,
  155.00,
  78.00,
  30,
  'in_stock',
  5,
  1,
  0,
  'cat-footwear',
  'Pulse Pro',
  '["shoes", "trail", "endurance", "grip"]',
  'published',
  185.00,
  'Pulse Enduro Carbon Pro | Trail Endurance Running Shoe',
  'All-weather trail grip and carbon support with Pulse Enduro Pro.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 3: Technical Apparel
(
  'prod-aero-knit-tee',
  'Aero-Knit Seamless Compression Tee',
  'aero-knit-seamless-compression-tee',
  'Ergonomic compression training shirt with graduated ventilation zones and anti-odor silver ion.',
  'Designed to feel like a second skin. The Aero-Knit Seamless Compression Tee utilizes body-mapped ventilation to release heat where athletes sweat most, minimizing friction through flatlock bonded seams.',
  'AER-KNT-TEE',
  58.00,
  45.00,
  18.00,
  60,
  'in_stock',
  8,
  1,
  0,
  'cat-apparel',
  'Aero Velocity',
  '["apparel", "compression", "training", "seamless", "new"]',
  'published',
  58.00,
  'Aero-Knit Seamless Compression Tee | Apex Apparel',
  'Stay cool and supported with our premier seamless compression training shirt.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 4: Technical Apparel
(
  'prod-vapor-jacket',
  'Vapor-Shield Weatherproof Windbreaker',
  'vapor-shield-weatherproof-windbreaker',
  'Ultra-light 2.5-layer storm shell with DWR finish, packable into its own chest pocket.',
  'Weighing under 180 grams, the Vapor-Shield Windbreaker provides impervious barrier protection against gusting winds and driving rain without sacrificing breathability during threshold efforts.',
  'VPR-SHD-JKT',
  140.00,
  119.00,
  52.00,
  25,
  'in_stock',
  4,
  1,
  0,
  'cat-apparel',
  'Vanguard Sport',
  '["apparel", "jacket", "windbreaker", "weatherproof"]',
  'published',
  140.00,
  'Vapor-Shield Weatherproof Windbreaker | Vanguard Sport',
  'Packable, lightweight storm jacket engineered for outdoor runners.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 5: Pro Equipment
(
  'prod-titan-kettlebell',
  'Titan-Grip Precision Competition Kettlebell',
  'titan-grip-precision-competition-kettlebell',
  'Uniform dimension cast steel kettlebell with color-coded handle and balanced mass center.',
  'Crafted to international competition specifications. Features a bare steel handle with fine texture for superior chalk retention and zero blistering over high-rep snatches.',
  'TTN-KB-24KG',
  85.00,
  72.00,
  35.00,
  35,
  'in_stock',
  5,
  1,
  0,
  'cat-equipment',
  'Apex Athletics',
  '["equipment", "kettlebell", "strength", "competition"]',
  'published',
  85.00,
  'Titan-Grip Precision Competition Kettlebell',
  'Flawlessly balanced competition kettlebell for explosive strength workouts.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 6: Pro Equipment
(
  'prod-velocity-barbell',
  'Kinetic Olympic Training Barbell 20kg',
  'kinetic-olympic-training-barbell-20kg',
  '215,000 PSI tensile strength steel bar with precision needle bearings and dual knurl marks.',
  'Engineered for weightlifters who demand consistent whip and smooth sleeve rotation under maximum loads. Hard chrome finish protects against corrosion in high-humidity training gyms.',
  'KNT-OLY-20KG',
  295.00,
  NULL,
  120.00,
  18,
  'in_stock',
  3,
  1,
  0,
  'cat-equipment',
  'Kinetics Lab',
  '["equipment", "barbell", "olympic", "powerlifting"]',
  'published',
  295.00,
  'Kinetic Olympic Training Barbell 20kg | Kinetics Lab',
  'Competition-grade Olympic barbell built for power cleans and heavy deadlifts.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 7: Recovery & Tech
(
  'prod-cryo-gun',
  'Cryo-Pulse Percussion Recovery Gun',
  'cryo-pulse-percussion-recovery-gun',
  'Quiet-glide brushless motor delivering 14mm amplitude with hot and cold attachment heads.',
  'Target deep myofascial tension with rapid percussion. Features 5 speed settings ranging from 1,400 to 3,200 RPM and a rechargeable lithium-ion battery providing up to 6 hours of continuous operation.',
  'CRY-PLS-GUN',
  220.00,
  189.00,
  85.00,
  40,
  'in_stock',
  6,
  1,
  0,
  'cat-recovery',
  'Pulse Pro',
  '["recovery", "massage", "percussion", "tech", "bestseller"]',
  'published',
  220.00,
  'Cryo-Pulse Percussion Recovery Gun | Deep Tissue Recovery',
  'Relieve soreness and accelerate tissue repair with thermal percussive therapy.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 8: Recovery & Tech
(
  'prod-compression-boots',
  'Hydro-Flex Compression Recovery Boots',
  'hydro-flex-compression-recovery-boots',
  'Dynamic pneumatic leg compression system with 6 overlapping chambers and digital pressure presets.',
  'Flushes metabolic waste and revitalizes heavy legs after grueling mileage. Fully customizable pressure zones up to 240 mmHg with calibrated gradient inflation cycles.',
  'HDR-FLX-BTS',
  340.00,
  299.00,
  140.00,
  15,
  'in_stock',
  3,
  1,
  0,
  'cat-recovery',
  'Chronicle Elite',
  '["recovery", "boots", "compression", "circulation"]',
  'published',
  340.00,
  'Hydro-Flex Compression Recovery Boots | Chronicle Elite',
  'Clinical pneumatic recovery boots for rapid post-run rejuvenation.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 9: Accessories
(
  'prod-aero-pack',
  'AeroSpeed Ultralight Hydration Pack 5L',
  'aerospeed-ultralight-hydration-pack-5l',
  'Form-fitting ergonomic vest with dual 500ml soft flasks and zero-bounce chest harness.',
  'Designed for ultra-marathoners requiring streamlined access to fuel, hydration, and layers. Features breathable mesh backing and pole-attachment shock cords.',
  'AER-SPD-PCK',
  78.00,
  64.00,
  26.00,
  50,
  'in_stock',
  8,
  1,
  0,
  'cat-accessories',
  'Vanguard Sport',
  '["accessories", "hydration", "vest", "running"]',
  'published',
  78.00,
  'AeroSpeed Ultralight Hydration Pack 5L | Vanguard',
  'Zero-bounce lightweight hydration vest for ultra-distance athletes.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Product 10: Accessories
(
  'prod-thermal-bottle',
  'Quantum-Flow Insulated Thermal Bottle 750ml',
  'quantum-flow-insulated-thermal-bottle-750ml',
  'Triple-wall vacuum insulated stainless bottle with high-flow magnetic spout cap.',
  'Keeps electrolyte drinks ice cold for up to 36 hours. Constructed with 18/8 food-grade pro steel that leaves zero metallic aftertaste and resists heavy denting.',
  'QNT-FLW-BTL',
  42.00,
  34.00,
  12.00,
  75,
  'in_stock',
  10,
  1,
  0,
  'cat-accessories',
  'Apex Athletic',
  '["accessories", "bottle", "hydration", "thermal"]',
  'published',
  42.00,
  'Quantum-Flow Insulated Thermal Bottle 750ml',
  'High-flow insulated sports hydration bottle for training sessions.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 3. Insert Product Images (Main + 2 Gallery images each)
-- Apex Velocity Runner X1
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-vrx1-1', 'prod-apex-vrx1', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=75', 'Apex Velocity Runner X1 Red/Black Angle', 1, 1),
('img-vrx1-2', 'prod-apex-vrx1', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=75', 'Apex Velocity Runner X1 White Side Profile', 2, 0),
('img-vrx1-3', 'prod-apex-vrx1', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=75', 'Apex Velocity Runner X1 Carbon Sole Plate', 3, 0);

-- Pulse Enduro Carbon Pro
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-pls-1', 'prod-pulse-enduro', 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=75', 'Pulse Enduro Carbon Pro Main View', 1, 1),
('img-pls-2', 'prod-pulse-enduro', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=75', 'Pulse Enduro Running Shoes Top View', 2, 0),
('img-pls-3', 'prod-pulse-enduro', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=75', 'Pulse Enduro Outsole Traction', 3, 0);

-- Aero-Knit Seamless Compression Tee
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-knt-1', 'prod-aero-knit-tee', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=75', 'Aero-Knit Seamless Compression Tee Front', 1, 1),
('img-knt-2', 'prod-aero-knit-tee', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=75', 'Aero-Knit Athletic Fit Texture', 2, 0),
('img-knt-3', 'prod-aero-knit-tee', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=75', 'Aero-Knit Training Motion', 3, 0);

-- Vapor-Shield Weatherproof Windbreaker
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-vpr-1', 'prod-vapor-jacket', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=75', 'Vapor-Shield Windbreaker Front Profile', 1, 1),
('img-vpr-2', 'prod-vapor-jacket', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=75', 'Vapor-Shield Fabric Water Resistance', 2, 0),
('img-vpr-3', 'prod-vapor-jacket', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=75', 'Vapor-Shield Storm Hood Closure', 3, 0);

-- Titan-Grip Precision Competition Kettlebell
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-ttn-1', 'prod-titan-kettlebell', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=800&q=75', 'Titan-Grip Competition Kettlebell Steel', 1, 1),
('img-ttn-2', 'prod-titan-kettlebell', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=75', 'Titan-Grip Gym Workout Setting', 2, 0),
('img-ttn-3', 'prod-titan-kettlebell', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=75', 'Titan-Grip Handle Detail', 3, 0);

-- Kinetic Olympic Training Barbell 20kg
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-oly-1', 'prod-velocity-barbell', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=75', 'Kinetic Olympic Barbell In Rack', 1, 1),
('img-oly-2', 'prod-velocity-barbell', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=75', 'Kinetic Barbell Knurling Texture', 2, 0),
('img-oly-3', 'prod-velocity-barbell', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=75', 'Barbell Plate Loading View', 3, 0);

-- Cryo-Pulse Percussion Recovery Gun
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-cry-1', 'prod-cryo-gun', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=75', 'Cryo-Pulse Percussion Gun Device', 1, 1),
('img-cry-2', 'prod-cryo-gun', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=75', 'Cryo-Pulse Interchangeable Heads', 2, 0),
('img-cry-3', 'prod-cryo-gun', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=75', 'Cryo-Pulse Storage Case', 3, 0);

-- Hydro-Flex Compression Recovery Boots
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-hdr-1', 'prod-compression-boots', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=75', 'Hydro-Flex Recovery Boots In Use', 1, 1),
('img-hdr-2', 'prod-compression-boots', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=75', 'Digital Controller Interface', 2, 0),
('img-hdr-3', 'prod-compression-boots', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=75', 'Compression Boots Material and Zippers', 3, 0);

-- AeroSpeed Ultralight Hydration Pack 5L
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-pck-1', 'prod-aero-pack', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=75', 'AeroSpeed Hydration Vest Front', 1, 1),
('img-pck-2', 'prod-aero-pack', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=75', 'AeroSpeed Flask Pockets Detail', 2, 0),
('img-pck-3', 'prod-aero-pack', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=75', 'AeroSpeed Trail Action Shot', 3, 0);

-- Quantum-Flow Insulated Thermal Bottle 750ml
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main) VALUES
('img-btl-1', 'prod-thermal-bottle', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=75', 'Quantum-Flow Stainless Bottle Matte Purple', 1, 1),
('img-btl-2', 'prod-thermal-bottle', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=75', 'Quantum-Flow High Spout Cap', 2, 0),
('img-btl-3', 'prod-thermal-bottle', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=75', 'Quantum-Flow Lifestyle Gym Setting', 3, 0);

-- 4. Synchronize the 9 Homepage Sections in D1
INSERT OR REPLACE INTO homepage_sections (id, type, title, content, image_url, sort_order, is_active, created_at, updated_at) VALUES
(
  'sec-hero-banner',
  'hero',
  'Main Hero Showcase',
  '{"slides":[{"badge":"Special Offer • New Season","heading":"Elevate Your Motion with Pure Precision","subheading":"Explore the new Spring Purple Collection. Engineered with micro-knit breathable fabrics and ultra-responsive lightweight foam soles.","primaryButtonText":"Shop Collection","primaryButtonUrl":"/shop","secondaryButtonText":"Explore Categories","secondaryButtonUrl":"#category-cards","imageUrl":"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop","imageAlt":"Spring Purple Collection"},{"badge":"Limited Edition Drop","heading":"Carbon Velocity Racing Series","subheading":"Tested by world-class marathoners. Feel 32% enhanced energy return on every stride with carbon-infused composite plates.","primaryButtonText":"Discover Velocity","primaryButtonUrl":"/shop","secondaryButtonText":"View Top Rated","secondaryButtonUrl":"#trending-products","imageUrl":"https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop","imageAlt":"Carbon Velocity Footwear"},{"badge":"Trending Worldwide","heading":"Uncompromising Everyday Elegance","subheading":"Minimalist luxury athletic wear designed for seamless transition from high-intensity training to urban streetwear.","primaryButtonText":"Explore Now","primaryButtonUrl":"/shop","secondaryButtonText":"About Our Story","secondaryButtonUrl":"/about","imageUrl":"https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop","imageAlt":"Everyday Luxury Athletics"}]}',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-categories-grid',
  'categories',
  'Featured Collections',
  '{"heading":"Featured Collections","badgeText":"Curated Categories","maxItems":5,"viewAllUrl":"/shop"}',
  NULL,
  2,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-featured-products',
  'trending_products',
  'Trending Products',
  '{"heading":"Trending Products","badgeText":"Customer Favorites","maxItems":5,"viewAllUrl":"/shop"}',
  NULL,
  3,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-trust-bar',
  'trust_bar',
  'Store Trust Bar',
  '{"items":[{"icon":"shipping","title":"Free Worldwide Shipping","description":"On all orders over $50 with live tracking"},{"icon":"return","title":"30-Day Return Policy","description":"Hassle-free exchange & money back guarantee"},{"icon":"secure","title":"Secure Payment","description":"256-bit encrypted checkout protection"},{"icon":"support","title":"24/7 Customer Support","description":"Dedicated concierge team ready to help"}]}',
  NULL,
  4,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-promo-banner',
  'promo_banner',
  'Mid-Season Breakthrough Banner',
  '{"heading":"Accelerate Beyond Limits with Carbon-Plate Tech","subheading":"Experience 32% greater energy return with our award-winning composite foam and zero-friction matrix. Engineered for athletes who push boundaries.","badgeText":"Limited Edition Release","buttonText":"Discover Apex Velocity","buttonUrl":"/product/apex-velocity-runner-x1","bannerStyle":"split"}',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop',
  5,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-brand-story',
  'brand_story',
  'The Apex Standard Brand Story',
  '{"heading":"Built at the Intersection of Innovation & Human Potential","subheading":"Our Performance Manifesto","narrativeText":"We engineer apparel and equipment with relentless attention to biomechanics and endurance. Featherlight materials, hyper-durable composites, and uncompromising ergonomics for athletes who refuse to settle. Every product is stress-tested in elite athletic facilities.","statItems":[{"label":"Fast Dispatch","value":"< 24h","desc":"Express delivery dispatch"},{"label":"Energy Return","value":"+32%","desc":"Carbon-matrix tech"},{"label":"Active Athletes","value":"25,000+","desc":"Worldwide community"},{"label":"Customer Rating","value":"99.4%","desc":"Verified athlete satisfaction"}],"ctaText":"Explore The Full Catalog","ctaUrl":"/shop"}',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  6,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-new-arrivals',
  'new_arrivals',
  'New Arrivals Showcase',
  '{"badge":"New Collection","heading":"New Arrivals Just For You","discountText":"Save up to 40% OFF on first order","subheading":"Experience cutting-edge athletic engineering designed for fluid movement and modern luxury.","buttonText":"Shop Now","buttonUrl":"/shop","imageUrl":"https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"}',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
  7,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-brand-logos',
  'brand_logos',
  'Brand Partners',
  '{"heading":"Trusted by World-Class Champions & Athletic Leaders","logos":[{"name":"Vanguard Sport","logoText":"VANGUARD"},{"name":"Apex Athletics","logoText":"APEX//LAB"},{"name":"Kinetics Lab","logoText":"KINETICS"},{"name":"Aero Velocity","logoText":"AERO VELOCITY"},{"name":"Pulse Endurance","logoText":"PULSE PRO"},{"name":"Chronicle Elite","logoText":"CHRONICLE"}]}',
  NULL,
  8,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'sec-newsletter',
  'newsletter',
  'Newsletter Subscription',
  '{"badgeText":"VIP Membership","heading":"Subscribe to Our Newsletter","subheading":"Get updates on our latest offers, training insights, and limited-edition colorway launches directly to your inbox.","buttonText":"Subscribe","placeholderText":"Enter your email address...","disclaimer":"We respect your privacy. Unsubscribe at any time with one click."}',
  NULL,
  9,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

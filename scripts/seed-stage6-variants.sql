-- Seed product with 4 variants (2 Colors x 2 Sizes)
INSERT OR REPLACE INTO products (
  id, name, slug, description, short_description, sku,
  price, sale_price, cost_price, compare_at_price,
  stock_quantity, stock_status, low_stock_threshold,
  track_inventory, allow_backorders, brand, tags,
  status, seo_title, seo_description, created_at, updated_at
) VALUES (
  'prod-apex-vrx1',
  'Apex Velocity Runner X1',
  'apex-velocity-runner-x1',
  'Engineered for maximum kinetic energy return and ergonomic sprint stability. Features breathable adaptive engineered knit mesh, featherlight nitrogen-infused midsole cushioning, and ultra-durable carbon rubber outsole pods.',
  'High-performance road running sneaker with modular color and size configurations.',
  'APEX-VRX1',
  160.0,
  139.99,
  55.0,
  180.0,
  35,
  'in_stock',
  5,
  1,
  0,
  'Apex Athletic',
  '["running", "sneakers", "footwear", "performance"]',
  'published',
  'Apex Velocity Runner X1 - Modular Performance Sneaker',
  'Shop Apex Velocity Runner X1 with customizable colors and sizes. Fast edge delivery.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Main & Gallery Images
INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, sort_order, is_main)
VALUES 
  ('img-vrx1-main', 'prod-apex-vrx1', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Apex Velocity Runner X1 Obsidian Black', 0, 1),
  ('img-vrx1-white', 'prod-apex-vrx1', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5', 'Apex Velocity Runner X1 Arctic White', 1, 0);

-- Product Variants
INSERT OR REPLACE INTO product_variants (
  id, product_id, sku, price, sale_price, stock, image_url, options, weight, dimensions, is_default
) VALUES
  (
    'var-vrx1-blk-9',
    'prod-apex-vrx1',
    'APEX-VRX1-BLK-9',
    160.0,
    139.99,
    15,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    '{"Color":"Obsidian Black","Size":"US 9"}',
    0.72,
    '{"length":30,"width":20,"height":12,"unit":"cm"}',
    1
  ),
  (
    'var-vrx1-blk-10',
    'prod-apex-vrx1',
    'APEX-VRX1-BLK-10',
    160.0,
    139.99,
    8,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    '{"Color":"Obsidian Black","Size":"US 10"}',
    0.75,
    '{"length":31,"width":20,"height":12,"unit":"cm"}',
    0
  ),
  (
    'var-vrx1-wht-9',
    'prod-apex-vrx1',
    'APEX-VRX1-WHT-9',
    170.0,
    NULL,
    12,
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
    '{"Color":"Arctic White","Size":"US 9"}',
    0.72,
    '{"length":30,"width":20,"height":12,"unit":"cm"}',
    0
  ),
  (
    'var-vrx1-wht-10',
    'prod-apex-vrx1',
    'APEX-VRX1-WHT-10',
    170.0,
    159.99,
    0,
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
    '{"Color":"Arctic White","Size":"US 10"}',
    0.75,
    '{"length":31,"width":20,"height":12,"unit":"cm"}',
    0
  );

-- Attributes
INSERT OR REPLACE INTO attributes (id, name, slug, created_at)
VALUES
  ('attr-color', 'Color', 'color', CURRENT_TIMESTAMP),
  ('attr-size', 'Size', 'size', CURRENT_TIMESTAMP);

-- Attribute Values
INSERT OR REPLACE INTO attribute_values (id, attribute_id, value, created_at)
VALUES
  ('val-color-blk', 'attr-color', 'Obsidian Black', CURRENT_TIMESTAMP),
  ('val-color-wht', 'attr-color', 'Arctic White', CURRENT_TIMESTAMP),
  ('val-size-9', 'attr-size', 'US 9', CURRENT_TIMESTAMP),
  ('val-size-10', 'attr-size', 'US 10', CURRENT_TIMESTAMP);

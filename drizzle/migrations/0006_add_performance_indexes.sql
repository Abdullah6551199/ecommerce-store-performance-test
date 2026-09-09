-- Performance Indexes for Stage 3 Optimization
CREATE INDEX IF NOT EXISTS `idx_products_category_id` ON `products`(`category_id`);
CREATE INDEX IF NOT EXISTS `idx_products_status` ON `products`(`status`);
CREATE INDEX IF NOT EXISTS `idx_product_images_product_id` ON `product_images`(`product_id`);
CREATE INDEX IF NOT EXISTS `idx_product_variants_product_id` ON `product_variants`(`product_id`);
CREATE INDEX IF NOT EXISTS `idx_categories_parent_id` ON `categories`(`parent_id`);
CREATE INDEX IF NOT EXISTS `idx_media_created_at` ON `media`(`created_at`);
CREATE INDEX IF NOT EXISTS `idx_homepage_sections_sort_order` ON `homepage_sections`(`sort_order`);
CREATE INDEX IF NOT EXISTS `idx_homepage_sections_is_active` ON `homepage_sections`(`is_active`);

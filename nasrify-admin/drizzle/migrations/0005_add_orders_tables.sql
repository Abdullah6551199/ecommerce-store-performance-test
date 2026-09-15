CREATE TABLE IF NOT EXISTS `orders` (
  `id` text PRIMARY KEY NOT NULL,
  `customer_name` text NOT NULL,
  `phone` text NOT NULL,
  `email` text,
  `address` text NOT NULL,
  `city` text NOT NULL,
  `notes` text,
  `subtotal` real NOT NULL,
  `shipping` real NOT NULL,
  `total` real NOT NULL,
  `payment_method` text DEFAULT 'cod' NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `product_id` text NOT NULL,
  `variant_id` text,
  `product_name` text NOT NULL,
  `variant_name` text,
  `quantity` integer NOT NULL,
  `unit_price` real NOT NULL,
  `line_total` real NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX IF NOT EXISTS `idx_orders_status` ON `orders`(`status`);
CREATE INDEX IF NOT EXISTS `idx_orders_created_at` ON `orders`(`created_at`);
CREATE INDEX IF NOT EXISTS `idx_order_items_order_id` ON `order_items`(`order_id`);

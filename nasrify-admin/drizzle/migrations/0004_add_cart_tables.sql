CREATE TABLE IF NOT EXISTS `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`session_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_carts_session_id` ON `carts` (`session_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_carts_user_id` ON `carts` (`user_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cart_items_cart_id` ON `cart_items` (`cart_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cart_items_product_id` ON `cart_items` (`product_id`);

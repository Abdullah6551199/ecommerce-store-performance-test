import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

/**
 * ==============================================================================
 * Cloudflare D1 Database Schema for Dynamic E-Commerce Store
 * Minimal for MVP, fully extensible, zero hardcoded business data.
 * ==============================================================================
 */

// 1. Categories Table (hierarchical with parent_id self-reference)
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: text("parent_id"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  status: text("status", { enum: ["active", "inactive", "archived"] })
    .default("active")
    .notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 2. Products Table
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  sku: text("sku").unique(),
  price: real("price").notNull(),
  salePrice: real("sale_price"),
  costPrice: real("cost_price"),
  compareAtPrice: real("compare_at_price"),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  stockStatus: text("stock_status", {
    enum: ["in_stock", "out_of_stock", "backorder", "preorder"],
  })
    .default("in_stock")
    .notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
  trackInventory: integer("track_inventory", { mode: "boolean" })
    .default(true)
    .notNull(),
  allowBackorders: integer("allow_backorders", { mode: "boolean" })
    .default(false)
    .notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  brand: text("brand"),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .default("draft")
    .notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 3. Product Images Table
export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isMain: integer("is_main", { mode: "boolean" }).default(false).notNull(),
});

// 4. Product Variants Table
export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").unique(),
  price: real("price").notNull(),
  salePrice: real("sale_price"),
  stock: integer("stock").default(0).notNull(),
  imageUrl: text("image_url"),
  options: text("options", { mode: "json" }).$type<Record<string, string>>(),
  weight: real("weight"),
  dimensions: text("dimensions", { mode: "json" }).$type<{
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  }>(),
  isDefault: integer("is_default", { mode: "boolean" })
    .default(false)
    .notNull(),
});

// 5. Media Table
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  type: text("type").notNull(), // e.g. 'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4'
  altText: text("alt_text"),
  size: integer("size").notNull(), // in bytes
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 6. Settings Table (Key-Value configuration storage)
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value", { mode: "json" }).$type<unknown>(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 7. Homepage Sections Table (Dynamic marketing and showcase builder)
export const homepageSections = sqliteTable("homepage_sections", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // e.g. 'hero_banner', 'featured_products', 'brand_strip', 'promo_grid'
  title: text("title").notNull(),
  content: text("content", { mode: "json" }).$type<Record<string, unknown>>(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 8. Users Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("admin").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 9. Login Attempts Table (Rate limiting tracker)
export const loginAttempts = sqliteTable("login_attempts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  attemptedAt: text("attempted_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  success: integer("success", { mode: "boolean" }).notNull(),
  ip: text("ip"),
});

// 10. Sessions Table (Server-side session management)
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 11. Attributes Table
export const attributes = sqliteTable("attributes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 12. Attribute Values Table
export const attributeValues = sqliteTable("attribute_values", {
  id: text("id").primaryKey(),
  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Relations Definitions
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "sub_categories",
  }),
  subCategories: many(categories, { relationName: "sub_categories" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const attributesRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
}));

export const attributeValuesRelations = relations(attributeValues, ({ one }) => ({
  attribute: one(attributes, {
    fields: [attributeValues.attributeId],
    references: [attributes.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// 13. Carts Table (guest and authenticated carts)
export const carts = sqliteTable("carts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"), // For anonymous guest carts via cookie
  status: text("status", { enum: ["active", "converted", "abandoned"] })
    .default("active")
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 14. Cart Items Table
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  cartId: text("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: real("unit_price").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

// 15. Orders Table
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  notes: text("notes"),
  subtotal: real("subtotal").notNull(),
  shipping: real("shipping").notNull(),
  discountAmount: real("discount_amount").default(0).notNull(),
  discountCode: text("discount_code"),
  discountType: text("discount_type"),
  total: real("total").notNull(),
  paymentMethod: text("payment_method").default("cod").notNull(),
  status: text("status", {
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ],
  })
    .default("pending")
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 16. Order Items Table
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  variantId: text("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  variantName: text("variant_name"),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  lineTotal: real("line_total").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 17. Coupons Table
export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id"),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type", {
    enum: [
      "percentage",
      "fixed",
      "free_shipping",
      "buy_x_get_y",
      "category",
      "product",
      "min_order",
      "first_order",
    ],
  }).notNull(),
  value: real("value").notNull(),
  minOrderValue: real("min_order_value"),
  maxDiscount: real("max_discount"),
  applyTo: text("apply_to").default("all"), // 'all', 'category', 'product'
  applyToId: text("apply_to_id"),
  buyQuantity: integer("buy_quantity"),
  getQuantity: integer("get_quantity"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  perCustomerLimit: integer("per_customer_limit").default(1).notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  firstOrderOnly: integer("first_order_only", { mode: "boolean" }).default(false).notNull(),
  isVisible: integer("is_visible", { mode: "boolean" }).default(true).notNull(),
  isAutoApply: integer("is_auto_apply", { mode: "boolean" }).default(false).notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// 18. Coupon Usages Table
export const couponUsages = sqliteTable("coupon_usages", {
  id: text("id").primaryKey(),
  couponId: text("coupon_id")
    .notNull()
    .references(() => coupons.id, { onDelete: "cascade" }),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  customerEmail: text("customer_email"),
  customerId: text("customer_id"),
  discountAmount: real("discount_amount").notNull(),
  usedAt: text("used_at").notNull(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  couponUsages: many(couponUsages),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  usages: many(couponUsages),
}));

export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsages.couponId],
    references: [coupons.id],
  }),
  order: one(orders, {
    fields: [couponUsages.orderId],
    references: [orders.id],
  }),
}));

// Export inferred types for each table
export type CategoryRecord = typeof categories.$inferSelect;
export type NewCategoryRecord = typeof categories.$inferInsert;

export type ProductRecord = typeof products.$inferSelect;
export type NewProductRecord = typeof products.$inferInsert;

export type ProductImageRecord = typeof productImages.$inferSelect;
export type NewProductImageRecord = typeof productImages.$inferInsert;

export type ProductVariantRecord = typeof productVariants.$inferSelect;
export type NewProductVariantRecord = typeof productVariants.$inferInsert;

export type AttributeRecord = typeof attributes.$inferSelect;
export type NewAttributeRecord = typeof attributes.$inferInsert;

export type AttributeValueRecord = typeof attributeValues.$inferSelect;
export type NewAttributeValueRecord = typeof attributeValues.$inferInsert;

export type MediaRecord = typeof media.$inferSelect;
export type NewMediaRecord = typeof media.$inferInsert;

export type SettingRecord = typeof settings.$inferSelect;
export type NewSettingRecord = typeof settings.$inferInsert;

export type HomepageSectionRecord = typeof homepageSections.$inferSelect;
export type NewHomepageSectionRecord = typeof homepageSections.$inferInsert;

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

export type LoginAttemptRecord = typeof loginAttempts.$inferSelect;
export type NewLoginAttemptRecord = typeof loginAttempts.$inferInsert;

export type SessionRecord = typeof sessions.$inferSelect;
export type NewSessionRecord = typeof sessions.$inferInsert;

export type CartRecord = typeof carts.$inferSelect;
export type NewCartRecord = typeof carts.$inferInsert;

export type CartItemRecord = typeof cartItems.$inferSelect;
export type NewCartItemRecord = typeof cartItems.$inferInsert;

export type OrderRecord = typeof orders.$inferSelect;
export type NewOrderRecord = typeof orders.$inferInsert;

export type OrderItemRecord = typeof orderItems.$inferSelect;
export type NewOrderItemRecord = typeof orderItems.$inferInsert;

export type CouponRecord = typeof coupons.$inferSelect;
export type NewCouponRecord = typeof coupons.$inferInsert;

export type CouponUsageRecord = typeof couponUsages.$inferSelect;
export type NewCouponUsageRecord = typeof couponUsages.$inferInsert;



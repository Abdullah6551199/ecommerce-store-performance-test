import { z } from "zod";
import { eq, desc, asc, and, or, sql, like, inArray } from "drizzle-orm";
import { getDb, products, productImages, productVariants, categories } from "./db";
import { generateSlug } from "./categories";
import { getVariantsByProductId, saveProductVariants, type ProductVariantRecord } from "./variants";

/**
 * ==============================================================================
 * Product Types & Interfaces
 * ==============================================================================
 */

export interface ProductImageRecord {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isMain: boolean;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  price: number;
  salePrice: number | null;
  costPrice: number | null;
  compareAtPrice: number | null;
  stockQuantity: number;
  stockStatus: "in_stock" | "out_of_stock" | "backorder" | "preorder";
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  categoryId: string | null;
  brand: string | null;
  tags: string[] | null;
  status: "draft" | "published" | "archived";
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithImagesAndCategory extends ProductRecord {
  images: ProductImageRecord[];
  mainImage: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  variants?: ProductVariantRecord[];
}

/**
 * Zod validation schema for creating and updating products
 */
export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required").max(150, "Name cannot exceed 150 characters"),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(160, "Slug cannot exceed 160 characters")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .max(64, "SKU cannot exceed 64 characters")
      .regex(/^[A-Za-z0-9-_]+$/, "SKU may only contain letters, numbers, hyphens, and underscores"),
    shortDescription: z.string().trim().max(300, "Short description cannot exceed 300 characters").optional().nullable().or(z.literal("")),
    description: z.string().trim().max(5000, "Description cannot exceed 5000 characters").optional().nullable().or(z.literal("")),
    price: z.coerce.number().positive("Regular price must be greater than zero"),
    salePrice: z.coerce.number().positive("Sale price must be positive").optional().nullable().or(z.literal("")),
    costPrice: z.coerce.number().nonnegative("Cost price cannot be negative").optional().nullable().or(z.literal("")),
    compareAtPrice: z.coerce.number().positive("Compare-at price must be positive").optional().nullable().or(z.literal("")),
    stockQuantity: z.coerce.number().int().nonnegative("Stock quantity cannot be negative").default(0),
    stockStatus: z.enum(["in_stock", "out_of_stock", "backorder", "preorder"]).default("in_stock"),
    lowStockThreshold: z.coerce.number().int().nonnegative().default(5),
    trackInventory: z.boolean().default(true),
    allowBackorders: z.boolean().default(false),
    categoryId: z.string().trim().optional().nullable().or(z.literal("")),
    brand: z.string().trim().max(100).optional().nullable().or(z.literal("")),
    tags: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    status: z.enum(["draft", "published", "archived"]).default("published"),
    mainImage: z.string().trim().min(1, "Main product image is required"),
    galleryImages: z.array(z.string().trim().min(1)).optional().default([]),
    seoTitle: z.string().trim().max(160).optional().nullable().or(z.literal("")),
    seoDescription: z.string().trim().max(320).optional().nullable().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.salePrice !== undefined && data.salePrice !== null && data.salePrice !== "" && Number(data.salePrice) > 0) {
        return Number(data.salePrice) < Number(data.price);
      }
      return true;
    },
    {
      message: "Sale price must be less than regular price",
      path: ["salePrice"],
    }
  );

export type ProductInput = z.infer<typeof productSchema>;

/**
 * ==============================================================================
 * In-Memory Fallback Store (for unit testing / isolated environments)
 * ==============================================================================
 */

const memoryProducts: ProductRecord[] = [];
const memoryProductImages: ProductImageRecord[] = [];

/**
 * Format raw database row and associated images into ProductWithImagesAndCategory
 */
function formatProduct(
  p: ProductRecord,
  imgs: ProductImageRecord[],
  category?: { name: string; slug: string } | null,
  variants?: ProductVariantRecord[]
): ProductWithImagesAndCategory {
  const sortedImgs = [...imgs].sort((a, b) => a.sortOrder - b.sortOrder);
  const defaultVar = variants?.find((v) => v.isDefault);
  const main = defaultVar?.imageUrl || sortedImgs.find((img) => img.isMain)?.imageUrl || sortedImgs[0]?.imageUrl || null;

  return {
    ...p,
    images: sortedImgs,
    mainImage: main,
    categoryName: category?.name || null,
    categorySlug: category?.slug || null,
    variants: variants || [],
  };
}

/**
 * Parse tags from either string or string[] into clean string[]
 */
export function normalizeTags(input: string[] | string | null | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((t) => t.trim()).filter(Boolean);
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * ==============================================================================
 * Database Operations
 * ==============================================================================
 */

/**
 * List all products with optional filters
 */
export async function listProducts(options?: {
  categoryId?: string;
  status?: "draft" | "published" | "archived";
  limit?: number;
}): Promise<ProductWithImagesAndCategory[]> {
  const db = getDb();

  if (db) {
    try {
      let conditions = [];
      if (options?.categoryId) {
        conditions.push(eq(products.categoryId, options.categoryId));
      }
      if (options?.status) {
        conditions.push(eq(products.status, options.status));
      }

      let query = db
        .select({
          product: products,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id));

      const rows = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(products.createdAt))
        : await query.orderBy(desc(products.createdAt));

      if (rows.length === 0) return [];

      const productIds = rows.map((r) => r.product.id);

      // Fetch images for all matched products in a single batch
      const imagesRows = await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(asc(productImages.sortOrder));

      const imageMap = new Map<string, ProductImageRecord[]>();
      for (const img of imagesRows) {
        if (!imageMap.has(img.productId)) {
          imageMap.set(img.productId, []);
        }
        imageMap.get(img.productId)!.push(img as ProductImageRecord);
      }

      // Fetch variants for all matched products in a single batch
      const variantsRows = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds))
        .orderBy(desc(productVariants.isDefault), asc(productVariants.sku));

      const variantMap = new Map<string, ProductVariantRecord[]>();
      for (const v of variantsRows) {
        if (!variantMap.has(v.productId)) {
          variantMap.set(v.productId, []);
        }
        let opts: Record<string, string> = {};
        if (v.options) {
          try {
            opts = typeof v.options === "string" ? JSON.parse(v.options) : v.options;
          } catch {
            opts = {};
          }
        }
        let dims = null;
        if (v.dimensions) {
          try {
            dims = typeof v.dimensions === "string" ? JSON.parse(v.dimensions) : v.dimensions;
          } catch {
            dims = null;
          }
        }
        variantMap.get(v.productId)!.push({
          id: v.id,
          productId: v.productId,
          sku: v.sku || "",
          price: Number(v.price),
          salePrice: v.salePrice !== null && v.salePrice !== undefined ? Number(v.salePrice) : null,
          stock: Number(v.stock) || 0,
          imageUrl: v.imageUrl || null,
          options: opts,
          weight: v.weight ? Number(v.weight) : null,
          dimensions: dims,
          isDefault: Boolean(v.isDefault),
        });
      }

      return rows.map((row) =>
        formatProduct(
          row.product as ProductRecord,
          imageMap.get(row.product.id) || [],
          row.categoryName ? { name: row.categoryName, slug: row.categorySlug || "" } : null,
          variantMap.get(row.product.id) || []
        )
      );
    } catch (err) {
      console.warn("[Products] D1 listProducts failed, falling back to memory:", err);
    }
  }

  // Memory fallback
  let items = [...memoryProducts];
  if (options?.categoryId) {
    items = items.filter((p) => p.categoryId === options.categoryId);
  }
  if (options?.status) {
    items = items.filter((p) => p.status === options.status);
  }
  if (options?.limit) {
    items = items.slice(0, options.limit);
  }

  return items.map((p) => {
    const imgs = memoryProductImages.filter((img) => img.productId === p.id);
    return formatProduct(p, imgs, null);
  });
}

/**
 * Retrieve a single product by ID
 */
export async function getProductById(id: string): Promise<ProductWithImagesAndCategory | null> {
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select({
          product: products,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, id))
        .limit(1);

      if (rows.length === 0) return null;

      const imgs = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(asc(productImages.sortOrder));

      const variants = await getVariantsByProductId(id);

      return formatProduct(
        rows[0].product as ProductRecord,
        imgs as ProductImageRecord[],
        rows[0].categoryName ? { name: rows[0].categoryName, slug: rows[0].categorySlug || "" } : null,
        variants
      );
    } catch (err) {
      console.warn("[Products] D1 getProductById failed:", err);
    }
  }

  const p = memoryProducts.find((item) => item.id === id);
  if (!p) return null;
  const imgs = memoryProductImages.filter((img) => img.productId === p.id);
  const variants = await getVariantsByProductId(id);
  return formatProduct(p, imgs, null, variants);
}

/**
 * Retrieve a single product by Slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithImagesAndCategory | null> {
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select({
          product: products,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.slug, slug))
        .limit(1);

      if (rows.length === 0) return null;

      const imgs = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, rows[0].product.id))
        .orderBy(asc(productImages.sortOrder));

      const variants = await getVariantsByProductId(rows[0].product.id);

      return formatProduct(
        rows[0].product as ProductRecord,
        imgs as ProductImageRecord[],
        rows[0].categoryName ? { name: rows[0].categoryName, slug: rows[0].categorySlug || "" } : null,
        variants
      );
    } catch (err) {
      console.warn("[Products] D1 getProductBySlug failed:", err);
    }
  }

  const p = memoryProducts.find((item) => item.slug === slug);
  if (!p) return null;
  const imgs = memoryProductImages.filter((img) => img.productId === p.id);
  const variants = await getVariantsByProductId(p.id);
  return formatProduct(p, imgs, null, variants);
}

/**
 * Check if SKU is already in use
 */
export async function isSkuTaken(sku: string, excludeId?: string): Promise<boolean> {
  const normalized = sku.trim().toUpperCase();
  const db = getDb();

  if (db) {
    try {
      const query = db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.sku, normalized));

      const rows = await query;
      if (rows.length === 0) return false;
      if (excludeId && rows.length === 1 && rows[0].id === excludeId) return false;
      return true;
    } catch (err) {
      console.warn("[Products] isSkuTaken check failed in D1:", err);
    }
  }

  return memoryProducts.some((p) => p.sku === normalized && p.id !== excludeId);
}

/**
 * Check if Slug is already in use
 */
export async function isProductSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const normalized = slug.trim().toLowerCase();
  const db = getDb();

  if (db) {
    try {
      const query = db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, normalized));

      const rows = await query;
      if (rows.length === 0) return false;
      if (excludeId && rows.length === 1 && rows[0].id === excludeId) return false;
      return true;
    } catch (err) {
      console.warn("[Products] isProductSlugTaken check failed in D1:", err);
    }
  }

  return memoryProducts.some((p) => p.slug === normalized && p.id !== excludeId);
}

/**
 * Create a new product with main image and gallery images
 */
export async function createProduct(input: ProductInput): Promise<ProductWithImagesAndCategory> {
  const db = getDb();
  const productId = crypto.randomUUID();
  const now = new Date().toISOString();
  const tagsArray = normalizeTags(input.tags);

  const productData: ProductRecord = {
    id: productId,
    name: input.name,
    slug: input.slug.toLowerCase(),
    description: input.description || null,
    shortDescription: input.shortDescription || null,
    sku: input.sku.toUpperCase(),
    price: Number(input.price),
    salePrice: input.salePrice ? Number(input.salePrice) : null,
    costPrice: input.costPrice ? Number(input.costPrice) : null,
    compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : null,
    stockQuantity: Number(input.stockQuantity) || 0,
    stockStatus: input.stockStatus || "in_stock",
    lowStockThreshold: Number(input.lowStockThreshold) || 5,
    trackInventory: Boolean(input.trackInventory),
    allowBackorders: Boolean(input.allowBackorders),
    categoryId: input.categoryId || null,
    brand: input.brand || null,
    tags: tagsArray,
    status: input.status || "published",
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    createdAt: now,
    updatedAt: now,
  };

  // Construct images list: mainImage first (isMain: true, sortOrder: 0), followed by galleryImages
  const imagesList: ProductImageRecord[] = [
    {
      id: crypto.randomUUID(),
      productId,
      imageUrl: input.mainImage,
      altText: `${input.name} Main View`,
      sortOrder: 0,
      isMain: true,
    },
  ];

  if (input.galleryImages && Array.isArray(input.galleryImages)) {
    input.galleryImages.forEach((url, idx) => {
      if (url && url !== input.mainImage) {
        imagesList.push({
          id: crypto.randomUUID(),
          productId,
          imageUrl: url,
          altText: `${input.name} Gallery View ${idx + 1}`,
          sortOrder: idx + 1,
          isMain: false,
        });
      }
    });
  }

  if (db) {
    // Insert product
    await db.insert(products).values({
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      shortDescription: productData.shortDescription,
      sku: productData.sku,
      price: productData.price,
      salePrice: productData.salePrice,
      costPrice: productData.costPrice,
      compareAtPrice: productData.compareAtPrice,
      stockQuantity: productData.stockQuantity,
      stockStatus: productData.stockStatus,
      lowStockThreshold: productData.lowStockThreshold,
      trackInventory: productData.trackInventory,
      allowBackorders: productData.allowBackorders,
      categoryId: productData.categoryId,
      brand: productData.brand,
      tags: productData.tags,
      status: productData.status,
      seoTitle: productData.seoTitle,
      seoDescription: productData.seoDescription,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt,
    });

    // Insert associated images
    for (const img of imagesList) {
      await db.insert(productImages).values({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isMain: img.isMain,
      });
    }
  }

  // Update memory store
  memoryProducts.push(productData);
  memoryProductImages.push(...imagesList);

  return formatProduct(productData, imagesList, null);
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<ProductWithImagesAndCategory | null> {
  const existing = await getProductById(id);
  if (!existing) return null;

  const db = getDb();
  const now = new Date().toISOString();
  const tagsArray = input.tags !== undefined ? normalizeTags(input.tags) : existing.tags;

  const updatedProduct: ProductRecord = {
    ...existing,
    name: input.name !== undefined ? input.name : existing.name,
    slug: input.slug !== undefined ? input.slug.toLowerCase() : existing.slug,
    description: input.description !== undefined ? (input.description || null) : existing.description,
    shortDescription: input.shortDescription !== undefined ? (input.shortDescription || null) : existing.shortDescription,
    sku: input.sku !== undefined ? input.sku.toUpperCase() : existing.sku,
    price: input.price !== undefined ? Number(input.price) : existing.price,
    salePrice: input.salePrice !== undefined ? (input.salePrice ? Number(input.salePrice) : null) : existing.salePrice,
    costPrice: input.costPrice !== undefined ? (input.costPrice ? Number(input.costPrice) : null) : existing.costPrice,
    compareAtPrice: input.compareAtPrice !== undefined ? (input.compareAtPrice ? Number(input.compareAtPrice) : null) : existing.compareAtPrice,
    stockQuantity: input.stockQuantity !== undefined ? Number(input.stockQuantity) : existing.stockQuantity,
    stockStatus: input.stockStatus !== undefined ? input.stockStatus : existing.stockStatus,
    lowStockThreshold: input.lowStockThreshold !== undefined ? Number(input.lowStockThreshold) : existing.lowStockThreshold,
    trackInventory: input.trackInventory !== undefined ? Boolean(input.trackInventory) : existing.trackInventory,
    allowBackorders: input.allowBackorders !== undefined ? Boolean(input.allowBackorders) : existing.allowBackorders,
    categoryId: input.categoryId !== undefined ? (input.categoryId || null) : existing.categoryId,
    brand: input.brand !== undefined ? (input.brand || null) : existing.brand,
    tags: tagsArray,
    status: input.status !== undefined ? input.status : existing.status,
    seoTitle: input.seoTitle !== undefined ? (input.seoTitle || null) : existing.seoTitle,
    seoDescription: input.seoDescription !== undefined ? (input.seoDescription || null) : existing.seoDescription,
    updatedAt: now,
  };

  if (db) {
    await db
      .update(products)
      .set({
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        description: updatedProduct.description,
        shortDescription: updatedProduct.shortDescription,
        sku: updatedProduct.sku,
        price: updatedProduct.price,
        salePrice: updatedProduct.salePrice,
        costPrice: updatedProduct.costPrice,
        compareAtPrice: updatedProduct.compareAtPrice,
        stockQuantity: updatedProduct.stockQuantity,
        stockStatus: updatedProduct.stockStatus,
        lowStockThreshold: updatedProduct.lowStockThreshold,
        trackInventory: updatedProduct.trackInventory,
        allowBackorders: updatedProduct.allowBackorders,
        categoryId: updatedProduct.categoryId,
        brand: updatedProduct.brand,
        tags: updatedProduct.tags,
        status: updatedProduct.status,
        seoTitle: updatedProduct.seoTitle,
        seoDescription: updatedProduct.seoDescription,
        updatedAt: updatedProduct.updatedAt,
      })
      .where(eq(products.id, id));
  }

  // Update images if provided
  let currentImages = existing.images;
  if (input.mainImage !== undefined || input.galleryImages !== undefined) {
    const mainImg = input.mainImage || existing.mainImage || "";
    const galleryImgs = input.galleryImages !== undefined ? input.galleryImages : existing.images.filter((img) => !img.isMain).map((i) => i.imageUrl);

    const newImages: ProductImageRecord[] = [
      {
        id: crypto.randomUUID(),
        productId: id,
        imageUrl: mainImg,
        altText: `${updatedProduct.name} Main View`,
        sortOrder: 0,
        isMain: true,
      },
    ];

    galleryImgs.forEach((url, idx) => {
      if (url && url !== mainImg) {
        newImages.push({
          id: crypto.randomUUID(),
          productId: id,
          imageUrl: url,
          altText: `${updatedProduct.name} Gallery View ${idx + 1}`,
          sortOrder: idx + 1,
          isMain: false,
        });
      }
    });

    if (db) {
      await db.delete(productImages).where(eq(productImages.productId, id));
      for (const img of newImages) {
        await db.insert(productImages).values({
          id: img.id,
          productId: img.productId,
          imageUrl: img.imageUrl,
          altText: img.altText,
          sortOrder: img.sortOrder,
          isMain: img.isMain,
        });
      }
    }

    currentImages = newImages;

    // Memory store update for images
    for (let i = memoryProductImages.length - 1; i >= 0; i--) {
      if (memoryProductImages[i].productId === id) {
        memoryProductImages.splice(i, 1);
      }
    }
    memoryProductImages.push(...newImages);
  }

  const memIdx = memoryProducts.findIndex((p) => p.id === id);
  if (memIdx >= 0) {
    memoryProducts[memIdx] = updatedProduct;
  } else {
    memoryProducts.push(updatedProduct);
  }

  return formatProduct(updatedProduct, currentImages, null);
}

/**
 * Delete a product (cascades to product_images)
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const db = getDb();

  if (db) {
    try {
      // Delete associated variants and images
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      await db.delete(productImages).where(eq(productImages.productId, id));
      // Then delete product
      await db.delete(products).where(eq(products.id, id));
    } catch (err) {
      console.error("[Products] Delete product failed in D1:", err);
      return false;
    }
  }

  // Clean memory
  for (let i = memoryProductImages.length - 1; i >= 0; i--) {
    if (memoryProductImages[i].productId === id) {
      memoryProductImages.splice(i, 1);
    }
  }
  const idx = memoryProducts.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memoryProducts.splice(idx, 1);
  }

  return true;
}

/**
 * Duplicate a product: creates a copy with `(Copy)` appended to name,
 * a newly generated unique SKU (`${sku}-COPY-${timestamp}`), a unique slug, and clones images.
 */
export async function duplicateProduct(id: string): Promise<ProductWithImagesAndCategory | null> {
  const source = await getProductById(id);
  if (!source) return null;

  const timestamp = Date.now().toString().slice(-4);
  const newName = `${source.name} (Copy)`;
  let newSlug = `${source.slug}-copy`;
  if (await isProductSlugTaken(newSlug)) {
    newSlug = `${source.slug}-copy-${timestamp}`;
  }

  let newSku = `${source.sku}-COPY`;
  if (await isSkuTaken(newSku)) {
    newSku = `${source.sku}-COPY-${timestamp}`;
  }

  const input: ProductInput = {
    name: newName,
    slug: newSlug,
    sku: newSku,
    description: source.description || "",
    shortDescription: source.shortDescription || "",
    price: source.price,
    salePrice: source.salePrice || undefined,
    costPrice: source.costPrice || undefined,
    compareAtPrice: source.compareAtPrice || undefined,
    stockQuantity: source.stockQuantity,
    stockStatus: source.stockStatus,
    lowStockThreshold: source.lowStockThreshold,
    trackInventory: source.trackInventory,
    allowBackorders: source.allowBackorders,
    categoryId: source.categoryId || undefined,
    brand: source.brand || undefined,
    tags: source.tags || [],
    status: "draft", // default duplicated items to draft for safety
    mainImage: source.mainImage || "https://assets.example.com/placeholder.webp",
    galleryImages: source.images.filter((img) => !img.isMain).map((i) => i.imageUrl),
    seoTitle: source.seoTitle || undefined,
    seoDescription: source.seoDescription || undefined,
  };

  const duplicated = await createProduct(input);
  if (duplicated && source.variants && source.variants.length > 0) {
    const clonedVariants = source.variants.map((v) => ({
      sku: `${v.sku}-COPY-${timestamp}`,
      price: v.price,
      salePrice: v.salePrice || undefined,
      stock: v.stock,
      imageUrl: v.imageUrl || undefined,
      options: v.options,
      weight: v.weight || undefined,
      dimensions: v.dimensions,
      isDefault: v.isDefault,
    }));
    await saveProductVariants(duplicated.id, clonedVariants, duplicated.price);
    return getProductById(duplicated.id);
  }

  return duplicated;
}

/**
 * Search products across name, SKU, brand, tags, and category name
 */
export async function searchProducts(
  rawQuery: string,
  options?: { limit?: number; publishedOnly?: boolean }
): Promise<ProductWithImagesAndCategory[]> {
  const q = rawQuery.trim();
  if (!q) return [];

  const limit = options?.limit || 20;
  const db = getDb();

  if (db) {
    try {
      const searchPattern = `%${q}%`;
      const query = db
        .select({
          product: products,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(
            options?.publishedOnly ? eq(products.status, "published") : sql`1=1`,
            or(
              like(products.name, searchPattern),
              like(products.sku, searchPattern),
              like(products.brand, searchPattern),
              like(products.description, searchPattern),
              like(categories.name, searchPattern)
            )
          )
        )
        .limit(limit);

      const rows = await query;
      if (rows.length === 0) return [];

      const productIds = rows.map((r) => r.product.id);
      const imagesRows = await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(asc(productImages.sortOrder));

      const imageMap = new Map<string, ProductImageRecord[]>();
      for (const img of imagesRows) {
        if (!imageMap.has(img.productId)) {
          imageMap.set(img.productId, []);
        }
        imageMap.get(img.productId)!.push(img as ProductImageRecord);
      }

      // Fetch variants for all search matched products in batch
      const variantsRows = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds))
        .orderBy(desc(productVariants.isDefault), asc(productVariants.sku));

      const variantMap = new Map<string, ProductVariantRecord[]>();
      for (const v of variantsRows) {
        if (!variantMap.has(v.productId)) {
          variantMap.set(v.productId, []);
        }
        let opts: Record<string, string> = {};
        if (v.options) {
          try {
            opts = typeof v.options === "string" ? JSON.parse(v.options) : v.options;
          } catch {
            opts = {};
          }
        }
        let dims = null;
        if (v.dimensions) {
          try {
            dims = typeof v.dimensions === "string" ? JSON.parse(v.dimensions) : v.dimensions;
          } catch {
            dims = null;
          }
        }
        variantMap.get(v.productId)!.push({
          id: v.id,
          productId: v.productId,
          sku: v.sku || "",
          price: Number(v.price),
          salePrice: v.salePrice !== null && v.salePrice !== undefined ? Number(v.salePrice) : null,
          stock: Number(v.stock) || 0,
          imageUrl: v.imageUrl || null,
          options: opts,
          weight: v.weight ? Number(v.weight) : null,
          dimensions: dims,
          isDefault: Boolean(v.isDefault),
        });
      }

      return rows.map((row) =>
        formatProduct(
          row.product as ProductRecord,
          imageMap.get(row.product.id) || [],
          row.categoryName ? { name: row.categoryName, slug: row.categorySlug || "" } : null,
          variantMap.get(row.product.id) || []
        )
      );
    } catch (err) {
      console.warn("[Products] searchProducts D1 failed, using memory:", err);
    }
  }

  // Memory search fallback
  const lower = q.toLowerCase();
  const matched = memoryProducts
    .filter((p) => {
      if (options?.publishedOnly && p.status !== "published") return false;
      return (
        p.name.toLowerCase().includes(lower) ||
        p.sku.toLowerCase().includes(lower) ||
        (p.brand && p.brand.toLowerCase().includes(lower)) ||
        (p.description && p.description.toLowerCase().includes(lower)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(lower)))
      );
    })
    .slice(0, limit);

  return matched.map((p) => {
    const imgs = memoryProductImages.filter((img) => img.productId === p.id);
    return formatProduct(p, imgs, null);
  });
}

/**
 * Get featured products for homepage (published, ordered by createdAt DESC)
 */
export async function getFeaturedProducts(limit = 4): Promise<ProductWithImagesAndCategory[]> {
  return listProducts({ status: "published", limit });
}

/**
 * Get published products belonging to a specific category
 */
export async function getProductsByCategory(
  categoryId: string,
  limit = 24
): Promise<ProductWithImagesAndCategory[]> {
  return listProducts({ categoryId, status: "published", limit });
}

/**
 * Get related products for product details page (same category, excluding current product)
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<ProductWithImagesAndCategory[]> {
  if (!categoryId) {
    const all = await getFeaturedProducts(limit + 1);
    return all.filter((p) => p.id !== productId).slice(0, limit);
  }

  const catProducts = await getProductsByCategory(categoryId, limit + 1);
  return catProducts.filter((p) => p.id !== productId).slice(0, limit);
}

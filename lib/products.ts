import { cache } from "react";
import { z } from "zod";
import { eq, desc, asc, and, inArray } from "drizzle-orm";
import { getDb, products, productImages, productVariants, categories } from "./db";
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

export interface CatalogProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  brand: string | null;
  stockStatus: "in_stock" | "out_of_stock" | "backorder" | "preorder";
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  lowStockThreshold: number;
  mainImage: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  shortDescription?: string | null;
  images?: ProductImageRecord[];
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

export const memoryProducts: ProductRecord[] = [];
export const memoryProductImages: ProductImageRecord[] = [];

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
      const conditions = [];
      if (options?.categoryId) {
        conditions.push(eq(products.categoryId, options.categoryId));
      }
      if (options?.status) {
        conditions.push(eq(products.status, options.status));
      }

      const query = db
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
 * Wrapped with React.cache() to deduplicate queries within a single request.
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductWithImagesAndCategory | null> => {
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
        .select({
          id: productImages.id,
          productId: productImages.productId,
          imageUrl: productImages.imageUrl,
          altText: productImages.altText,
          sortOrder: productImages.sortOrder,
          isMain: productImages.isMain,
        })
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
});

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
    trackInventory: input.trackInventory !== undefined ? Boolean(input.trackInventory) : true,
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

export interface AdvancedSearchParams {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string; // slug or ID
  brand?: string;
  tags?: string[];
  inStock?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "popular" | string;
  limit?: number;
  offset?: number;
  publishedOnly?: boolean;
}

export interface SearchFacets {
  brands: Array<{ name: string; count: number }>;
  categories: Array<{ id: string; name: string; slug: string; count: number }>;
  tags: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
}

export interface AdvancedSearchResult {
  products: ProductWithImagesAndCategory[];
  total: number;
  facets: SearchFacets;
}

/**
 * Advanced Search with multi-facet filters, sorting, and dynamic facet counts
 */
export async function searchProductsAdvanced(
  params: AdvancedSearchParams
): Promise<AdvancedSearchResult> {
  const publishedOnly = params.publishedOnly !== false;
  const allProducts = await listProducts({
    status: publishedOnly ? "published" : undefined,
  });

  // 1. Calculate global facets across all published products
  const brandCountMap = new Map<string, number>();
  const categoryMap = new Map<string, { id: string; name: string; slug: string; count: number }>();
  const tagCountMap = new Map<string, number>();
  let globalMinPrice = Infinity;
  let globalMaxPrice = 0;

  for (const p of allProducts) {
    const effPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
    if (effPrice < globalMinPrice) globalMinPrice = effPrice;
    if (effPrice > globalMaxPrice) globalMaxPrice = effPrice;

    if (p.brand) {
      brandCountMap.set(p.brand, (brandCountMap.get(p.brand) || 0) + 1);
    }

    if (p.categoryId && p.categoryName && p.categorySlug) {
      const existing = categoryMap.get(p.categoryId) || {
        id: p.categoryId,
        name: p.categoryName,
        slug: p.categorySlug,
        count: 0,
      };
      existing.count += 1;
      categoryMap.set(p.categoryId, existing);
    }

    if (Array.isArray(p.tags)) {
      for (const t of p.tags) {
        if (t) tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
      }
    }
  }

  const facets: SearchFacets = {
    brands: Array.from(brandCountMap.entries()).map(([name, count]) => ({ name, count })),
    categories: Array.from(categoryMap.values()),
    tags: Array.from(tagCountMap.entries()).map(([name, count]) => ({ name, count })),
    priceRange: {
      min: globalMinPrice === Infinity ? 0 : Math.floor(globalMinPrice),
      max: globalMaxPrice === 0 ? 1000 : Math.ceil(globalMaxPrice),
    },
  };

  // 2. Filter products based on search parameters
  let filtered = allProducts;

  // Text search filter
  if (params.query && params.query.trim()) {
    const q = params.query.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBrand = Boolean(p.brand && p.brand.toLowerCase().includes(q));
      const matchDesc = Boolean(p.description && p.description.toLowerCase().includes(q));
      const matchShortDesc = Boolean(p.shortDescription && p.shortDescription.toLowerCase().includes(q));
      const matchCat = Boolean(p.categoryName && p.categoryName.toLowerCase().includes(q));
      const matchTags = Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q));
      return matchName || matchSku || matchBrand || matchDesc || matchShortDesc || matchCat || matchTags;
    });
  }

  // Category filter (slug or id)
  if (params.category && params.category.trim()) {
    const cat = params.category.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.categorySlug && p.categorySlug.toLowerCase() === cat) ||
        (p.categoryId && p.categoryId.toLowerCase() === cat)
    );
  }

  // Brand filter
  if (params.brand && params.brand.trim()) {
    const b = params.brand.trim().toLowerCase();
    filtered = filtered.filter((p) => p.brand && p.brand.toLowerCase() === b);
  }

  // Price range filters
  if (typeof params.minPrice === "number" && !isNaN(params.minPrice)) {
    filtered = filtered.filter((p) => {
      const effPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
      return effPrice >= params.minPrice!;
    });
  }
  if (typeof params.maxPrice === "number" && !isNaN(params.maxPrice)) {
    filtered = filtered.filter((p) => {
      const effPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
      return effPrice <= params.maxPrice!;
    });
  }

  // Tags filter
  if (params.tags && params.tags.length > 0) {
    const filterTags = params.tags.map((t) => t.toLowerCase().trim());
    filtered = filtered.filter(
      (p) => Array.isArray(p.tags) && p.tags.some((pt) => filterTags.includes(pt.toLowerCase().trim()))
    );
  }

  // In-stock availability filter
  if (params.inStock) {
    filtered = filtered.filter((p) => {
      if (p.stockStatus === "out_of_stock") return false;
      if (p.trackInventory && p.stockQuantity <= 0 && !p.allowBackorders) return false;
      return true;
    });
  }

  // 3. Sorting
  const sort = params.sort || "newest";
  filtered = [...filtered].sort((a, b) => {
    const priceA = a.salePrice && a.salePrice < a.price ? a.salePrice : a.price;
    const priceB = b.salePrice && b.salePrice < b.price ? b.salePrice : b.price;

    switch (sort) {
      case "price_asc":
        return priceA - priceB;
      case "price_desc":
        return priceB - priceA;
      case "popular":
        // Products with more variants or higher stock priority
        return (b.stockQuantity || 0) - (a.stockQuantity || 0);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const total = filtered.length;
  const offset = params.offset || 0;
  const limit = params.limit || 40;
  const paged = filtered.slice(offset, offset + limit);

  return {
    products: paged,
    total,
    facets,
  };
}

/**
 * Basic Search products across name, SKU, brand, tags, and category name (backward compatible)
 */
export async function searchProducts(
  rawQuery: string,
  options?: { limit?: number; publishedOnly?: boolean }
): Promise<ProductWithImagesAndCategory[]> {
  const res = await searchProductsAdvanced({
    query: rawQuery,
    limit: options?.limit || 20,
    publishedOnly: options?.publishedOnly !== false,
  });
  return res.products;
}

/**
 * Lightweight query for product grids, homepage carousels, and catalog listings.
 * Fetches ONLY: id, name, slug, price, salePrice, brand, stockStatus, stockQuantity,
 * trackInventory, allowBackorders, lowStockThreshold, and mainImage.
 * Does NOT fetch secondary gallery images or variant matrices.
 */
export async function listCatalogProducts(options?: {
  categoryId?: string;
  status?: "draft" | "published" | "archived";
  limit?: number;
}): Promise<CatalogProductItem[]> {
  const db = getDb();

  if (db) {
    try {
      const conditions = [];
      if (options?.categoryId) {
        conditions.push(eq(products.categoryId, options.categoryId));
      }
      if (options?.status) {
        conditions.push(eq(products.status, options.status));
      }

      const query = db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          salePrice: products.salePrice,
          brand: products.brand,
          stockStatus: products.stockStatus,
          stockQuantity: products.stockQuantity,
          trackInventory: products.trackInventory,
          allowBackorders: products.allowBackorders,
          lowStockThreshold: products.lowStockThreshold,
          shortDescription: products.shortDescription,
          categoryId: products.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id));

      const rows = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(products.createdAt)).limit(options?.limit || 100)
        : await query.orderBy(desc(products.createdAt)).limit(options?.limit || 100);

      if (rows.length === 0) return [];

      const productIds = rows.map((r) => r.id);

      // Fetch ONLY main images (or first sortOrder image) for each product
      const mainImages = await db
        .select({
          productId: productImages.productId,
          imageUrl: productImages.imageUrl,
          isMain: productImages.isMain,
        })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(asc(productImages.sortOrder));

      const mainImageMap = new Map<string, string>();
      for (const img of mainImages) {
        if (!mainImageMap.has(img.productId) || img.isMain) {
          mainImageMap.set(img.productId, img.imageUrl);
        }
      }

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: Number(r.price),
        salePrice: r.salePrice !== null && r.salePrice !== undefined ? Number(r.salePrice) : null,
        brand: r.brand || null,
        stockStatus: r.stockStatus,
        stockQuantity: Number(r.stockQuantity) || 0,
        trackInventory: Boolean(r.trackInventory),
        allowBackorders: Boolean(r.allowBackorders),
        lowStockThreshold: Number(r.lowStockThreshold) || 5,
        mainImage: mainImageMap.get(r.id) || null,
        categoryName: r.categoryName || null,
        categorySlug: r.categorySlug || null,
        shortDescription: r.shortDescription || null,
        images: mainImageMap.has(r.id)
          ? [{ id: `img-${r.id}`, productId: r.id, imageUrl: mainImageMap.get(r.id)!, altText: r.name, sortOrder: 0, isMain: true }]
          : [],
        variants: [],
      }));
    } catch (err) {
      console.warn("[Products] D1 listCatalogProducts failed, falling back:", err);
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
    const mainImg =
      memoryProductImages.find((img) => img.productId === p.id && img.isMain) ||
      memoryProductImages.find((img) => img.productId === p.id);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      salePrice: p.salePrice !== null && p.salePrice !== undefined ? Number(p.salePrice) : null,
      brand: p.brand || null,
      stockStatus: p.stockStatus,
      stockQuantity: p.stockQuantity,
      trackInventory: p.trackInventory,
      allowBackorders: p.allowBackorders,
      lowStockThreshold: p.lowStockThreshold,
      mainImage: mainImg?.imageUrl || null,
      categoryName: null,
      categorySlug: null,
      shortDescription: p.shortDescription || null,
      images: mainImg ? [mainImg] : [],
      variants: [],
    };
  });
}

/**
 * Get featured products for homepage (published, ordered by createdAt DESC)
 * Wrapped with React.cache() to deduplicate queries within a single request.
 */
export const getFeaturedProducts = cache(async (limit = 4): Promise<ProductWithImagesAndCategory[]> => {
  return (await listCatalogProducts({ status: "published", limit })) as unknown as ProductWithImagesAndCategory[];
});

/**
 * Get published products belonging to a specific category
 */
export async function getProductsByCategory(
  categoryId: string,
  limit = 24
): Promise<ProductWithImagesAndCategory[]> {
  return (await listCatalogProducts({ categoryId, status: "published", limit })) as unknown as ProductWithImagesAndCategory[];
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

import { eq, desc, asc, and, sql, inArray, like, or } from "drizzle-orm";
import { getDb, productBundles, bundleItems, products, productImages, ProductBundleRecord, BundleItemRecord } from "./db";
import { normalizeImageUrl } from "./utils";
import { getProductById, memoryProducts } from "./products";

export interface BundleItemDetail {
  id: string;
  bundleId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  sortOrder: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    mainImage: string | null;
    stockStatus: string;
    stockQuantity: number;
    brand: string | null;
  };
}

export interface BundleWithItems extends ProductBundleRecord {
  items: BundleItemDetail[];
  savingsAmount: number;
}

export interface ListBundlesOptions {
  status?: "active" | "draft" | "all";
  search?: string;
  isFeatured?: boolean;
  sortBy?: "name" | "price" | "discount" | "createdAt" | "sortOrder";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface CreateBundleInput {
  name: string;
  slug?: string;
  description?: string | null;
  bundlePrice: number;
  imageUrl?: string | null;
  status?: "active" | "draft";
  isFeatured?: boolean;
  sortOrder?: number;
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity?: number;
    sortOrder?: number;
  }>;
}

export interface UpdateBundleInput extends Partial<CreateBundleInput> {}

// In-memory fallback for local dev / testing without live D1
export const memoryBundles: BundleWithItems[] = [
  {
    id: "bundle-endurance-trio",
    tenantId: "default",
    name: "Endurance Performance Trio",
    slug: "endurance-performance-trio",
    description: "Complete elite training kit featuring the Apex Velocity Runner X1, breathable Aero-Knit compression tee, and ultralight Vapor-Shield windbreaker. Engineered for maximum speed and endurance.",
    bundlePrice: 268.0,
    originalPrice: 358.0,
    discountPercentage: 25.14,
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
    status: "active",
    isFeatured: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    savingsAmount: 90.0,
    items: [
      {
        id: "bitem-endurance-1",
        bundleId: "bundle-endurance-trio",
        productId: "prod-apex-vrx1",
        variantId: null,
        quantity: 1,
        sortOrder: 1,
        product: {
          id: "prod-apex-vrx1",
          name: "Apex Velocity Runner X1",
          slug: "apex-velocity-runner-x1",
          price: 160.0,
          salePrice: 140.0,
          mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
          stockStatus: "in_stock",
          stockQuantity: 45,
          brand: "Apex Athletics",
        },
      },
      {
        id: "bitem-endurance-2",
        bundleId: "bundle-endurance-trio",
        productId: "prod-aero-knit-tee",
        variantId: null,
        quantity: 1,
        sortOrder: 2,
        product: {
          id: "prod-aero-knit-tee",
          name: "Aero-Knit Seamless Compression Tee",
          slug: "aero-knit-seamless-tee",
          price: 58.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
          stockStatus: "in_stock",
          stockQuantity: 80,
          brand: "Apex Athletics",
        },
      },
      {
        id: "bitem-endurance-3",
        bundleId: "bundle-endurance-trio",
        productId: "prod-vapor-jacket",
        variantId: null,
        quantity: 1,
        sortOrder: 3,
        product: {
          id: "prod-vapor-jacket",
          name: "Vapor-Shield Windbreaker",
          slug: "vapor-shield-windbreaker",
          price: 140.0,
          salePrice: 120.0,
          mainImage: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop",
          stockStatus: "in_stock",
          stockQuantity: 30,
          brand: "Apex Athletics",
        },
      },
    ],
  },
  {
    id: "bundle-elite-marathon-duo",
    tenantId: "default",
    name: "Elite Marathon Duo",
    slug: "elite-marathon-duo",
    description: "The ultimate dual footwear rotation for long distance runners. Pair the Apex Velocity Runner with the Pulse Enduro Carbon Pro for race day and tempo training.",
    bundlePrice: 275.0,
    originalPrice: 345.0,
    discountPercentage: 20.29,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    status: "active",
    isFeatured: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    savingsAmount: 70.0,
    items: [
      {
        id: "bitem-marathon-1",
        bundleId: "bundle-elite-marathon-duo",
        productId: "prod-apex-vrx1",
        variantId: null,
        quantity: 1,
        sortOrder: 1,
        product: {
          id: "prod-apex-vrx1",
          name: "Apex Velocity Runner X1",
          slug: "apex-velocity-runner-x1",
          price: 160.0,
          salePrice: 140.0,
          mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
          stockStatus: "in_stock",
          stockQuantity: 45,
          brand: "Apex Athletics",
        },
      },
      {
        id: "bitem-marathon-2",
        bundleId: "bundle-elite-marathon-duo",
        productId: "prod-pulse-enduro",
        variantId: null,
        quantity: 1,
        sortOrder: 2,
        product: {
          id: "prod-pulse-enduro",
          name: "Pulse Enduro Carbon Pro",
          slug: "pulse-enduro-carbon-pro",
          price: 185.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000&auto=format&fit=crop",
          stockStatus: "in_stock",
          stockQuantity: 25,
          brand: "Apex Athletics",
        },
      },
    ],
  },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_PRODUCT_CATALOG: Record<string, any> = {
  "prod-apex-vrx1": {
    id: "prod-apex-vrx1",
    name: "Apex Velocity Runner X1",
    slug: "apex-velocity-runner-x1",
    price: 160.0,
    salePrice: 140.0,
    mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    stockStatus: "in_stock",
    stockQuantity: 45,
    brand: "Apex Athletics",
  },
  "prod-pulse-enduro": {
    id: "prod-pulse-enduro",
    name: "Pulse Enduro Carbon Pro",
    slug: "pulse-enduro-carbon-pro",
    price: 185.0,
    salePrice: null,
    mainImage: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000&auto=format&fit=crop",
    stockStatus: "in_stock",
    stockQuantity: 25,
    brand: "Apex Athletics",
  },
  "prod-aero-knit-tee": {
    id: "prod-aero-knit-tee",
    name: "Aero-Knit Seamless Compression Tee",
    slug: "aero-knit-seamless-tee",
    price: 58.0,
    salePrice: null,
    mainImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
    stockStatus: "in_stock",
    stockQuantity: 80,
    brand: "Apex Athletics",
  },
  "prod-vapor-jacket": {
    id: "prod-vapor-jacket",
    name: "Vapor-Shield Windbreaker",
    slug: "vapor-shield-windbreaker",
    price: 140.0,
    salePrice: 120.0,
    mainImage: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop",
    stockStatus: "in_stock",
    stockQuantity: 30,
    brand: "Apex Athletics",
  },
};

export async function resolveProductDetails(productId: string, db?: any): Promise<any> {
  if (db) {
    const pRows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        salePrice: products.salePrice,
        stockStatus: products.stockStatus,
        stockQuantity: products.stockQuantity,
        brand: products.brand,
        imageUrl: productImages.imageUrl,
      })
      .from(products)
      .leftJoin(
        productImages,
        and(eq(products.id, productImages.productId), eq(productImages.isMain, true))
      )
      .where(eq(products.id, productId))
      .limit(1);

    if (pRows.length > 0) {
      const p = pRows[0];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        mainImage: p.imageUrl ? normalizeImageUrl(p.imageUrl) : null,
        stockStatus: p.stockStatus,
        stockQuantity: Number(p.stockQuantity || 0),
        brand: p.brand,
      };
    }
  }

  const mem = memoryProducts.find((p) => p.id === productId);
  if (mem) {
    return {
      id: mem.id,
      name: mem.name,
      slug: mem.slug,
      price: Number(mem.price),
      salePrice: mem.salePrice ? Number(mem.salePrice) : null,
      mainImage: (mem as any).mainImage ? normalizeImageUrl((mem as any).mainImage) : null,
      stockStatus: mem.stockStatus,
      stockQuantity: mem.stockQuantity,
      brand: mem.brand || null,
    };
  }

  for (const b of memoryBundles) {
    const found = b.items.find((it) => it.productId === productId);
    if (found?.product) return found.product;
  }

  if (DEFAULT_PRODUCT_CATALOG[productId]) {
    return DEFAULT_PRODUCT_CATALOG[productId];
  }

  return null;
}

/**
 * List bundles with optional filters, search, and sorting
 */
export async function listBundles(options: ListBundlesOptions = {}): Promise<BundleWithItems[]> {
  const {
    status = "all",
    search,
    isFeatured,
    sortBy = "sortOrder",
    sortOrder = "asc",
    limit = 50,
    offset = 0,
  } = options;

  const db = getDb();

  if (db) {
    try {
      // Build conditions
      const conditions = [];
      if (status && status !== "all") {
        conditions.push(eq(productBundles.status, status));
      }
      if (isFeatured !== undefined) {
        conditions.push(eq(productBundles.isFeatured, isFeatured));
      }
      if (search) {
        conditions.push(
          or(
            like(productBundles.name, `%${search}%`),
            like(productBundles.description, `%${search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Determine sorting
      let orderExpr;
      const isAsc = sortOrder === "asc";
      switch (sortBy) {
        case "name":
          orderExpr = isAsc ? asc(productBundles.name) : desc(productBundles.name);
          break;
        case "price":
          orderExpr = isAsc ? asc(productBundles.bundlePrice) : desc(productBundles.bundlePrice);
          break;
        case "discount":
          orderExpr = isAsc ? asc(productBundles.discountPercentage) : desc(productBundles.discountPercentage);
          break;
        case "createdAt":
          orderExpr = isAsc ? asc(productBundles.createdAt) : desc(productBundles.createdAt);
          break;
        case "sortOrder":
        default:
          orderExpr = isAsc ? asc(productBundles.sortOrder) : desc(productBundles.sortOrder);
          break;
      }

      const bundleRows = await db
        .select()
        .from(productBundles)
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset);

      if (bundleRows.length === 0) {
        return [];
      }

      const bundleIds = bundleRows.map((b) => b.id);

      // Fetch items for these bundles
      const itemRows = await db
        .select({
          id: bundleItems.id,
          bundleId: bundleItems.bundleId,
          productId: bundleItems.productId,
          variantId: bundleItems.variantId,
          quantity: bundleItems.quantity,
          sortOrder: bundleItems.sortOrder,
          productName: products.name,
          productSlug: products.slug,
          productPrice: products.price,
          productSalePrice: products.salePrice,
          productStockStatus: products.stockStatus,
          productStockQuantity: products.stockQuantity,
          productBrand: products.brand,
          imageUrl: productImages.imageUrl,
        })
        .from(bundleItems)
        .innerJoin(products, eq(bundleItems.productId, products.id))
        .leftJoin(
          productImages,
          and(eq(products.id, productImages.productId), eq(productImages.isMain, true))
        )
        .where(inArray(bundleItems.bundleId, bundleIds))
        .orderBy(asc(bundleItems.sortOrder));

      // Group items by bundleId
      const itemsByBundle: Record<string, BundleItemDetail[]> = {};
      itemRows.forEach((r) => {
        if (!itemsByBundle[r.bundleId]) {
          itemsByBundle[r.bundleId] = [];
        }
        itemsByBundle[r.bundleId].push({
          id: r.id,
          bundleId: r.bundleId,
          productId: r.productId,
          variantId: r.variantId,
          quantity: r.quantity ?? 1,
          sortOrder: r.sortOrder ?? 0,
          product: {
            id: r.productId,
            name: r.productName,
            slug: r.productSlug,
            price: Number(r.productPrice),
            salePrice: r.productSalePrice ? Number(r.productSalePrice) : null,
            mainImage: r.imageUrl ? normalizeImageUrl(r.imageUrl) : null,
            stockStatus: r.productStockStatus,
            stockQuantity: Number(r.productStockQuantity || 0),
            brand: r.productBrand,
          },
        });
      });

      return bundleRows.map((b) => {
        const items = itemsByBundle[b.id] || [];
        const savingsAmount = Math.max(0, Number((b.originalPrice - b.bundlePrice).toFixed(2)));
        // Auto-assign image from first product if bundle has no image
        const imageUrl = b.imageUrl || items[0]?.product?.mainImage || null;
        return {
          ...b,
          imageUrl,
          items,
          savingsAmount,
        };
      });
    } catch (err) {
      console.warn("D1 query failed in listBundles, falling back to memory:", err);
    }
  }

  // In-memory fallback
  let filtered = [...memoryBundles];
  if (status && status !== "all") {
    filtered = filtered.filter((b) => b.status === status);
  }
  if (isFeatured !== undefined) {
    filtered = filtered.filter((b) => Boolean(b.isFeatured) === Boolean(isFeatured));
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (b) => b.name.toLowerCase().includes(s) || (b.description && b.description.toLowerCase().includes(s))
    );
  }

  return filtered;
}

/**
 * Get bundle by slug
 */
export async function getBundleBySlug(slug: string): Promise<BundleWithItems | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(productBundles)
        .where(eq(productBundles.slug, slug))
        .limit(1);

      if (rows.length === 0) return null;
      const b = rows[0];

      const itemRows = await db
        .select({
          id: bundleItems.id,
          bundleId: bundleItems.bundleId,
          productId: bundleItems.productId,
          variantId: bundleItems.variantId,
          quantity: bundleItems.quantity,
          sortOrder: bundleItems.sortOrder,
          productName: products.name,
          productSlug: products.slug,
          productPrice: products.price,
          productSalePrice: products.salePrice,
          productStockStatus: products.stockStatus,
          productStockQuantity: products.stockQuantity,
          productBrand: products.brand,
          imageUrl: productImages.imageUrl,
        })
        .from(bundleItems)
        .innerJoin(products, eq(bundleItems.productId, products.id))
        .leftJoin(
          productImages,
          and(eq(products.id, productImages.productId), eq(productImages.isMain, true))
        )
        .where(eq(bundleItems.bundleId, b.id))
        .orderBy(asc(bundleItems.sortOrder));

      const items: BundleItemDetail[] = itemRows.map((r) => ({
        id: r.id,
        bundleId: r.bundleId,
        productId: r.productId,
        variantId: r.variantId,
        quantity: r.quantity ?? 1,
        sortOrder: r.sortOrder ?? 0,
        product: {
          id: r.productId,
          name: r.productName,
          slug: r.productSlug,
          price: Number(r.productPrice),
          salePrice: r.productSalePrice ? Number(r.productSalePrice) : null,
          mainImage: r.imageUrl ? normalizeImageUrl(r.imageUrl) : null,
          stockStatus: r.productStockStatus,
          stockQuantity: Number(r.productStockQuantity || 0),
          brand: r.productBrand,
        },
      }));

      const savingsAmount = Math.max(0, Number((b.originalPrice - b.bundlePrice).toFixed(2)));
      const imageUrl = b.imageUrl || items[0]?.product?.mainImage || null;

      return {
        ...b,
        imageUrl,
        items,
        savingsAmount,
      };
    } catch (err) {
      console.warn("D1 getBundleBySlug failed:", err);
    }
  }

  const found = memoryBundles.find((b) => b.slug === slug);
  return found || null;
}

/**
 * Get bundle by ID
 */
export async function getBundleById(id: string): Promise<BundleWithItems | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(productBundles)
        .where(eq(productBundles.id, id))
        .limit(1);

      if (rows.length === 0) return null;
      const b = rows[0];

      const itemRows = await db
        .select({
          id: bundleItems.id,
          bundleId: bundleItems.bundleId,
          productId: bundleItems.productId,
          variantId: bundleItems.variantId,
          quantity: bundleItems.quantity,
          sortOrder: bundleItems.sortOrder,
          productName: products.name,
          productSlug: products.slug,
          productPrice: products.price,
          productSalePrice: products.salePrice,
          productStockStatus: products.stockStatus,
          productStockQuantity: products.stockQuantity,
          productBrand: products.brand,
          imageUrl: productImages.imageUrl,
        })
        .from(bundleItems)
        .innerJoin(products, eq(bundleItems.productId, products.id))
        .leftJoin(
          productImages,
          and(eq(products.id, productImages.productId), eq(productImages.isMain, true))
        )
        .where(eq(bundleItems.bundleId, b.id))
        .orderBy(asc(bundleItems.sortOrder));

      const items: BundleItemDetail[] = itemRows.map((r) => ({
        id: r.id,
        bundleId: r.bundleId,
        productId: r.productId,
        variantId: r.variantId,
        quantity: r.quantity ?? 1,
        sortOrder: r.sortOrder ?? 0,
        product: {
          id: r.productId,
          name: r.productName,
          slug: r.productSlug,
          price: Number(r.productPrice),
          salePrice: r.productSalePrice ? Number(r.productSalePrice) : null,
          mainImage: r.imageUrl ? normalizeImageUrl(r.imageUrl) : null,
          stockStatus: r.productStockStatus,
          stockQuantity: Number(r.productStockQuantity || 0),
          brand: r.productBrand,
        },
      }));

      const savingsAmount = Math.max(0, Number((b.originalPrice - b.bundlePrice).toFixed(2)));
      const imageUrl = b.imageUrl || items[0]?.product?.mainImage || null;

      return {
        ...b,
        imageUrl,
        items,
        savingsAmount,
      };
    } catch (err) {
      console.warn("D1 getBundleById failed:", err);
    }
  }

  const found = memoryBundles.find((b) => b.id === id);
  return found || null;
}

/**
 * Create a new bundle
 */
export async function createBundle(input: CreateBundleInput): Promise<BundleWithItems> {
  const db = getDb();
  const id = `bundle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Generate unique slug
  let baseSlug = input.slug ? slugify(input.slug) : slugify(input.name);
  if (!baseSlug) baseSlug = `bundle-${Date.now()}`;
  let slug = baseSlug;

  // Resolve original price from items
  let originalPrice = 0;
  const itemsWithProduct: BundleItemDetail[] = [];

  for (let i = 0; i < input.items.length; i++) {
    const it = input.items[i];
    const qty = it.quantity && it.quantity > 0 ? it.quantity : 1;
    const prod = await resolveProductDetails(it.productId, db);

    const itemPrice = prod ? prod.price : 0;
    originalPrice += itemPrice * qty;

    itemsWithProduct.push({
      id: `bitem-${Date.now()}-${i}`,
      bundleId: id,
      productId: it.productId,
      variantId: it.variantId || null,
      quantity: qty,
      sortOrder: it.sortOrder !== undefined ? it.sortOrder : i + 1,
      product: prod || undefined,
    });
  }

  originalPrice = Number(originalPrice.toFixed(2));
  const bundlePrice = Number(input.bundlePrice.toFixed(2));
  const discountPercentage =
    originalPrice > 0 && bundlePrice < originalPrice
      ? Number((((originalPrice - bundlePrice) / originalPrice) * 100).toFixed(2))
      : 0;

  const imageUrl = input.imageUrl || itemsWithProduct[0]?.product?.mainImage || null;

  if (db) {
    // Ensure unique slug
    let attempt = 0;
    while (true) {
      const existing = await db
        .select({ id: productBundles.id })
        .from(productBundles)
        .where(eq(productBundles.slug, slug))
        .limit(1);

      if (existing.length === 0) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    await db.insert(productBundles).values({
      id,
      tenantId: "default",
      name: input.name,
      slug,
      description: input.description || null,
      bundlePrice,
      originalPrice,
      discountPercentage,
      imageUrl,
      status: input.status || "active",
      isFeatured: Boolean(input.isFeatured),
      sortOrder: input.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    });

    if (itemsWithProduct.length > 0) {
      await db.insert(bundleItems).values(
        itemsWithProduct.map((it) => ({
          id: it.id,
          bundleId: id,
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity,
          sortOrder: it.sortOrder,
        }))
      );
    }
  }

  const created: BundleWithItems = {
    id,
    tenantId: "default",
    name: input.name,
    slug,
    description: input.description || null,
    bundlePrice,
    originalPrice,
    discountPercentage,
    imageUrl,
    status: input.status || "active",
    isFeatured: input.isFeatured || false,
    sortOrder: input.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
    items: itemsWithProduct,
    savingsAmount: Math.max(0, Number((originalPrice - bundlePrice).toFixed(2))),
  };

  memoryBundles.unshift(created);
  return created;
}

/**
 * Update an existing bundle
 */
export async function updateBundle(id: string, input: UpdateBundleInput): Promise<BundleWithItems | null> {
  const existing = await getBundleById(id);
  if (!existing) return null;

  const db = getDb();
  const now = new Date().toISOString();

  let name = input.name !== undefined ? input.name : existing.name;
  let slug = existing.slug;
  if (input.slug && input.slug !== existing.slug) {
    slug = slugify(input.slug);
  } else if (input.name && input.name !== existing.name && !input.slug) {
    slug = slugify(input.name);
  }

  let bundlePrice = input.bundlePrice !== undefined ? Number(input.bundlePrice) : existing.bundlePrice;
  let itemsToSave = input.items ? input.items : existing.items.map((it) => ({
    productId: it.productId,
    variantId: it.variantId,
    quantity: it.quantity,
    sortOrder: it.sortOrder,
  }));

  // Recompute original price
  let originalPrice = 0;
  const itemsWithProduct: BundleItemDetail[] = [];

  for (let i = 0; i < itemsToSave.length; i++) {
    const it = itemsToSave[i];
    const qty = it.quantity && it.quantity > 0 ? it.quantity : 1;
    const prod = await resolveProductDetails(it.productId, db);

    const itemPrice = prod ? prod.price : 0;
    originalPrice += itemPrice * qty;

    itemsWithProduct.push({
      id: `bitem-${Date.now()}-${i}`,
      bundleId: id,
      productId: it.productId,
      variantId: it.variantId || null,
      quantity: qty,
      sortOrder: it.sortOrder !== undefined ? it.sortOrder : i + 1,
      product: prod || undefined,
    });
  }

  originalPrice = Number(originalPrice.toFixed(2));
  bundlePrice = Number(bundlePrice.toFixed(2));
  const discountPercentage =
    originalPrice > 0 && bundlePrice < originalPrice
      ? Number((((originalPrice - bundlePrice) / originalPrice) * 100).toFixed(2))
      : 0;

  const imageUrl = input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl || itemsWithProduct[0]?.product?.mainImage || null;
  const description = input.description !== undefined ? input.description : existing.description;
  const status = input.status !== undefined ? input.status : existing.status;
  const isFeatured = input.isFeatured !== undefined ? input.isFeatured : existing.isFeatured;
  const sortOrder = input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder;

  if (db) {
    await db
      .update(productBundles)
      .set({
        name,
        slug,
        description,
        bundlePrice,
        originalPrice,
        discountPercentage,
        imageUrl,
        status,
        isFeatured: Boolean(isFeatured),
        sortOrder,
        updatedAt: now,
      })
      .where(eq(productBundles.id, id));

    // If items updated, replace
    if (input.items) {
      await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
      if (itemsWithProduct.length > 0) {
        await db.insert(bundleItems).values(
          itemsWithProduct.map((it) => ({
            id: it.id,
            bundleId: id,
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
            sortOrder: it.sortOrder,
          }))
        );
      }
    }
  }

  const updated: BundleWithItems = {
    ...existing,
    name,
    slug,
    description,
    bundlePrice,
    originalPrice,
    discountPercentage,
    imageUrl,
    status,
    isFeatured: Boolean(isFeatured),
    sortOrder,
    updatedAt: now,
    items: itemsWithProduct,
    savingsAmount: Math.max(0, Number((originalPrice - bundlePrice).toFixed(2))),
  };

  const memIdx = memoryBundles.findIndex((b) => b.id === id);
  if (memIdx !== -1) {
    memoryBundles[memIdx] = updated;
  }

  return updated;
}

/**
 * Delete bundle
 */
export async function deleteBundle(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
      await db.delete(productBundles).where(eq(productBundles.id, id));
    } catch (err) {
      console.warn("D1 deleteBundle failed:", err);
    }
  }

  const idx = memoryBundles.findIndex((b) => b.id === id);
  if (idx !== -1) {
    memoryBundles.splice(idx, 1);
  }
  return true;
}

/**
 * Duplicate an existing bundle
 */
export async function duplicateBundle(id: string): Promise<BundleWithItems | null> {
  const source = await getBundleById(id);
  if (!source) return null;

  const copyName = `${source.name} (Copy)`;
  const copySlug = `${source.slug}-copy-${Date.now().toString(36).slice(-4)}`;

  return createBundle({
    name: copyName,
    slug: copySlug,
    description: source.description,
    bundlePrice: source.bundlePrice,
    imageUrl: source.imageUrl,
    status: "draft",
    isFeatured: false,
    sortOrder: (source.sortOrder || 0) + 1,
    items: source.items.map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
      sortOrder: it.sortOrder,
    })),
  });
}

/**
 * Reorder bundles
 */
export async function reorderBundles(items: Array<{ id: string; sortOrder: number }>): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      for (const item of items) {
        await db
          .update(productBundles)
          .set({ sortOrder: item.sortOrder, updatedAt: new Date().toISOString() })
          .where(eq(productBundles.id, item.id));
      }
    } catch (err) {
      console.warn("D1 reorderBundles failed:", err);
    }
  }

  items.forEach((it) => {
    const mem = memoryBundles.find((b) => b.id === it.id);
    if (mem) mem.sortOrder = it.sortOrder;
  });

  return true;
}

/**
 * Bundle statistics for Admin Dashboard Cards
 */
export async function getBundleStats(): Promise<{
  totalBundles: number;
  activeBundles: number;
  featuredBundles: number;
  averageDiscountPercent: number;
}> {
  const allBundles = await listBundles({ status: "all", limit: 500 });
  const totalBundles = allBundles.length;
  const activeBundles = allBundles.filter((b) => b.status === "active").length;
  const featuredBundles = allBundles.filter((b) => Boolean(b.isFeatured)).length;
  const totalDiscount = allBundles.reduce((acc, b) => acc + (b.discountPercentage || 0), 0);
  const averageDiscountPercent =
    totalBundles > 0 ? Number((totalDiscount / totalBundles).toFixed(1)) : 0;

  return {
    totalBundles,
    activeBundles,
    featuredBundles,
    averageDiscountPercent,
  };
}

/**
 * Check if a product belongs to any active bundle ("Also available in bundle" cross-sell)
 */
export async function getProductBundles(productId: string): Promise<BundleWithItems[]> {
  const activeBundles = await listBundles({ status: "active", limit: 20 });
  return activeBundles.filter((bundle) =>
    bundle.items.some((it) => it.productId === productId)
  );
}

/**
 * Get featured bundles for homepage display
 */
export async function getFeaturedBundles(limit: number = 4): Promise<BundleWithItems[]> {
  return listBundles({ status: "active", isFeatured: true, limit });
}

import { cache } from "react";
import { eq, desc, asc, and, sql, inArray, like, or } from "drizzle-orm";
import {
  getDb,
  productBundles,
  bundleItems,
  products,
  productImages,
  type ProductBundleRecord,
  type BundleItemRecord,
} from "@/lib/db";
import { normalizeImageUrl } from "@/lib/utils";
import { getProductById, memoryProducts } from "@/lib/products";
import { getAppSettings } from "@/lib/apps/installed";
import { invalidateStorefront } from "@/lib/storefront-invalidation";
import {
  type BundlesAppSettings,
  DEFAULT_BUNDLES_SETTINGS,
  type BundleItemDetail,
  type BundleWithItems,
  type ListBundlesOptions,
  type CreateBundleInput,
  type UpdateBundleInput,
} from "../shared/types";

export type {
  BundlesAppSettings,
  BundleItemDetail,
  BundleWithItems,
  ListBundlesOptions,
  CreateBundleInput,
  UpdateBundleInput,
};

// 20-second isolate micro-cache for active bundles queries
let _cachedActiveBundles: BundleWithItems[] | null = null;
let _cachedActiveBundlesTtl = 0;
const BUNDLES_CACHE_TTL_MS = 20 * 1000;

export function invalidateBundlesCache(): void {
  _cachedActiveBundles = null;
  _cachedActiveBundlesTtl = 0;
}

/**
 * Helper to slugify bundle titles
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves Bundles App settings from D1 installation record with fallback defaults.
 */
export async function getBundlesSettings(): Promise<BundlesAppSettings> {
  try {
    const settings = await getAppSettings<BundlesAppSettings>("bundles");
    if (!settings) return DEFAULT_BUNDLES_SETTINGS;
    return {
      enableHomepageSection:
        typeof settings.enableHomepageSection === "boolean"
          ? settings.enableHomepageSection
          : DEFAULT_BUNDLES_SETTINGS.enableHomepageSection,
      enableProductCrossSell:
        typeof settings.enableProductCrossSell === "boolean"
          ? settings.enableProductCrossSell
          : DEFAULT_BUNDLES_SETTINGS.enableProductCrossSell,
      enableCartDiscount:
        typeof settings.enableCartDiscount === "boolean"
          ? settings.enableCartDiscount
          : DEFAULT_BUNDLES_SETTINGS.enableCartDiscount,
      bundleBadgeText: settings.bundleBadgeText || DEFAULT_BUNDLES_SETTINGS.bundleBadgeText,
      maxBundlesPerSection:
        Number(settings.maxBundlesPerSection) || DEFAULT_BUNDLES_SETTINGS.maxBundlesPerSection,
    };
  } catch {
    return DEFAULT_BUNDLES_SETTINGS;
  }
}

/**
 * Fallback seed bundles for in-memory or offline execution
 */
export const memoryBundles: BundleWithItems[] = [
  {
    id: "bundle-apex-starter-kit",
    tenantId: "default",
    name: "Apex Starter Performance Kit",
    slug: "apex-starter-kit",
    description: "The complete setup for new and seasoned athletes. Pair the flagship Apex Velocity Trainer with high-performance running accessories.",
    bundlePrice: 229.99,
    originalPrice: 295.0,
    discountPercentage: 22.04,
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    isFeatured: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    savingsAmount: 65.01,
    items: [
      {
        id: "bitem-1-1",
        bundleId: "bundle-apex-starter-kit",
        productId: "prod-1",
        variantId: null,
        quantity: 1,
        sortOrder: 1,
        product: {
          id: "prod-1",
          name: "Apex Velocity Trainer",
          slug: "apex-velocity-trainer",
          price: 180.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
          stockStatus: "in_stock",
          stockQuantity: 45,
          brand: "Apex",
        },
      },
      {
        id: "bitem-1-2",
        bundleId: "bundle-apex-starter-kit",
        productId: "prod-5",
        variantId: null,
        quantity: 1,
        sortOrder: 2,
        product: {
          id: "prod-5",
          name: "Apex Elite Performance Tee",
          slug: "apex-elite-tee",
          price: 65.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
          stockStatus: "in_stock",
          stockQuantity: 50,
          brand: "Apex",
        },
      },
      {
        id: "bitem-1-3",
        bundleId: "bundle-apex-starter-kit",
        productId: "prod-7",
        variantId: null,
        quantity: 1,
        sortOrder: 3,
        product: {
          id: "prod-7",
          name: "Apex Running Socks (3-Pack)",
          slug: "apex-running-socks",
          price: 50.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80",
          stockStatus: "in_stock",
          stockQuantity: 75,
          brand: "Apex",
        },
      },
    ],
  },
  {
    id: "bundle-marathon-endurance-pack",
    tenantId: "default",
    name: "Marathon Endurance Pack",
    slug: "marathon-endurance-pack",
    description: "Engineered specifically for long distance race days. Aerodynamic singlet paired with marathon-tested carbon plate racers.",
    bundlePrice: 289.99,
    originalPrice: 360.0,
    discountPercentage: 19.45,
    imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    isFeatured: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    savingsAmount: 70.01,
    items: [
      {
        id: "bitem-2-1",
        bundleId: "bundle-marathon-endurance-pack",
        productId: "prod-2",
        variantId: null,
        quantity: 1,
        sortOrder: 1,
        product: {
          id: "prod-2",
          name: "Apex Aero Runner",
          slug: "apex-aero-runner",
          price: 210.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80",
          stockStatus: "in_stock",
          stockQuantity: 30,
          brand: "Apex",
        },
      },
      {
        id: "bitem-2-2",
        bundleId: "bundle-marathon-endurance-pack",
        productId: "prod-4",
        variantId: null,
        quantity: 1,
        sortOrder: 2,
        product: {
          id: "prod-4",
          name: "Apex Windbreaker Lite",
          slug: "apex-windbreaker-lite",
          price: 150.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
          stockStatus: "in_stock",
          stockQuantity: 25,
          brand: "Apex",
        },
      },
    ],
  },
  {
    id: "bundle-trail-explorer-combo",
    tenantId: "default",
    name: "Trail Explorer Combo",
    slug: "trail-explorer-combo",
    description: "Rugged traction meets all-weather protection for off-road mountain ascents and unpredictable wilderness terrain.",
    bundlePrice: 249.99,
    originalPrice: 325.0,
    discountPercentage: 23.08,
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    isFeatured: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    savingsAmount: 75.01,
    items: [
      {
        id: "bitem-3-1",
        bundleId: "bundle-trail-explorer-combo",
        productId: "prod-3",
        variantId: null,
        quantity: 1,
        sortOrder: 1,
        product: {
          id: "prod-3",
          name: "Apex Terra Trail",
          slug: "apex-terra-trail",
          price: 195.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
          stockStatus: "in_stock",
          stockQuantity: 18,
          brand: "Apex",
        },
      },
      {
        id: "bitem-3-2",
        bundleId: "bundle-trail-explorer-combo",
        productId: "prod-6",
        variantId: null,
        quantity: 1,
        sortOrder: 2,
        product: {
          id: "prod-6",
          name: "Apex Pro Compression Tights",
          slug: "apex-pro-compression-tights",
          price: 130.0,
          salePrice: null,
          mainImage: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80",
          stockStatus: "in_stock",
          stockQuantity: 35,
          brand: "Apex",
        },
      },
    ],
  },
];

/**
 * Resolves product details by ID using explicit column selection and LIMIT.
 */
export async function resolveProductDetails(productId: string, db?: any): Promise<any> {
  const activeDb = db || getDb();
  if (activeDb) {
    try {
      const rows = await activeDb
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

      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          price: Number(r.price),
          salePrice: r.salePrice ? Number(r.salePrice) : null,
          mainImage: r.imageUrl ? normalizeImageUrl(r.imageUrl) : null,
          stockStatus: r.stockStatus || "in_stock",
          stockQuantity: Number(r.stockQuantity || 0),
          brand: r.brand || "Apex",
        };
      }
    } catch {
      // Fallback below
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
      stockStatus: mem.stockStatus || "in_stock",
      stockQuantity: Number(mem.stockQuantity || 0),
      brand: mem.brand || "Apex",
    };
  }

  return null;
}

/**
 * List all bundles with optional filtering, search, sorting and pagination.
 * Applies 20s micro-cache on public queries and strict column projections.
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

  if (
    status === "active" &&
    !search &&
    offset === 0 &&
    sortBy === "sortOrder" &&
    sortOrder === "asc" &&
    _cachedActiveBundles &&
    Date.now() - _cachedActiveBundlesTtl < BUNDLES_CACHE_TTL_MS
  ) {
    let result = _cachedActiveBundles;
    if (isFeatured !== undefined) {
      result = result.filter((b) => Boolean(b.isFeatured) === Boolean(isFeatured));
    }
    return result.slice(0, limit);
  }

  const db = getDb();

  if (db) {
    try {
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

      const isAsc = sortOrder === "asc";
      let orderExpr;
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

      // Explicit column selection — never SELECT *
      const bundleRows = await db
        .select({
          id: productBundles.id,
          tenantId: productBundles.tenantId,
          name: productBundles.name,
          slug: productBundles.slug,
          description: productBundles.description,
          bundlePrice: productBundles.bundlePrice,
          originalPrice: productBundles.originalPrice,
          discountPercentage: productBundles.discountPercentage,
          imageUrl: productBundles.imageUrl,
          status: productBundles.status,
          isFeatured: productBundles.isFeatured,
          sortOrder: productBundles.sortOrder,
          createdAt: productBundles.createdAt,
          updatedAt: productBundles.updatedAt,
        })
        .from(productBundles)
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset);

      if (bundleRows.length === 0) {
        return [];
      }

      const bundleIds = bundleRows.map((b) => b.id);

      // Fetch items for these bundles with explicit column projection
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
        .orderBy(asc(bundleItems.sortOrder))
        .limit(200);

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

      const mappedBundles: BundleWithItems[] = bundleRows.map((b) => {
        const items = itemsByBundle[b.id] || [];
        const savingsAmount = Math.max(0, Number((b.originalPrice - b.bundlePrice).toFixed(2)));
        const imageUrl = b.imageUrl || items[0]?.product?.mainImage || null;
        return {
          ...b,
          imageUrl,
          items,
          savingsAmount,
        };
      });

      if (
        status === "active" &&
        !search &&
        offset === 0 &&
        sortBy === "sortOrder" &&
        sortOrder === "asc" &&
        isFeatured === undefined
      ) {
        _cachedActiveBundles = mappedBundles;
        _cachedActiveBundlesTtl = Date.now();
      }

      return mappedBundles;
    } catch {
      // Fallback
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

  return filtered.slice(offset, offset + limit);
}

/**
 * Get single bundle by slug with React.cache()
 */
export const getBundleBySlug = cache(async (slug: string): Promise<BundleWithItems | null> => {
  if (!slug) return null;

  const db = getDb();
  if (db) {
    try {
      const bundleRows = await db
        .select({
          id: productBundles.id,
          tenantId: productBundles.tenantId,
          name: productBundles.name,
          slug: productBundles.slug,
          description: productBundles.description,
          bundlePrice: productBundles.bundlePrice,
          originalPrice: productBundles.originalPrice,
          discountPercentage: productBundles.discountPercentage,
          imageUrl: productBundles.imageUrl,
          status: productBundles.status,
          isFeatured: productBundles.isFeatured,
          sortOrder: productBundles.sortOrder,
          createdAt: productBundles.createdAt,
          updatedAt: productBundles.updatedAt,
        })
        .from(productBundles)
        .where(eq(productBundles.slug, slug))
        .limit(1);

      if (bundleRows.length > 0) {
        const b = bundleRows[0];
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
          .orderBy(asc(bundleItems.sortOrder))
          .limit(50);

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
      }
    } catch {
      // Fallback
    }
  }

  const found = memoryBundles.find((b) => b.slug === slug);
  return found || null;
});

/**
 * Get single bundle by ID with React.cache()
 */
export const getBundleById = cache(async (id: string): Promise<BundleWithItems | null> => {
  if (!id) return null;

  const db = getDb();
  if (db) {
    try {
      const bundleRows = await db
        .select({
          id: productBundles.id,
          tenantId: productBundles.tenantId,
          name: productBundles.name,
          slug: productBundles.slug,
          description: productBundles.description,
          bundlePrice: productBundles.bundlePrice,
          originalPrice: productBundles.originalPrice,
          discountPercentage: productBundles.discountPercentage,
          imageUrl: productBundles.imageUrl,
          status: productBundles.status,
          isFeatured: productBundles.isFeatured,
          sortOrder: productBundles.sortOrder,
          createdAt: productBundles.createdAt,
          updatedAt: productBundles.updatedAt,
        })
        .from(productBundles)
        .where(eq(productBundles.id, id))
        .limit(1);

      if (bundleRows.length > 0) {
        const b = bundleRows[0];
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
          .orderBy(asc(bundleItems.sortOrder))
          .limit(50);

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
      }
    } catch {
      // Fallback
    }
  }

  const found = memoryBundles.find((b) => b.id === id);
  return found || null;
});

/**
 * Create a new bundle with automatic cross-worker cache invalidation.
 */
export async function createBundle(input: CreateBundleInput): Promise<BundleWithItems> {
  const db = getDb();
  const id = `bundle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  let baseSlug = input.slug ? slugify(input.slug) : slugify(input.name);
  if (!baseSlug) baseSlug = `bundle-${Date.now()}`;
  let slug = baseSlug;

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
  invalidateBundlesCache();
  await invalidateStorefront({ target: "bundles" }).catch(() => null);
  return created;
}

/**
 * Update an existing bundle with cross-worker invalidation.
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
  let itemsToSave = input.items
    ? input.items
    : existing.items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        quantity: it.quantity,
        sortOrder: it.sortOrder,
      }));

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

  const imageUrl =
    input.imageUrl !== undefined
      ? input.imageUrl
      : existing.imageUrl || itemsWithProduct[0]?.product?.mainImage || null;
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

  invalidateBundlesCache();
  await invalidateStorefront({ target: "bundles" }).catch(() => null);
  return updated;
}

/**
 * Delete a bundle with cross-worker invalidation.
 */
export async function deleteBundle(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
      await db.delete(productBundles).where(eq(productBundles.id, id));
    } catch {
      // Continue
    }
  }

  const memIdx = memoryBundles.findIndex((b) => b.id === id);
  if (memIdx !== -1) {
    memoryBundles.splice(memIdx, 1);
  }

  invalidateBundlesCache();
  await invalidateStorefront({ target: "bundles" }).catch(() => null);
  return true;
}

/**
 * Duplicate a bundle
 */
export async function duplicateBundle(id: string): Promise<BundleWithItems | null> {
  const source = await getBundleById(id);
  if (!source) return null;

  return createBundle({
    name: `${source.name} (Copy)`,
    slug: `${source.slug}-copy`,
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
    } catch {
      // Continue
    }
  }

  items.forEach((it) => {
    const mem = memoryBundles.find((b) => b.id === it.id);
    if (mem) mem.sortOrder = it.sortOrder;
  });

  invalidateBundlesCache();
  await invalidateStorefront({ target: "bundles" }).catch(() => null);
  return true;
}

/**
 * Aggregated bundle stats using SQL
 */
export async function getBundleStats(): Promise<{
  totalBundles: number;
  activeBundles: number;
  featuredBundles: number;
  averageSavings: number;
}> {
  const db = getDb();
  if (db) {
    try {
      const stats = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`sum(case when ${productBundles.status} = 'active' then 1 else 0 end)`,
          featured: sql<number>`sum(case when ${productBundles.isFeatured} = 1 then 1 else 0 end)`,
          avgSavings: sql<number>`avg(case when ${productBundles.originalPrice} > ${productBundles.bundlePrice} then (${productBundles.originalPrice} - ${productBundles.bundlePrice}) else 0 end)`,
        })
        .from(productBundles);

      if (stats.length > 0) {
        return {
          totalBundles: Number(stats[0].total || 0),
          activeBundles: Number(stats[0].active || 0),
          featuredBundles: Number(stats[0].featured || 0),
          averageSavings: Number(Number(stats[0].avgSavings || 0).toFixed(2)),
        };
      }
    } catch {
      // Fallback
    }
  }

  const total = memoryBundles.length;
  const active = memoryBundles.filter((b) => b.status === "active").length;
  const featured = memoryBundles.filter((b) => b.isFeatured).length;
  const savings = memoryBundles.map((b) => b.savingsAmount);
  const avgSavings = savings.length > 0 ? savings.reduce((a, b) => a + b, 0) / savings.length : 0;

  return {
    totalBundles: total,
    activeBundles: active,
    featuredBundles: featured,
    averageSavings: Number(avgSavings.toFixed(2)),
  };
}

/**
 * Get all active bundles containing a specific productId (for cross-sell)
 */
export const getProductBundles = cache(async (productId: string): Promise<BundleWithItems[]> => {
  if (!productId) return [];
  const all = await listBundles({ status: "active", limit: 20 });
  return all.filter((b) => b.items.some((it) => it.productId === productId));
});

/**
 * Get featured bundles for homepage
 */
export const getFeaturedBundles = cache(async (limit: number = 4): Promise<BundleWithItems[]> => {
  return listBundles({ status: "active", isFeatured: true, limit });
});

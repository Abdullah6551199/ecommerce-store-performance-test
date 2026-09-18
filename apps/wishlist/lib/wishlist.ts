import { cache } from "react";
import { getDb, customerWishlist, products, productImages } from "@/lib/db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getAppSettings } from "@/lib/apps/installed";
import { DEFAULT_WISHLIST_SETTINGS, type WishlistAppSettings, type WishlistRecord, type WishlistProduct } from "../shared/types";

// 20-second isolate micro-cache per customer (mutation-invalidated)
const wishlistCache = new Map<string, { data: WishlistRecord[]; timestamp: number }>();
const CACHE_TTL_MS = 20 * 1000;

export function invalidateWishlistCache(customerId?: string): void {
  if (customerId) {
    wishlistCache.delete(customerId);
  } else {
    wishlistCache.clear();
  }
}

/**
 * Retrieves all wishlist items for a customer.
 * Uses strict column selection, single query join, and batch image resolution.
 * Wrapped in React.cache() for request deduplication and 20s isolate micro-cache.
 */
export const getCustomerWishlist = cache(
  async (customerId: string): Promise<WishlistRecord[]> => {
    if (!customerId) return [];

    const cached = wishlistCache.get(customerId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const db = getDb();
    if (!db) return [];

    try {
      const rows = await db
        .select({
          id: customerWishlist.id,
          productId: customerWishlist.productId,
          createdAt: customerWishlist.createdAt,
          product: {
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            stock: products.stockQuantity,
            status: products.status,
          },
        })
        .from(customerWishlist)
        .innerJoin(products, eq(customerWishlist.productId, products.id))
        .where(eq(customerWishlist.customerId, customerId))
        .orderBy(desc(customerWishlist.createdAt))
        .limit(100);

      if (rows.length === 0) {
        wishlistCache.set(customerId, { data: [], timestamp: Date.now() });
        return [];
      }

      // Batch load primary product images (zero N+1 queries)
      const pIds = rows.map((r) => r.product.id);
      const images = await db
        .select({
          productId: productImages.productId,
          imageUrl: productImages.imageUrl,
          isMain: productImages.isMain,
        })
        .from(productImages)
        .where(inArray(productImages.productId, pIds))
        .limit(pIds.length * 3);

      const imageMap = new Map<string, string>();
      for (const img of images) {
        if (img.isMain || !imageMap.has(img.productId)) {
          imageMap.set(img.productId, img.imageUrl);
        }
      }

      const items: WishlistRecord[] = rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        createdAt: r.createdAt,
        product: {
          ...r.product,
          mainImage: imageMap.get(r.product.id) || null,
        },
      }));

      wishlistCache.set(customerId, { data: items, timestamp: Date.now() });
      return items;
    } catch (err) {
      console.warn("[WishlistLib] Error fetching wishlist:", err);
      return [];
    }
  }
);

/**
 * Checks if a product exists in customer's wishlist.
 */
export async function isInCustomerWishlist(
  customerId: string,
  productId: string
): Promise<boolean> {
  if (!customerId || !productId) return false;
  const db = getDb();
  if (!db) return false;

  try {
    const existing = await db
      .select({ id: customerWishlist.id })
      .from(customerWishlist)
      .where(
        and(
          eq(customerWishlist.customerId, customerId),
          eq(customerWishlist.productId, productId)
        )
      )
      .limit(1);

    return existing.length > 0;
  } catch {
    return false;
  }
}

/**
 * Adds a product to customer's wishlist.
 */
export async function addToCustomerWishlist(
  customerId: string,
  productId: string
): Promise<boolean> {
  if (!customerId || !productId) return false;
  const db = getDb();
  if (!db) return false;

  try {
    const already = await isInCustomerWishlist(customerId, productId);
    if (!already) {
      await db.insert(customerWishlist).values({
        id: crypto.randomUUID(),
        customerId,
        productId,
        createdAt: new Date().toISOString(),
      });
    }
    invalidateWishlistCache(customerId);
    return true;
  } catch (err) {
    console.warn("[WishlistLib] Error adding to wishlist:", err);
    return false;
  }
}

/**
 * Removes a product from customer's wishlist.
 */
export async function removeFromCustomerWishlist(
  customerId: string,
  productId: string
): Promise<boolean> {
  if (!customerId || !productId) return false;
  const db = getDb();
  if (!db) return false;

  try {
    await db
      .delete(customerWishlist)
      .where(
        and(
          eq(customerWishlist.customerId, customerId),
          eq(customerWishlist.productId, productId)
        )
      );

    invalidateWishlistCache(customerId);
    return true;
  } catch (err) {
    console.warn("[WishlistLib] Error removing from wishlist:", err);
    return false;
  }
}

/**
 * Toggles a product in customer's wishlist.
 * Returns true if added, false if removed.
 */
export async function toggleCustomerWishlist(
  customerId: string,
  productId: string
): Promise<boolean> {
  const inWishlist = await isInCustomerWishlist(customerId, productId);
  if (inWishlist) {
    await removeFromCustomerWishlist(customerId, productId);
    return false;
  } else {
    await addToCustomerWishlist(customerId, productId);
    return true;
  }
}

/**
 * Synchronizes client product IDs into customer's wishlist in D1.
 */
export async function syncCustomerWishlist(
  customerId: string,
  productIds: string[]
): Promise<string[]> {
  if (!customerId) return [];
  const db = getDb();
  if (!db) return productIds;

  try {
    const existing = await db
      .select({ productId: customerWishlist.productId })
      .from(customerWishlist)
      .where(eq(customerWishlist.customerId, customerId))
      .limit(100);

    const existingSet = new Set(existing.map((r) => r.productId));
    const merged = new Set([...existingSet, ...productIds]);

    const toInsert = productIds.filter((pid) => !existingSet.has(pid));
    for (const pid of toInsert) {
      try {
        await db.insert(customerWishlist).values({
          id: crypto.randomUUID(),
          customerId,
          productId: pid,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Ignore duplicate key or invalid foreign key
      }
    }

    invalidateWishlistCache(customerId);
    return Array.from(merged);
  } catch (err) {
    console.warn("[WishlistLib] Error syncing wishlist:", err);
    return productIds;
  }
}

/**
 * Returns customer's active wishlist item count.
 */
export async function getCustomerWishlistCount(customerId: string): Promise<number> {
  if (!customerId) return 0;
  const items = await getCustomerWishlist(customerId);
  return items.length;
}

/**
 * Loads product details for an array of product IDs (e.g. for guest wishlist)
 */
export async function getProductsByIds(productIds: string[]): Promise<WishlistProduct[]> {
  if (!productIds || productIds.length === 0) return [];
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        stock: products.stockQuantity,
        status: products.status,
      })
      .from(products)
      .where(inArray(products.id, productIds))
      .limit(100);

    if (rows.length === 0) return [];

    const images = await db
      .select({
        productId: productImages.productId,
        imageUrl: productImages.imageUrl,
        isMain: productImages.isMain,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .limit(productIds.length * 3);

    const imageMap = new Map<string, string>();
    for (const img of images) {
      if (img.isMain || !imageMap.has(img.productId)) {
        imageMap.set(img.productId, img.imageUrl);
      }
    }

    return rows.map((r) => ({
      ...r,
      mainImage: imageMap.get(r.id) || null,
    }));
  } catch (err) {
    console.warn("[WishlistLib] Error fetching products by IDs:", err);
    return [];
  }
}

/**
 * Retrieves the current Wishlist app settings.
 */
export async function getWishlistAppSettings(): Promise<WishlistAppSettings> {
  const settings = await getAppSettings<WishlistAppSettings>("wishlist");
  return { ...DEFAULT_WISHLIST_SETTINGS, ...(settings || {}) };
}

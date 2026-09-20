import { cache } from "react";
import { getDb, digitalProducts, products, productImages } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import type { DigitalProduct, DigitalFile } from "../shared/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 20 * 1000; // 20s micro-cache
const memoryCache = new Map<string, CacheEntry<any>>();

export function invalidateDigitalProductsCache(): void {
  memoryCache.clear();
}

/**
 * Check if a product ID corresponds to a digital product
 */
export const isDigitalProduct = cache(async (productId: string): Promise<boolean> => {
  if (!productId) return false;
  const db = getDb();
  if (!db) return false;

  const cacheKey = `is-digital:${productId}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const rows = await db
      .select({ id: digitalProducts.id })
      .from(digitalProducts)
      .where(eq(digitalProducts.productId, productId))
      .limit(1);

    const result = rows.length > 0;
    memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch {
    return false;
  }
});

/**
 * Get digital product record by store product ID
 */
export const getDigitalProductByProductId = cache(
  async (productId: string): Promise<DigitalProduct | null> => {
    if (!productId) return null;
    const db = getDb();
    if (!db) return null;

    const cacheKey = `dp:product:${productId}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const rows = await db
        .select({
          id: digitalProducts.id,
          productId: digitalProducts.productId,
          filesJson: digitalProducts.filesJson,
          downloadLimit: digitalProducts.downloadLimit,
          expiryDays: digitalProducts.expiryDays,
          licenseEnabled: digitalProducts.licenseEnabled,
          createdAt: digitalProducts.createdAt,
          updatedAt: digitalProducts.updatedAt,
        })
        .from(digitalProducts)
        .where(eq(digitalProducts.productId, productId))
        .limit(1);

      if (rows.length === 0) return null;

      const record = rows[0];
      let files: DigitalFile[] = [];
      try {
        files = JSON.parse(record.filesJson);
      } catch {
        files = [];
      }

      const result: DigitalProduct = {
        id: record.id,
        productId: record.productId,
        filesJson: record.filesJson,
        downloadLimit: record.downloadLimit ?? 5,
        expiryDays: record.expiryDays ?? 30,
        licenseEnabled: record.licenseEnabled ?? 0,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        files,
      };

      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return null;
    }
  }
);

/**
 * Get digital product record by primary ID
 */
export async function getDigitalProductById(id: string): Promise<DigitalProduct | null> {
  if (!id) return null;
  const db = getDb();
  if (!db) return null;

  try {
    const rows = await db
      .select({
        id: digitalProducts.id,
        productId: digitalProducts.productId,
        filesJson: digitalProducts.filesJson,
        downloadLimit: digitalProducts.downloadLimit,
        expiryDays: digitalProducts.expiryDays,
        licenseEnabled: digitalProducts.licenseEnabled,
        createdAt: digitalProducts.createdAt,
        updatedAt: digitalProducts.updatedAt,
      })
      .from(digitalProducts)
      .where(eq(digitalProducts.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const record = rows[0];
    let files: DigitalFile[] = [];
    try {
      files = JSON.parse(record.filesJson);
    } catch {
      files = [];
    }

    return {
      id: record.id,
      productId: record.productId,
      filesJson: record.filesJson,
      downloadLimit: record.downloadLimit ?? 5,
      expiryDays: record.expiryDays ?? 30,
      licenseEnabled: record.licenseEnabled ?? 0,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      files,
    };
  } catch {
    return null;
  }
}

/**
 * List all digital products with store product titles and pricing
 */
export async function getAllDigitalProducts(
  limit = 50,
  offset = 0
): Promise<Array<DigitalProduct & { productName?: string; productPrice?: number; productSlug?: string }>> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({
        id: digitalProducts.id,
        productId: digitalProducts.productId,
        filesJson: digitalProducts.filesJson,
        downloadLimit: digitalProducts.downloadLimit,
        expiryDays: digitalProducts.expiryDays,
        licenseEnabled: digitalProducts.licenseEnabled,
        createdAt: digitalProducts.createdAt,
        updatedAt: digitalProducts.updatedAt,
        productName: products.name,
        productPrice: products.price,
        productSlug: products.slug,
      })
      .from(digitalProducts)
      .leftJoin(products, eq(digitalProducts.productId, products.id))
      .orderBy(desc(digitalProducts.createdAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    return rows.map((r) => {
      let files: DigitalFile[] = [];
      try {
        files = JSON.parse(r.filesJson);
      } catch {
        files = [];
      }
      return {
        id: r.id,
        productId: r.productId,
        filesJson: r.filesJson,
        downloadLimit: r.downloadLimit ?? 5,
        expiryDays: r.expiryDays ?? 30,
        licenseEnabled: r.licenseEnabled ?? 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        files,
        productName: r.productName || undefined,
        productPrice: r.productPrice || undefined,
        productSlug: r.productSlug || undefined,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Create or replace digital product mapping
 */
export async function createDigitalProduct(data: {
  productId: string;
  files: DigitalFile[];
  downloadLimit?: number;
  expiryDays?: number;
  licenseEnabled?: boolean;
}): Promise<string | null> {
  const db = getDb();
  if (!db || !data.productId) return null;

  const now = Date.now();
  const id = crypto.randomUUID();
  const filesJson = JSON.stringify(data.files || []);

  try {
    // Check if one already exists for this productId
    const existing = await db
      .select({ id: digitalProducts.id })
      .from(digitalProducts)
      .where(eq(digitalProducts.productId, data.productId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(digitalProducts)
        .set({
          filesJson,
          downloadLimit: data.downloadLimit ?? 5,
          expiryDays: data.expiryDays ?? 30,
          licenseEnabled: data.licenseEnabled ? 1 : 0,
          updatedAt: now,
        })
        .where(eq(digitalProducts.id, existing[0].id));

      invalidateDigitalProductsCache();
      return existing[0].id;
    }

    await db.insert(digitalProducts).values({
      id,
      productId: data.productId,
      filesJson,
      downloadLimit: data.downloadLimit ?? 5,
      expiryDays: data.expiryDays ?? 30,
      licenseEnabled: data.licenseEnabled ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });

    invalidateDigitalProductsCache();
    return id;
  } catch {
    return null;
  }
}

/**
 * Update an existing digital product
 */
export async function updateDigitalProduct(
  id: string,
  data: {
    files?: DigitalFile[];
    downloadLimit?: number;
    expiryDays?: number;
    licenseEnabled?: boolean;
  }
): Promise<boolean> {
  const db = getDb();
  if (!db || !id) return false;

  const now = Date.now();
  const updates: Record<string, any> = { updatedAt: now };

  if (data.files !== undefined) {
    updates.filesJson = JSON.stringify(data.files);
  }
  if (data.downloadLimit !== undefined) {
    updates.downloadLimit = data.downloadLimit;
  }
  if (data.expiryDays !== undefined) {
    updates.expiryDays = data.expiryDays;
  }
  if (data.licenseEnabled !== undefined) {
    updates.licenseEnabled = data.licenseEnabled ? 1 : 0;
  }

  try {
    await db.update(digitalProducts).set(updates).where(eq(digitalProducts.id, id));
    invalidateDigitalProductsCache();
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete digital product record
 */
export async function deleteDigitalProduct(id: string): Promise<boolean> {
  const db = getDb();
  if (!db || !id) return false;

  try {
    await db.delete(digitalProducts).where(eq(digitalProducts.id, id));
    invalidateDigitalProductsCache();
    return true;
  } catch {
    return false;
  }
}

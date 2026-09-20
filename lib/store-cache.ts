/**
 * Storefront API & Data Micro-Cache (Stage F0.5d Optimization)
 * Isolate-scoped in-memory cache with 30-second TTL for safe public GET endpoints:
 * - /api/products, /api/categories, /api/bundles, /api/homepage, /api/settings
 * - Never cache private routes: /api/cart, /api/checkout, /api/customer/*, /api/auth/*
 * Invalidate on admin mutation via shared invalidation.
 */

export const STOREFRONT_API_CACHE_TTL_MS = 30 * 1000; // 30 seconds

interface CacheRecord<T = unknown> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const storefrontCache = new Map<string, CacheRecord>();

/**
 * Generate a cache key for storefront endpoint and query parameters
 */
export function getStorefrontCacheKey(
  endpoint: string,
  queryParams?: Record<string, string | undefined | null> | URLSearchParams | string
): string {
  let paramStr = "";
  if (typeof queryParams === "string") {
    paramStr = queryParams;
  } else if (queryParams instanceof URLSearchParams) {
    const sorted = Array.from(queryParams.entries()).sort(([a], [b]) => a.localeCompare(b));
    paramStr = sorted.map(([k, v]) => `${k}=${v}`).join("&");
  } else if (queryParams && typeof queryParams === "object") {
    const keys = Object.keys(queryParams).sort();
    paramStr = keys
      .filter((k) => queryParams[k] !== undefined && queryParams[k] !== null)
      .map((k) => `${k}=${queryParams[k]}`)
      .join("&");
  }
  return `storefront:${endpoint}:${paramStr}`;
}

/**
 * Get cached response data if within TTL
 */
export function getStorefrontCache<T>(key: string): T | null {
  const record = storefrontCache.get(key) as CacheRecord<T> | undefined;
  if (!record) return null;

  if (Date.now() - record.timestamp < record.ttlMs) {
    return record.data;
  }

  // Expired
  storefrontCache.delete(key);
  return null;
}

/**
 * Store data in the isolate cache (default 30s TTL)
 */
export function setStorefrontCache<T>(
  key: string,
  data: T,
  ttlMs = STOREFRONT_API_CACHE_TTL_MS
): void {
  storefrontCache.set(key, {
    data,
    timestamp: Date.now(),
    ttlMs,
  });
}

/**
 * Invalidate all storefront caches (or matching prefix/key)
 */
export function invalidateStorefrontCache(prefixOrKey?: string): void {
  if (!prefixOrKey) {
    storefrontCache.clear();
    return;
  }
  for (const key of storefrontCache.keys()) {
    if (key.startsWith(prefixOrKey) || key.includes(prefixOrKey)) {
      storefrontCache.delete(key);
    }
  }
}

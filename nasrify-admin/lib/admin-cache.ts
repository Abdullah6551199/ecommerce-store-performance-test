/**
 * Admin API Micro-Cache (Stage F0.5b Optimization)
 * Isolate-scoped in-memory cache with 20-second TTL for read-heavy admin endpoints.
 * Keyed by admin userId + endpoint + normalized query parameters.
 * Invalidate on:
 * - Order, product, category, customer mutations
 * - User logout
 */

export const ADMIN_API_CACHE_TTL_MS = 20 * 1000; // 20 seconds

interface CacheRecord<T = unknown> {
  data: T;
  timestamp: number;
}

const adminApiCache = new Map<string, CacheRecord>();

/**
 * Generate a cache key including admin userId, endpoint, and query parameters
 */
export function getAdminApiCacheKey(
  userId: string,
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
  return `admin:${userId}:${endpoint}:${paramStr}`;
}

/**
 * Get cached response data if within TTL
 */
export function getAdminApiCache<T>(key: string): T | null {
  const record = adminApiCache.get(key) as CacheRecord<T> | undefined;
  if (!record) return null;

  if (Date.now() - record.timestamp < ADMIN_API_CACHE_TTL_MS) {
    return record.data;
  }

  // Expired
  adminApiCache.delete(key);
  return null;
}

/**
 * Store data in the 20-second isolate cache
 */
export function setAdminApiCache<T>(key: string, data: T): void {
  adminApiCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate all admin API caches (or specific matching prefix/key)
 */
export function invalidateAdminApiCache(prefixOrKey?: string): void {
  if (!prefixOrKey) {
    adminApiCache.clear();
    return;
  }
  for (const key of adminApiCache.keys()) {
    if (key.startsWith(prefixOrKey) || key.includes(prefixOrKey)) {
      adminApiCache.delete(key);
    }
  }
}

/**
 * Invalidate user cache on logout or credential change
 */
export function invalidateAdminUserCache(userId: string): void {
  invalidateAdminApiCache(`admin:${userId}:`);
}

/**
 * Invalidate cached admin dashboard/analytics data on data mutations (orders, products, customers)
 */
export function invalidateAdminDataCache(): void {
  invalidateAdminApiCache();
}

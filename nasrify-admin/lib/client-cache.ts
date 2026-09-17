/**
 * Client-Side In-Memory Micro-Cache for Admin CSR
 * 
 * Provides session-scoped caching across client-side route navigations in Next.js:
 * - 20s TTL for /api/admin/dashboard and /api/admin/analytics/* (matches F0.5b server cache)
 * - 5-minute TTL for catalog/setting lookups
 * - Instant cache invalidation on data mutations (POST, PATCH, DELETE)
 * - Zero external dependencies, pure in-memory browser session lifecycle
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const clientMemoryCache = new Map<string, CacheEntry<any>>();

export const DEFAULT_CLIENT_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const DASHBOARD_ANALYTICS_TTL_MS = 20 * 1000; // 20 seconds

/**
 * Retrieve cached data if present and unexpired.
 */
export function getClientCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const entry = clientMemoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    clientMemoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Store data in the client-side session cache.
 */
export function setClientCached<T>(
  key: string,
  data: T,
  ttlMs: number = DEFAULT_CLIENT_TTL_MS
): void {
  if (typeof window === "undefined") return;
  clientMemoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidate cached entries by full key, prefix, or purge all.
 */
export function invalidateClientCache(keyOrPrefix?: string): void {
  if (typeof window === "undefined") return;
  if (!keyOrPrefix) {
    clientMemoryCache.clear();
    return;
  }
  for (const key of clientMemoryCache.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      clientMemoryCache.delete(key);
    }
  }
}

/**
 * Fetch wrapper that returns cached JSON data if valid, otherwise makes the network call and caches the response.
 */
export async function fetchWithClientCache<T = any>(
  url: string,
  options?: {
    ttlMs?: number;
    forceRefresh?: boolean;
    init?: RequestInit;
  }
): Promise<{ success: boolean; data?: T; error?: string; [key: string]: any }> {
  const isDashboardOrAnalytics =
    url.includes("/api/admin/dashboard") || url.includes("/api/admin/analytics");

  const ttl =
    options?.ttlMs ??
    (isDashboardOrAnalytics ? DASHBOARD_ANALYTICS_TTL_MS : DEFAULT_CLIENT_TTL_MS);

  if (!options?.forceRefresh) {
    const cached = getClientCached<T>(url);
    if (cached !== null) {
      return { success: true, data: cached };
    }
  }

  try {
    const res = await fetch(url, options?.init);
    const json = (await res.json()) as { success: boolean; data?: T; error?: string; [key: string]: any };

    if (res.ok && json.success && json.data !== undefined) {
      setClientCached(url, json.data, ttl);
    }

    return json;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error during fetch",
    };
  }
}

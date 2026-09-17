import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Cloudflare Edge Cache Helper (Stage F0.5d)
 * Leverages Cloudflare Workers' native Cache API (caches.default) to cache GET responses
 * directly at Cloudflare global edge data centers.
 */

/**
 * Construct normalized cache key request containing path, query string, and tenant ID.
 */
export function buildEdgeCacheKey(urlOrReq: string | Request | URL, tenantId = "default"): Request {
  const urlObj = typeof urlOrReq === "string"
    ? new URL(urlOrReq, "https://nasrify-store.zia291930.workers.dev")
    : urlOrReq instanceof Request
    ? new URL(urlOrReq.url)
    : urlOrReq;

  // Normalize search parameters (sorted alphabetically for consistent cache hit ratio)
  const sortedParams = new URLSearchParams();
  const keys = Array.from(urlObj.searchParams.keys()).sort();
  for (const k of keys) {
    for (const val of urlObj.searchParams.getAll(k)) {
      sortedParams.append(k, val);
    }
  }

  const normalizedUrl = new URL(urlObj.pathname, urlObj.origin);
  const paramStr = sortedParams.toString();
  if (paramStr) {
    normalizedUrl.search = paramStr;
  }

  const acceptHeader = urlOrReq instanceof Request ? urlOrReq.headers.get("accept") || "*/*" : "*/*";

  return new Request(normalizedUrl.toString(), {
    method: "GET",
    headers: {
      accept: acceptHeader,
      "x-tenant-id": tenantId,
    },
  });
}

export async function matchEdgeCache(req: Request, tenantId = "default"): Promise<Response | null> {
  try {
    const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    if (!cache || req.method !== "GET") return null;

    const cacheKey = buildEdgeCacheKey(req, tenantId);
    const cached = await cache.match(cacheKey);
    if (cached) {
      const resHeaders = new Headers(cached.headers);
      resHeaders.set("CF-Cache-Status", "HIT");
      resHeaders.set("X-Cache-Status", "HIT");
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: resHeaders,
      });
    }
  } catch (err) {
    // Non-fatal fallback for environments without Cloudflare Cache API
    console.warn("[EdgeCache] match failed:", err);
  }
  return null;
}

export function putEdgeCache(
  req: Request,
  res: Response,
  ttlSeconds = 60,
  staleWhileRevalidateSeconds = 600,
  tenantId = "default"
): void {
  try {
    const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    if (!cache || req.method !== "GET" || res.status !== 200) return;

    const cacheKey = buildEdgeCacheKey(req, tenantId);

    const toCache = res.clone();
    toCache.headers.set("CF-Cache-Status", "HIT");
    toCache.headers.set("X-Cache-Status", "HIT");
    toCache.headers.set(
      "Cache-Control",
      `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`
    );
    toCache.headers.set(
      "CDN-Cache-Control",
      `public, max-age=${ttlSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`
    );
    toCache.headers.set(
      "Cloudflare-CDN-Cache-Control",
      `public, max-age=${ttlSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`
    );

    try {
      const { ctx } = getCloudflareContext();
      if (ctx?.waitUntil) {
        ctx.waitUntil(cache.put(cacheKey, toCache));
        return;
      }
    } catch {
      // Fallback if not inside Cloudflare context
    }

    cache.put(cacheKey, toCache).catch(() => {});
  } catch (err) {
    console.warn("[EdgeCache] put failed:", err);
  }
}

/**
 * Delete a specific entry from Cloudflare edge cache (caches.default.delete)
 */
export async function purgeEdgeCache(urlOrPath: string, tenantId = "default"): Promise<boolean> {
  try {
    const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    if (!cache) return false;

    const cacheKey = buildEdgeCacheKey(urlOrPath, tenantId);
    return await cache.delete(cacheKey);
  } catch (err) {
    console.warn("[EdgeCache] purge failed:", err);
    return false;
  }
}


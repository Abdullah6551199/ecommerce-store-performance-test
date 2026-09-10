import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Cloudflare Edge Cache Helper
 * Leverages Cloudflare Workers' native Cache API (caches.default) to cache GET responses
 * directly at Cloudflare global edge data centers.
 */

export async function matchEdgeCache(req: Request): Promise<Response | null> {
  try {
    const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    if (!cache || req.method !== "GET") return null;

    const cacheKey = new Request(req.url, {
      method: "GET",
      headers: {
        accept: req.headers.get("accept") || "*/*",
      },
    });

    const cached = await cache.match(cacheKey);
    if (cached) {
      const resHeaders = new Headers(cached.headers);
      resHeaders.set("CF-Cache-Status", "HIT");
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
  staleWhileRevalidateSeconds = 600
): void {
  try {
    const cache = (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
    if (!cache || req.method !== "GET" || res.status !== 200) return;

    const cacheKey = new Request(req.url, {
      method: "GET",
      headers: {
        accept: req.headers.get("accept") || "*/*",
      },
    });

    const toCache = res.clone();
    toCache.headers.set("CF-Cache-Status", "HIT");
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

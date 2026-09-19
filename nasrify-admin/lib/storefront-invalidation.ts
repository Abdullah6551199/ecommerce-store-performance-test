/**
 * lib/storefront-invalidation.ts
 * Secure cross-worker cache invalidation client for nasrify-admin.
 * Notifies nasrify-store to invalidate in-memory micro-cache and edge cache.
 */

interface InvalidationOptions {
  target?: "products" | "categories" | "orders" | "all" | string;
  path?: string;
}

/**
 * Resolves the storefront URL and secret from Cloudflare context or process environment
 */
function getStorefrontConfig() {
  let storefrontUrl = process.env.STOREFRONT_URL || "https://nasrify-store.zia291930.workers.dev";
  let secret = process.env.CACHE_INVALIDATE_SECRET || "";

  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const cfCtx = getCloudflareContext();
    if (cfCtx?.env?.STOREFRONT_URL) {
      storefrontUrl = cfCtx.env.STOREFRONT_URL;
    }
    if (cfCtx?.env?.CACHE_INVALIDATE_SECRET) {
      secret = cfCtx.env.CACHE_INVALIDATE_SECRET;
    }
  } catch {
    // Running outside Cloudflare context or local build
  }

  return {
    storefrontUrl: storefrontUrl.replace(/\/+$/, ""),
    secret,
  };
}

/**
 * Sleep helper for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Triggers storefront cache invalidation with one retry and backoff.
 * Non-blocking: will not throw to caller so admin mutations succeed even if storefront is cold.
 */
export async function invalidateStorefront(options: InvalidationOptions = {}): Promise<{ success: boolean; attempts: number }> {
  const { storefrontUrl, secret } = getStorefrontConfig();

  if (!secret) {
    console.warn("[Storefront Invalidation] Skipped: CACHE_INVALIDATE_SECRET is not configured.");
    return { success: false, attempts: 0 };
  }

  const endpoint = `${storefrontUrl}/api/cache/invalidate`;
  const payload = JSON.stringify({
    target: options.target || "all",
    path: options.path || null,
  });

  const maxAttempts = 2; // Initial attempt + 1 retry
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: payload,
      });

      if (response.ok) {
        return { success: true, attempts: attempt };
      }

      console.warn(
        `[Storefront Invalidation] Attempt ${attempt} returned status ${response.status}`
      );
    } catch (err) {
      console.warn(
        `[Storefront Invalidation] Attempt ${attempt} network error:`,
        err instanceof Error ? err.message : err
      );
    }

    if (attempt < maxAttempts) {
      await sleep(250); // 250ms backoff before retry
    }
  }

  console.warn(
    `[Storefront Invalidation] Failed to invalidate storefront cache after ${maxAttempts} attempts.`
  );
  return { success: false, attempts: maxAttempts };
}

/**
 * Compatible alias for cross-worker invalidation
 */
export async function sendStorefrontInvalidation(
  targetOrTags?: string | string[] | InvalidationOptions
): Promise<{ success: boolean; attempts: number }> {
  if (!targetOrTags) {
    return invalidateStorefront({ target: "all" });
  }
  if (typeof targetOrTags === "string") {
    return invalidateStorefront({ target: targetOrTags });
  }
  if (Array.isArray(targetOrTags)) {
    return invalidateStorefront({ target: targetOrTags.join(",") });
  }
  return invalidateStorefront(targetOrTags);
}

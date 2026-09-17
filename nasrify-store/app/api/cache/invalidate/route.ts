import { NextRequest, NextResponse } from "next/server";
import { invalidateStorefrontCache } from "@/lib/store-cache";
import { purgeEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

/**
 * POST /api/cache/invalidate
 * Secure internal / admin invalidation hook for storefront cache.
 * Clears in-memory isolate micro-cache and purges Cloudflare edge cache.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let configuredSecret = process.env.CACHE_INVALIDATE_SECRET || "";

    try {
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const cfCtx = getCloudflareContext();
      if (cfCtx?.env?.CACHE_INVALIDATE_SECRET) {
        configuredSecret = cfCtx.env.CACHE_INVALIDATE_SECRET;
      }
    } catch {
      // Running outside Cloudflare context or during local build
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const providedSecret = body.secret || (authHeader?.replace(/^Bearer\s+/i, "") ?? "");

    // Secure verification: must match configured worker secret
    if (!configuredSecret || providedSecret !== configuredSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { target, path } = body as { target?: string; path?: string };

    // Invalidate in-memory micro-cache
    invalidateStorefrontCache(target);

    // If a specific URL/path is specified, purge from edge cache
    if (path) {
      await purgeEdgeCache(path);
    }

    return NextResponse.json({
      success: true,
      message: "Storefront cache invalidated successfully",
      target: target || "all",
      path: path || null,
    });
  } catch (err) {
    console.error("[POST /api/cache/invalidate] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}

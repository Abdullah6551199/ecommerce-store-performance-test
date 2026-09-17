import { NextRequest, NextResponse } from "next/server";
import { getActiveCategories, buildCategoryTree } from "@/lib/categories";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";
import { getStorefrontCache, setStorefrontCache, getStorefrontCacheKey } from "@/lib/store-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/categories
 * Public endpoint: Returns all active categories formatted with nested hierarchy.
 * Micro-cached in-memory for 30s; cached at Cloudflare edge for 60s with stale-while-revalidate.
 */
export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

    const cacheKey = getStorefrontCacheKey("categories", req.nextUrl.searchParams);
    const cached = getStorefrontCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "Cloudflare-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "CF-Cache-Status": "HIT",
          "X-Cache-Status": "HIT",
        },
      });
    }

    const activeItems = await getActiveCategories();
    const tree = buildCategoryTree(activeItems);
    const result = {
      success: true,
      data: {
        categories: activeItems,
        tree,
      },
    };

    setStorefrontCache(cacheKey, result, 30 * 1000);

    const res = NextResponse.json(
      result,
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "Cloudflare-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "CF-Cache-Status": "MISS",
          "X-Cache-Status": "MISS",
        },
      }
    );

    putEdgeCache(req, res, 60, 600);

    return res;
  } catch (error) {
    console.error("[GET /api/categories] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

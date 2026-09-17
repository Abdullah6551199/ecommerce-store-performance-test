import { NextRequest, NextResponse } from "next/server";
import { listBundles } from "@/lib/bundles";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";
import { getStorefrontCache, setStorefrontCache, getStorefrontCacheKey } from "@/lib/store-cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

    const { searchParams } = new URL(req.url);
    const cacheKey = getStorefrontCacheKey("bundles", searchParams);
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

    const search = searchParams.get("search")?.trim() || "";
    const isFeaturedParam = searchParams.get("isFeatured");
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === "true" : undefined;
    const sortBy = (searchParams.get("sortBy") || "sortOrder") as "name" | "price" | "discount" | "createdAt" | "sortOrder";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    const bundles = await listBundles({
      status: "active",
      search: search || undefined,
      isFeatured,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    const result = { success: true, bundles, count: bundles.length };
    setStorefrontCache(cacheKey, result, 30 * 1000);

    const res = NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
        "Cloudflare-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
        "CF-Cache-Status": "MISS",
        "X-Cache-Status": "MISS",
      },
    });

    putEdgeCache(req, res, 60, 600);

    return res;
  } catch (error) {
    console.error("GET /api/bundles error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}


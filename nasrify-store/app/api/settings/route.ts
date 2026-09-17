import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";
import { getStorefrontCache, setStorefrontCache, getStorefrontCacheKey } from "@/lib/store-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings
 * Public endpoint returning current store branding, navigation, and contact settings.
 * Micro-cached in-memory for 30s; cached at Cloudflare edge for 60s with stale-while-revalidate.
 */
export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

    const cacheKey = getStorefrontCacheKey("settings", req.nextUrl.searchParams);
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

    const settings = await getStoreSettings();
    const result = {
      success: true,
      data: settings,
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
    console.error("[GET /api/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load store settings." },
      { status: 500 }
    );
  }
}

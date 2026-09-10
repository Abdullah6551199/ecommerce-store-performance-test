import { NextRequest, NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings
 * Public endpoint returning current store branding, navigation, and contact settings.
 * Cached at Cloudflare edge for 60s with stale-while-revalidate.
 */
export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

    const settings = await getStoreSettings();
    const res = NextResponse.json(
      {
        success: true,
        data: settings,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "Cloudflare-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "CF-Cache-Status": "MISS",
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

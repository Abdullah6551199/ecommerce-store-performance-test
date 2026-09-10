import { NextRequest, NextResponse } from "next/server";
import { getThemeSettings } from "@/lib/theme";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/appearance
 * Public endpoint returning current store theme, styling tokens, and branding assets.
 * Cached at Cloudflare edge for 60s with stale-while-revalidate.
 */
export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

    const theme = await getThemeSettings();
    const res = NextResponse.json(
      {
        success: true,
        data: theme,
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
    console.error("[GET /api/appearance] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load appearance settings." },
      { status: 500 }
    );
  }
}

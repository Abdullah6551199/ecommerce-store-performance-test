import { NextRequest, NextResponse } from "next/server";
import { listHomepageSections } from "@/lib/homepage";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/homepage/sections
 * Public endpoint returning all active homepage sections ordered by sortOrder.
 * Cached at Cloudflare edge for 60s with stale-while-revalidate.
 */
export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

    const sections = await listHomepageSections({ activeOnly: true });
    const res = NextResponse.json(
      {
        success: true,
        data: sections,
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
    console.error("[GET /api/homepage/sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load homepage sections." },
      { status: 500 }
    );
  }
}

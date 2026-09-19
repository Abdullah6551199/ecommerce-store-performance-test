import { NextRequest, NextResponse } from "next/server";
import { getFeaturedBundles, getBundlesSettings } from "@/apps/bundles/lib/bundles";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const settings = await getBundlesSettings();
    const limit = Math.min(
      8,
      Math.max(1, Number(searchParams.get("limit")) || settings.maxBundlesPerSection || 4)
    );

    const bundles = await getFeaturedBundles(limit);

    return NextResponse.json(
      {
        success: true,
        bundles,
        count: bundles.length,
        badgeText: settings.bundleBadgeText,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/apps/bundles/featured] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured bundles" },
      { status: 500 }
    );
  }
}

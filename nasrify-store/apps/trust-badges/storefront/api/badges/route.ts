import { NextRequest, NextResponse } from "next/server";
import { listTrustBadges } from "@/apps/trust-badges/lib/trust-badges";

export const dynamic = "force-dynamic";

/**
 * GET /api/trust-badges (delegated from app)
 * Public endpoint with 20s micro-cache
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") || undefined;
    const badges = await listTrustBadges({ location, isActiveOnly: true });

    return NextResponse.json(
      { success: true, data: badges },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch trust badges",
      },
      { status: 500 }
    );
  }
}

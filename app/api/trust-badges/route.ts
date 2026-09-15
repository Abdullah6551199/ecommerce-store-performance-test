import { NextRequest, NextResponse } from "next/server";
import { listTrustBadges } from "@/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") || undefined;
    const badges = await listTrustBadges({ location, isActiveOnly: true });

    return NextResponse.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    console.error("GET /api/trust-badges error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trust badges" },
      { status: 500 }
    );
  }
}

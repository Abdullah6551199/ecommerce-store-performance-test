import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getListingRatingSummary } from "@/lib/marketplace/reviews";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const type = (searchParams.get("type") as "app" | "theme") || "theme";

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "listingId query parameter is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const summary = await getListingRatingSummary(db, type, listingId);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch rating summary" },
      { status: 500 }
    );
  }
}

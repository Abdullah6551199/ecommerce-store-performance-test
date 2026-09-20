import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hideReview } from "@/lib/marketplace/reviews";
import { getAuthenticatedMarketplaceUser } from "@/lib/marketplace/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedMarketplaceUser(req);

    if (!user || !user.isTeam) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Nasrify Team access required" },
        { status: 403 }
      );
    }

    const db = getDb();
    const result = await hideReview(db, id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to hide review" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { markHelpful } from "@/lib/marketplace/reviews";
import { getAuthenticatedMarketplaceUser } from "@/lib/marketplace/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedMarketplaceUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to vote" },
        { status: 401 }
      );
    }

    const db = getDb();
    const result = await markHelpful(db, id, user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to submit vote" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      voted: result.voted,
      helpfulCount: result.helpfulCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process vote" },
      { status: 500 }
    );
  }
}

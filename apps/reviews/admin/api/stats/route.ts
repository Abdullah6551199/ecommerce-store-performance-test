import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminGetReviewStats } from "@/apps/reviews/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reviews/stats (or apps/reviews/admin/api/stats)
 * Protected admin route: Returns review moderation metrics.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionToken =
      req.cookies.get("admin_session")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    const admin = await getCurrentAdmin(sessionToken);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const stats = await adminGetReviewStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[GET apps/reviews/admin/api/stats] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load review statistics." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminGetReviewStats } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reviews/stats
 * Returns KPI statistics: Total, Pending, Approved, Rejected, Average Rating
 */
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const stats = await adminGetReviewStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/reviews/stats] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review statistics." },
      { status: 500 }
    );
  }
}

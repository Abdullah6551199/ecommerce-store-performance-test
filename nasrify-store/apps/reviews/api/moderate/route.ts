import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminUpdateReview, adminDeleteReview } from "@/apps/reviews/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * POST /apps/reviews/api/moderate
 * Protected admin route: Moderate a review status, add administrative reply, or delete.
 */
export async function POST(req: NextRequest) {
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

    const body = (await req.json()) as any;
    const { reviewId, action, status, reply, reason } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Missing reviewId." },
        { status: 400 }
      );
    }

    if (action === "delete") {
      const deleted = await adminDeleteReview(reviewId);
      return NextResponse.json({
        success: deleted,
        data: { id: reviewId, deleted },
      });
    }

    const updates: {
      status?: "pending" | "approved" | "rejected";
      adminReply?: string | null;
      reason?: string;
    } = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      updates.status = status;
    }
    if (typeof reply === "string") {
      updates.adminReply = reply;
    }
    if (typeof reason === "string") {
      updates.reason = reason;
    }

    const updated = await adminUpdateReview(reviewId, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Review not found or no valid update provided." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[POST apps/reviews/api/moderate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to moderate review." },
      { status: 500 }
    );
  }
}

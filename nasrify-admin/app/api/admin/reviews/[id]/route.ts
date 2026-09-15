import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminGetReview, adminUpdateReview, adminDeleteReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/reviews/[id]
 * Fetch single review with images
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const review = await adminGetReview(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error("[GET /api/admin/reviews/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/reviews/[id]
 * Update review status (approve/reject) or set admin reply
 */
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = (await req.json()) as any;
    const { status, adminReply, reason } = body;

    const updated = await adminUpdateReview(id, {
      status,
      adminReply,
      reason,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Review not found or update failed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { review: updated },
    });
  } catch (error) {
    console.error("[PUT /api/admin/reviews/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete a review and associated records
 */
export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const deleted = await adminDeleteReview(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Review not found or deletion failed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, message: "Review deleted successfully." },
    });
  } catch (error) {
    console.error("[DELETE /api/admin/reviews/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review." },
      { status: 500 }
    );
  }
}

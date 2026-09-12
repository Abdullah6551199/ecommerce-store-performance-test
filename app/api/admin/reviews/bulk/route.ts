import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminBulkReviewAction } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reviews/bulk
 * Perform bulk moderation actions: 'approve' | 'reject' | 'delete'
 */
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as any;
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Array of review 'ids' is required." },
        { status: 400 }
      );
    }

    if (!["approve", "reject", "delete"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be 'approve', 'reject', or 'delete'." },
        { status: 400 }
      );
    }

    const result = await adminBulkReviewAction(ids, action);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[POST /api/admin/reviews/bulk] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk review action." },
      { status: 500 }
    );
  }
}

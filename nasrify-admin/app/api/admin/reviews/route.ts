import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminListReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reviews
 * List reviews with status filters, search, and pagination
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

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as any) || "all";
    const search = searchParams.get("search") || "";
    const productId = searchParams.get("productId") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const result = await adminListReviews({
      status,
      search,
      productId,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[GET /api/admin/reviews] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list reviews." },
      { status: 500 }
    );
  }
}

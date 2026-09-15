import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/customers
 * Protected admin endpoint returning registered & guest customer profiles.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const type = (searchParams.get("type") || "all") as "all" | "registered" | "guest";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    const result = await getCustomers({ search, type, limit, page });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[GET /api/admin/customers] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load customers.",
      },
      { status: 500 }
    );
  }
}

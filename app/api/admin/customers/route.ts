import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/customers
 * Protected admin endpoint returning aggregated customer profiles from D1 orders.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    const result = await getCustomers({ search, limit, page });

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

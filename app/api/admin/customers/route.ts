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
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const result = await getCustomers({ search, limit });

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

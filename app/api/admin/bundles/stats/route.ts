import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getBundleStats } from "@/lib/bundles";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const stats = await getBundleStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("GET /api/admin/bundles/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundle stats" },
      { status: 500 }
    );
  }
}

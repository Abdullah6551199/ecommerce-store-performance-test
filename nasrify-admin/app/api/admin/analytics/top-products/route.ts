import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getTopProducts, AnalyticsPeriod } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") as AnalyticsPeriod) || "last_30_days";
    const limit = Number(searchParams.get("limit")) || 10;

    const data = await getTopProducts(period, limit);
    return NextResponse.json({ success: true, data: data.products });
  } catch (err) {
    console.error("[Top Products API Error]:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getMonthlyPatterns } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await getMonthlyPatterns();
    return NextResponse.json({ success: true, data: data.dates });
  } catch (err) {
    console.error("[Monthly Patterns API Error]:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

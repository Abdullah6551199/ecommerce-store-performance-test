import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getWeeklyPatterns } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await getWeeklyPatterns();
    return NextResponse.json({ success: true, data: data.patterns });
  } catch (err) {
    console.error("[Weekly Patterns API Error]:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getAdminBroadcastOverviewStats } from "@/lib/broadcasts";

export const dynamic = "force-dynamic";

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

    const stats = await getAdminBroadcastOverviewStats();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    console.error("[GET /api/admin/broadcasts/stats] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch broadcast stats" },
      { status: 500 }
    );
  }
}

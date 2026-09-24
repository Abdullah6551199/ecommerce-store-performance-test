import { NextRequest, NextResponse } from "next/server";
import { getEditorHistory } from "@/lib/themes/theme-editor-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const history = await getEditorHistory(isNaN(limit) ? 20 : limit);
    return NextResponse.json({ success: true, history });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load history" },
      { status: 500 }
    );
  }
}

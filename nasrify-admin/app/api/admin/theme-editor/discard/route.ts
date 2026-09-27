import { NextRequest, NextResponse } from "next/server";
import { discardThemeDraft } from "@/lib/themes/theme-editor-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = (await req.json().catch(() => ({}))) as any;
    const pageType =
      rawBody.page_type ||
      rawBody.pageType ||
      req.nextUrl.searchParams.get("page") ||
      "homepage";

    const resetDraft = await discardThemeDraft(pageType);
    return NextResponse.json({ success: true, ...resetDraft });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to discard draft" },
      { status: 500 }
    );
  }
}

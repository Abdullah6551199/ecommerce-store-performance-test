import { NextResponse } from "next/server";
import { discardThemeDraft } from "@/lib/themes/theme-editor-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const resetDraft = await discardThemeDraft();
    return NextResponse.json({ success: true, ...resetDraft });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to discard draft" },
      { status: 500 }
    );
  }
}

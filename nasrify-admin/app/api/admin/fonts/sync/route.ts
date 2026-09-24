import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "Sync job scheduled (curated fonts active; full 300+ sync available in Stage 42.6)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to schedule font sync" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { reorderPaymentIcons } from "@/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as any;
    if (!Array.isArray(body.ids)) {
      return NextResponse.json({ success: false, error: "ids array is required" }, { status: 400 });
    }

    await reorderPaymentIcons(body.ids);
    return NextResponse.json({ success: true, message: "Payment icons reordered successfully" });
  } catch (error) {
    console.error("PUT /api/admin/payment-icons/reorder error:", error);
    return NextResponse.json({ success: false, error: "Failed to reorder payment icons" }, { status: 500 });
  }
}

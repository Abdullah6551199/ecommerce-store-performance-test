import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteTrustBadge, deletePaymentIcon } from "@/apps/trust-badges/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let type = searchParams.get("type") || "badge";

    if (!id) {
      const body = (await req.json().catch(() => ({}))) as any;
      id = body?.id;
      type = body?.type || type;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required." },
        { status: 400 }
      );
    }

    if (type === "payment-icon") {
      const deleted = await deletePaymentIcon(id);
      return NextResponse.json({ success: deleted });
    }

    const deleted = await deleteTrustBadge(id);
    return NextResponse.json({ success: deleted });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete item",
      },
      { status: 500 }
    );
  }
}

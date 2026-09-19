import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  updateTrustBadge,
  updatePaymentIcon,
  reorderTrustBadges,
  reorderPaymentIcons,
} from "@/apps/trust-badges/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const action = body.action || "update";
    const type = body.type || "badge";

    if (action === "reorder") {
      if (!Array.isArray(body.ids)) {
        return NextResponse.json(
          { success: false, error: "Array of IDs required for reorder." },
          { status: 400 }
        );
      }
      if (type === "payment-icon") {
        await reorderPaymentIcons(body.ids);
      } else {
        await reorderTrustBadges(body.ids);
      }
      return NextResponse.json({ success: true, message: "Reordered successfully" });
    }

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Item ID is required." },
        { status: 400 }
      );
    }

    if (type === "payment-icon") {
      const updated = await updatePaymentIcon(body.id, {
        name: body.name,
        iconSvg: body.iconSvg,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const updated = await updateTrustBadge(body.id, {
      title: body.title,
      icon: body.icon,
      description: body.description,
      location: body.location,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update item",
      },
      { status: 500 }
    );
  }
}

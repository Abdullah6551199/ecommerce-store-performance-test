import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { createTrustBadge, createPaymentIcon } from "@/apps/trust-badges/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    const type = body.type || "badge";

    if (type === "payment-icon") {
      if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Payment icon name is required." },
          { status: 400 }
        );
      }
      const icon = await createPaymentIcon({
        name: body.name.trim(),
        iconSvg: body.iconSvg,
        sortOrder: body.sortOrder,
        isActive: body.isActive ?? true,
      });
      return NextResponse.json({ success: true, data: icon });
    }

    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Badge title is required." },
        { status: 400 }
      );
    }
    if (!body.icon || typeof body.icon !== "string" || body.icon.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Badge icon name is required." },
        { status: 400 }
      );
    }

    const badge = await createTrustBadge({
      title: body.title.trim(),
      icon: body.icon.trim(),
      description: body.description,
      location: body.location || "all",
      sortOrder: body.sortOrder,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ success: true, data: badge });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create item",
      },
      { status: 500 }
    );
  }
}

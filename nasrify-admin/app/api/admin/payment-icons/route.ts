import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listPaymentIcons, createPaymentIcon } from "@/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const icons = await listPaymentIcons(false);
    return NextResponse.json({ success: true, data: icons, count: icons.length });
  } catch (error) {
    console.error("GET /api/admin/payment-icons error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payment icons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as any;
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const icon = await createPaymentIcon({
      name: body.name,
      iconSvg: body.iconSvg || null,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: icon }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/payment-icons error:", error);
    return NextResponse.json({ success: false, error: "Failed to create payment icon" }, { status: 500 });
  }
}

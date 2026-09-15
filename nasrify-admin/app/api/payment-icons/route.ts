import { NextRequest, NextResponse } from "next/server";
import { listPaymentIcons } from "@/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const icons = await listPaymentIcons(true);
    return NextResponse.json({
      success: true,
      data: icons,
      count: icons.length,
    });
  } catch (error) {
    console.error("GET /api/payment-icons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment icons" },
      { status: 500 }
    );
  }
}

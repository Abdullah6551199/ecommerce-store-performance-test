import { NextRequest, NextResponse } from "next/server";
import { getAvailableCoupons, findBestCoupon, type CartItemValidationInput } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subtotal = Number(searchParams.get("subtotal") || 0);
    const email = searchParams.get("email") || null;

    const available = await getAvailableCoupons();

    let bestCoupon = null;
    let bestDiscount = 0;
    let suggestion = null;

    if (subtotal > 0) {
      const best = await findBestCoupon([], subtotal, email);
      bestCoupon = best.bestCoupon;
      bestDiscount = best.discount;
      suggestion = best.suggestion;
    }

    return NextResponse.json({
      success: true,
      coupons: available,
      bestCoupon,
      bestDiscount,
      suggestion,
    });
  } catch (error) {
    console.error("GET /api/coupons/available error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch coupons",
        coupons: [],
      },
      { status: 500 }
    );
  }
}

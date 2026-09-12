import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, coupons, couponUsages } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const db = getDb();
    if (db) {
      // 1. Total Coupons & Active Coupons
      const allCoupons = await db.select().from(coupons);
      const totalCoupons = allCoupons.length;
      const activeCoupons = allCoupons.filter((c) => c.isActive).length;

      // 2. Total Discounts Given from coupon_usages
      const discountSum = await db
        .select({
          total: sql<number>`COALESCE(SUM(${couponUsages.discountAmount}), 0)`,
        })
        .from(couponUsages);
      const totalDiscountsGiven = Math.round((Number(discountSum[0]?.total || 0)) * 100) / 100;

      // 3. Most Used Coupon
      let mostUsedCoupon: { code: string; count: number } | null = null;
      if (allCoupons.length > 0) {
        const sorted = [...allCoupons].sort((a, b) => b.usedCount - a.usedCount);
        if (sorted[0] && sorted[0].usedCount > 0) {
          mostUsedCoupon = {
            code: sorted[0].code,
            count: sorted[0].usedCount,
          };
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          totalCoupons,
          activeCoupons,
          totalDiscountsGiven,
          mostUsedCoupon: mostUsedCoupon || { code: "None", count: 0 },
        },
      });
    }

    // Memory fallback
    const totalCoupons = memoryCoupons.length;
    const activeCoupons = memoryCoupons.filter((c) => c.isActive).length;
    const sorted = [...memoryCoupons].sort((a, b) => b.usedCount - a.usedCount);

    return NextResponse.json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        totalDiscountsGiven: 0,
        mostUsedCoupon: sorted[0] ? { code: sorted[0].code, count: sorted[0].usedCount } : { code: "None", count: 0 },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/coupons/stats error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

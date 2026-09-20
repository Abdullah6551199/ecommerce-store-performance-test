import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, coupons, couponUsages } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons, invalidateCouponsCache } from "@/apps/coupons/lib/coupons";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = (await req.json().catch(() => ({}))) as Record<string, any>;
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID is required" }, { status: 400 });
    }

    const db = getDb();
    if (db) {
      const existing = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.id, id)).limit(1);
      if (existing.length === 0) {
        return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
      }

      await db.delete(couponUsages).where(eq(couponUsages.couponId, id));
      await db.delete(coupons).where(eq(coupons.id, id));
      invalidateCouponsCache();

      return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
    }

    const idx = memoryCoupons.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    memoryCoupons.splice(idx, 1);
    invalidateCouponsCache();

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

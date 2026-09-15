import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, coupons, type CouponRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
      }

      const source = rows[0];
      let newCode = `${source.code}-COPY`;
      let counter = 1;

      // Ensure unique code
      while (true) {
        const existing = await db
          .select({ id: coupons.id })
          .from(coupons)
          .where(sql`UPPER(${coupons.code}) = ${newCode}`)
          .limit(1);
        if (existing.length === 0) break;
        counter++;
        newCode = `${source.code}-COPY${counter}`;
      }

      const newId = `coup_${crypto.randomUUID().slice(0, 8)}`;

      await db.insert(coupons).values({
        id: newId,
        tenantId: source.tenantId,
        code: newCode,
        description: source.description ? `${source.description} (Copy)` : "Copied Coupon",
        type: source.type,
        value: source.value,
        minOrderValue: source.minOrderValue,
        maxDiscount: source.maxDiscount,
        applyTo: source.applyTo,
        applyToId: source.applyToId,
        buyQuantity: source.buyQuantity,
        getQuantity: source.getQuantity,
        usageLimit: source.usageLimit,
        usedCount: 0,
        perCustomerLimit: source.perCustomerLimit,
        startDate: source.startDate,
        endDate: source.endDate,
        firstOrderOnly: source.firstOrderOnly,
        isVisible: source.isVisible,
        isAutoApply: source.isAutoApply,
        isFeatured: source.isFeatured,
        isActive: false, // Default duplicated coupon to inactive for safety
        createdAt: now,
        updatedAt: now,
      });

      const [duplicated] = await db.select().from(coupons).where(eq(coupons.id, newId)).limit(1);
      return NextResponse.json({ success: true, data: duplicated });
    }

    // Memory fallback
    const source = memoryCoupons.find((c) => c.id === id);
    if (!source) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    let newCode = `${source.code}-COPY`;
    let counter = 1;
    while (memoryCoupons.some((c) => c.code === newCode)) {
      counter++;
      newCode = `${source.code}-COPY${counter}`;
    }

    const newId = `coup_${crypto.randomUUID().slice(0, 8)}`;
    const duplicated: CouponRecord = {
      ...source,
      id: newId,
      code: newCode,
      description: source.description ? `${source.description} (Copy)` : "Copied Coupon",
      usedCount: 0,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    };
    memoryCoupons.unshift(duplicated);

    return NextResponse.json({ success: true, data: duplicated });
  } catch (error) {
    console.error("POST /api/admin/coupons/[id]/duplicate error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to duplicate coupon" },
      { status: 500 }
    );
  }
}

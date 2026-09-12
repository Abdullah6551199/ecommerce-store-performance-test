import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql, and } from "drizzle-orm";
import { getDb, coupons, couponUsages, type CouponRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

const updateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[A-Z0-9_\-]+$/i)
    .optional(),
  description: z.string().trim().nullable().optional(),
  type: z
    .enum([
      "percentage",
      "fixed",
      "free_shipping",
      "buy_x_get_y",
      "category",
      "product",
      "min_order",
      "first_order",
    ])
    .optional(),
  value: z.coerce.number().min(0).optional(),
  minOrderValue: z.coerce.number().min(0).nullable().optional(),
  maxDiscount: z.coerce.number().min(0).nullable().optional(),
  applyTo: z.enum(["all", "category", "product"]).optional(),
  applyToId: z.string().trim().nullable().optional(),
  buyQuantity: z.coerce.number().int().min(1).nullable().optional(),
  getQuantity: z.coerce.number().int().min(1).nullable().optional(),
  usageLimit: z.coerce.number().int().min(1).nullable().optional(),
  perCustomerLimit: z.coerce.number().int().min(1).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  firstOrderOnly: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  isAutoApply: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
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

    if (db) {
      const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: rows[0] });
    }

    const found = memoryCoupons.find((c) => c.id === id);
    if (!found) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: found });
  } catch (error) {
    console.error("GET /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();
    const db = getDb();

    if (db) {
      // If code is changing, check uniqueness
      if (data.code) {
        const normalized = data.code.toUpperCase();
        const existing = await db
          .select({ id: coupons.id })
          .from(coupons)
          .where(and(sql`UPPER(${coupons.code}) = ${normalized}`, sql`${coupons.id} != ${id}`))
          .limit(1);

        if (existing.length > 0) {
          return NextResponse.json(
            { success: false, error: `Coupon code "${normalized}" is already taken.` },
            { status: 409 }
          );
        }
      }

      const updatePayload: Record<string, any> = {
        updatedAt: now,
      };

      if (data.code !== undefined) updatePayload.code = data.code.toUpperCase();
      if (data.description !== undefined) updatePayload.description = data.description || null;
      if (data.type !== undefined) updatePayload.type = data.type;
      if (data.value !== undefined) updatePayload.value = data.value;
      if (data.minOrderValue !== undefined) updatePayload.minOrderValue = data.minOrderValue;
      if (data.maxDiscount !== undefined) updatePayload.maxDiscount = data.maxDiscount;
      if (data.applyTo !== undefined) updatePayload.applyTo = data.applyTo;
      if (data.applyToId !== undefined) updatePayload.applyToId = data.applyToId || null;
      if (data.buyQuantity !== undefined) updatePayload.buyQuantity = data.buyQuantity;
      if (data.getQuantity !== undefined) updatePayload.getQuantity = data.getQuantity;
      if (data.usageLimit !== undefined) updatePayload.usageLimit = data.usageLimit;
      if (data.perCustomerLimit !== undefined) updatePayload.perCustomerLimit = data.perCustomerLimit;
      if (data.startDate !== undefined) updatePayload.startDate = data.startDate || null;
      if (data.endDate !== undefined) updatePayload.endDate = data.endDate || null;
      if (data.firstOrderOnly !== undefined) updatePayload.firstOrderOnly = data.firstOrderOnly;
      if (data.isVisible !== undefined) updatePayload.isVisible = data.isVisible;
      if (data.isAutoApply !== undefined) updatePayload.isAutoApply = data.isAutoApply;
      if (data.isFeatured !== undefined) updatePayload.isFeatured = data.isFeatured;
      if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

      await db.update(coupons).set(updatePayload).where(eq(coupons.id, id));

      const [updated] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: updated });
    }

    // Memory fallback
    const idx = memoryCoupons.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    const current = memoryCoupons[idx];
    const updated: CouponRecord = {
      ...current,
      ...data,
      code: data.code ? data.code.toUpperCase() : current.code,
      updatedAt: now,
    };
    memoryCoupons[idx] = updated;

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    if (db) {
      await db.delete(couponUsages).where(eq(couponUsages.couponId, id));
      await db.delete(coupons).where(eq(coupons.id, id));
      return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
    }

    const idx = memoryCoupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      memoryCoupons.splice(idx, 1);
    }

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

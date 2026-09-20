import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { getDb, coupons, type CouponRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons, invalidateCouponsCache } from "@/apps/coupons/lib/coupons";

export const dynamic = "force-dynamic";

const updateCouponSchema = z.object({
  id: z.string().min(1, "Coupon ID is required"),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code cannot exceed 50 characters")
    .regex(/^[A-Z0-9_\-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores")
    .optional(),
  description: z.string().trim().optional().nullable(),
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
  value: z.coerce.number().min(0, "Value cannot be negative").optional(),
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

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    if (queryId && !body.id) body.id = queryId;

    const parseResult = updateCouponSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid update data",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { id, ...updates } = parseResult.data;
    const db = getDb();
    const now = new Date().toISOString();

    if (updates.code) {
      const normalized = updates.code.toUpperCase();
      if (db) {
        const dups = await db
          .select({ id: coupons.id })
          .from(coupons)
          .where(and(sql`UPPER(${coupons.code}) = ${normalized}`, sql`${coupons.id} != ${id}`))
          .limit(1);
        if (dups.length > 0) {
          return NextResponse.json(
            { success: false, error: `Another coupon with code "${normalized}" already exists.` },
            { status: 409 }
          );
        }
      }
    }

    if (db) {
      const existing = await db
        .select({ id: coupons.id })
        .from(coupons)
        .where(eq(coupons.id, id))
        .limit(1);

      if (existing.length === 0) {
        return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
      }

      const updatePayload: Partial<CouponRecord> = {
        updatedAt: now,
      };

      if (updates.code !== undefined) updatePayload.code = updates.code.toUpperCase();
      if (updates.description !== undefined) updatePayload.description = updates.description || null;
      if (updates.type !== undefined) updatePayload.type = updates.type;
      if (updates.value !== undefined) updatePayload.value = updates.value;
      if (updates.minOrderValue !== undefined) updatePayload.minOrderValue = updates.minOrderValue ?? null;
      if (updates.maxDiscount !== undefined) updatePayload.maxDiscount = updates.maxDiscount ?? null;
      if (updates.applyTo !== undefined) updatePayload.applyTo = updates.applyTo;
      if (updates.applyToId !== undefined) updatePayload.applyToId = updates.applyToId || null;
      if (updates.buyQuantity !== undefined) updatePayload.buyQuantity = updates.buyQuantity ?? null;
      if (updates.getQuantity !== undefined) updatePayload.getQuantity = updates.getQuantity ?? null;
      if (updates.usageLimit !== undefined) updatePayload.usageLimit = updates.usageLimit ?? null;
      if (updates.perCustomerLimit !== undefined) updatePayload.perCustomerLimit = updates.perCustomerLimit;
      if (updates.startDate !== undefined) updatePayload.startDate = updates.startDate || null;
      if (updates.endDate !== undefined) updatePayload.endDate = updates.endDate || null;
      if (updates.firstOrderOnly !== undefined) updatePayload.firstOrderOnly = updates.firstOrderOnly;
      if (updates.isVisible !== undefined) updatePayload.isVisible = updates.isVisible;
      if (updates.isAutoApply !== undefined) updatePayload.isAutoApply = updates.isAutoApply;
      if (updates.isFeatured !== undefined) updatePayload.isFeatured = updates.isFeatured;
      if (updates.isActive !== undefined) updatePayload.isActive = updates.isActive;

      await db.update(coupons).set(updatePayload).where(eq(coupons.id, id));
      invalidateCouponsCache();

      const [updated] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
      return NextResponse.json({ success: true, data: updated });
    }

    const idx = memoryCoupons.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    const current = memoryCoupons[idx];
    const updated: CouponRecord = {
      ...current,
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : current.code,
      updatedAt: now,
    };
    memoryCoupons[idx] = updated;
    invalidateCouponsCache();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

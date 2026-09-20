import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { getDb, coupons, type CouponRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons, invalidateCouponsCache } from "@/apps/coupons/lib/coupons";

export const dynamic = "force-dynamic";

const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code cannot exceed 50 characters")
    .regex(/^[A-Z0-9_\-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores"),
  description: z.string().trim().optional().or(z.literal("")),
  type: z.enum([
    "percentage",
    "fixed",
    "free_shipping",
    "buy_x_get_y",
    "category",
    "product",
    "min_order",
    "first_order",
  ]),
  value: z.coerce.number().min(0, "Value cannot be negative"),
  minOrderValue: z.coerce.number().min(0).nullable().optional(),
  maxDiscount: z.coerce.number().min(0).nullable().optional(),
  applyTo: z.enum(["all", "category", "product"]).default("all"),
  applyToId: z.string().trim().nullable().optional(),
  buyQuantity: z.coerce.number().int().min(1).nullable().optional(),
  getQuantity: z.coerce.number().int().min(1).nullable().optional(),
  usageLimit: z.coerce.number().int().min(1).nullable().optional(),
  perCustomerLimit: z.coerce.number().int().min(1).default(1),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  firstOrderOnly: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  isAutoApply: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = createCouponSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid coupon data",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const normalizedCode = data.code.toUpperCase();
    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      const existing = await db
        .select({ id: coupons.id })
        .from(coupons)
        .where(sql`UPPER(${coupons.code}) = ${normalizedCode}`)
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, error: `Coupon with code "${normalizedCode}" already exists.` },
          { status: 409 }
        );
      }

      const id = "coup_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      const newCoupon: CouponRecord = {
        id,
        tenantId: null,
        code: normalizedCode,
        description: data.description || null,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue ?? null,
        maxDiscount: data.maxDiscount ?? null,
        applyTo: data.applyTo,
        applyToId: data.applyToId || null,
        buyQuantity: data.buyQuantity ?? null,
        getQuantity: data.getQuantity ?? null,
        usageLimit: data.usageLimit ?? null,
        usedCount: 0,
        perCustomerLimit: data.perCustomerLimit,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        firstOrderOnly: data.firstOrderOnly,
        isVisible: data.isVisible,
        isAutoApply: data.isAutoApply,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(coupons).values(newCoupon);
      invalidateCouponsCache();

      return NextResponse.json({ success: true, data: newCoupon }, { status: 201 });
    }

    const dup = memoryCoupons.find((c) => c.code.toUpperCase() === normalizedCode);
    if (dup) {
      return NextResponse.json(
        { success: false, error: `Coupon with code "${normalizedCode}" already exists.` },
        { status: 409 }
      );
    }

    const id = "coup_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const newCoupon: CouponRecord = {
      id,
      tenantId: null,
      code: normalizedCode,
      description: data.description || null,
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue ?? null,
      maxDiscount: data.maxDiscount ?? null,
      applyTo: data.applyTo,
      applyToId: data.applyToId || null,
      buyQuantity: data.buyQuantity ?? null,
      getQuantity: data.getQuantity ?? null,
      usageLimit: data.usageLimit ?? null,
      usedCount: 0,
      perCustomerLimit: data.perCustomerLimit,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      firstOrderOnly: data.firstOrderOnly,
      isVisible: data.isVisible,
      isAutoApply: data.isAutoApply,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      createdAt: now,
      updatedAt: now,
    };

    memoryCoupons.unshift(newCoupon);
    invalidateCouponsCache();

    return NextResponse.json({ success: true, data: newCoupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

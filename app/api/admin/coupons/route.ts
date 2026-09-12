import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc, asc, and, sql, like, or } from "drizzle-orm";
import { getDb, coupons, type CouponRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryCoupons } from "@/lib/coupons";

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

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toUpperCase() || "";
    const status = searchParams.get("status")?.trim().toLowerCase() || "all";
    const sort = searchParams.get("sort") || "createdAt_desc";

    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      let query = db.select().from(coupons).$dynamic();
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            like(sql`UPPER(${coupons.code})`, `%${search}%`),
            like(sql`UPPER(${coupons.description})`, `%${search}%`)
          )
        );
      }

      if (status === "active") {
        conditions.push(
          and(
            eq(coupons.isActive, true),
            sql`(${coupons.startDate} IS NULL OR ${coupons.startDate} <= ${now})`,
            sql`(${coupons.endDate} IS NULL OR ${coupons.endDate} >= ${now})`
          )
        );
      } else if (status === "expired") {
        conditions.push(sql`${coupons.endDate} IS NOT NULL AND ${coupons.endDate} < ${now}`);
      } else if (status === "scheduled") {
        conditions.push(sql`${coupons.startDate} IS NOT NULL AND ${coupons.startDate} > ${now}`);
      } else if (status === "inactive") {
        conditions.push(eq(coupons.isActive, false));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      if (sort === "createdAt_asc") {
        query = query.orderBy(asc(coupons.createdAt));
      } else if (sort === "expiry_asc") {
        query = query.orderBy(asc(coupons.endDate));
      } else if (sort === "usage_desc") {
        query = query.orderBy(desc(coupons.usedCount));
      } else {
        query = query.orderBy(desc(coupons.createdAt));
      }

      const rows = await query;
      return NextResponse.json({ success: true, data: rows });
    }

    // Memory fallback
    let filtered = [...memoryCoupons];
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.code.toUpperCase().includes(search) ||
          c.description?.toUpperCase().includes(search)
      );
    }
    if (status === "active") {
      filtered = filtered.filter((c) => c.isActive);
    } else if (status === "inactive") {
      filtered = filtered.filter((c) => !c.isActive);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid coupon data" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedCode = data.code.toUpperCase();
    const id = `coup_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const db = getDb();
    if (db) {
      // Check code uniqueness
      const existing = await db
        .select({ id: coupons.id })
        .from(coupons)
        .where(sql`UPPER(${coupons.code}) = ${normalizedCode}`)
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, error: `Coupon code "${normalizedCode}" already exists.` },
          { status: 409 }
        );
      }

      await db.insert(coupons).values({
        id,
        code: normalizedCode,
        description: data.description || null,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue || null,
        maxDiscount: data.maxDiscount || null,
        applyTo: data.applyTo,
        applyToId: data.applyToId || null,
        buyQuantity: data.buyQuantity || null,
        getQuantity: data.getQuantity || null,
        usageLimit: data.usageLimit || null,
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
      });

      const [created] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
      return NextResponse.json({ success: true, data: created });
    }

    // Memory fallback
    if (memoryCoupons.some((c) => c.code.toUpperCase() === normalizedCode)) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${normalizedCode}" already exists.` },
        { status: 409 }
      );
    }

    const newCoupon: CouponRecord = {
      id,
      tenantId: null,
      code: normalizedCode,
      description: data.description || null,
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue || null,
      maxDiscount: data.maxDiscount || null,
      applyTo: data.applyTo,
      applyToId: data.applyToId || null,
      buyQuantity: data.buyQuantity || null,
      getQuantity: data.getQuantity || null,
      usageLimit: data.usageLimit || null,
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

    return NextResponse.json({ success: true, data: newCoupon });
  } catch (error) {
    console.error("POST /api/admin/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create coupon" },
      { status: 500 }
    );
  }
}

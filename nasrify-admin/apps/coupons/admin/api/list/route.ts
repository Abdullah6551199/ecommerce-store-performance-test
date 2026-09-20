import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, coupons } from "@/lib/db";
import { eq, and, or, sql, desc, asc, like } from "drizzle-orm";
import { memoryCoupons } from "@/apps/coupons/lib/coupons";

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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toUpperCase() || "";
    const status = searchParams.get("status")?.trim().toLowerCase() || "all";
    const sort = searchParams.get("sort") || "createdAt_desc";
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));

    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      let query = db
        .select({
          id: coupons.id,
          tenantId: coupons.tenantId,
          code: coupons.code,
          description: coupons.description,
          type: coupons.type,
          value: coupons.value,
          minOrderValue: coupons.minOrderValue,
          maxDiscount: coupons.maxDiscount,
          applyTo: coupons.applyTo,
          applyToId: coupons.applyToId,
          buyQuantity: coupons.buyQuantity,
          getQuantity: coupons.getQuantity,
          usageLimit: coupons.usageLimit,
          usedCount: coupons.usedCount,
          perCustomerLimit: coupons.perCustomerLimit,
          startDate: coupons.startDate,
          endDate: coupons.endDate,
          firstOrderOnly: coupons.firstOrderOnly,
          isVisible: coupons.isVisible,
          isAutoApply: coupons.isAutoApply,
          isFeatured: coupons.isFeatured,
          isActive: coupons.isActive,
          createdAt: coupons.createdAt,
          updatedAt: coupons.updatedAt,
        })
        .from(coupons)
        .$dynamic();

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

      const rows = await query.limit(limit);
      return NextResponse.json({ success: true, data: rows });
    }

    let filtered = [...memoryCoupons];
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.code.toUpperCase().includes(search) ||
          c.description?.toUpperCase().includes(search)
      );
    }
    if (status === "active") {
      filtered = filtered.filter(
        (c) =>
          c.isActive &&
          (!c.startDate || new Date(c.startDate) <= new Date(now)) &&
          (!c.endDate || new Date(c.endDate) >= new Date(now))
      );
    } else if (status === "expired") {
      filtered = filtered.filter((c) => c.endDate && new Date(c.endDate) < new Date(now));
    } else if (status === "scheduled") {
      filtered = filtered.filter((c) => c.startDate && new Date(c.startDate) > new Date(now));
    } else if (status === "inactive") {
      filtered = filtered.filter((c) => !c.isActive);
    }

    return NextResponse.json({ success: true, data: filtered.slice(0, limit) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

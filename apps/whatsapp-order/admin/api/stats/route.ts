import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, orders } from "@/lib/db";
import { eq, and, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/whatsapp-order/stats
 * Protected route: Returns WhatsApp order metrics for the current month.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({
        success: true,
        stats: {
          totalOrdersThisMonth: 0,
          totalRevenueThisMonth: 0,
          lastOrderTime: null,
        },
      });
    }

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();

    const [metricsRes, latestRes] = await Promise.all([
      db
        .select({
          orderCount: sql<number>`count(*)`,
          revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.source, "whatsapp"),
            sql`${orders.createdAt} >= ${startOfMonth}`
          )
        ),
      db
        .select({
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.source, "whatsapp"))
        .orderBy(desc(orders.createdAt))
        .limit(1),
    ]);

    const stats = {
      totalOrdersThisMonth: Number(metricsRes[0]?.orderCount || 0),
      totalRevenueThisMonth: Number(metricsRes[0]?.revenue || 0),
      lastOrderTime: latestRes[0]?.createdAt || null,
    };

    return NextResponse.json(
      { success: true, stats },
      {
        headers: {
          "Cache-Control": "private, max-age=20",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}

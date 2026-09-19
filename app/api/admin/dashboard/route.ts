import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, products, categories, media, settings, orders } from "@/lib/db";
import { count, and, eq, sql } from "drizzle-orm";
import {
  getAnalyticsKpis,
  getTodaySmartInsights,
} from "@/lib/analytics";
import { getAdminApiCache, setAdminApiCache, getAdminApiCacheKey } from "@/lib/admin-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const cacheKey = getAdminApiCacheKey(admin.id, "/api/admin/dashboard");
  const cachedData = getAdminApiCache<any>(cacheKey);
  if (cachedData) {
    return NextResponse.json(
      { success: true, data: cachedData },
      { headers: { "Cache-Control": "private, no-store", "X-Admin-Cache": "HIT" } }
    );
  }

  const db = getDb();
  let totalProducts = 0;
  let totalCategories = 0;
  let totalMedia = 0;
  let totalSettings = 0;
  let whatsappOrdersThisMonth = 0;

  if (db) {
    try {
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();

      const [prodRes, catRes, mediaRes, setRes, waRes] = await Promise.all([
        db.select({ value: count() }).from(products),
        db.select({ value: count() }).from(categories),
        db.select({ value: count() }).from(media),
        db.select({ value: count() }).from(settings),
        db
          .select({ value: count() })
          .from(orders)
          .where(
            and(
              eq(orders.source, "whatsapp"),
              sql`${orders.createdAt} >= ${startOfMonth}`
            )
          ),
      ]);
      totalProducts = prodRes[0]?.value || 0;
      totalCategories = catRes[0]?.value || 0;
      totalMedia = mediaRes[0]?.value || 0;
      totalSettings = setRes[0]?.value || 0;
      whatsappOrdersThisMonth = waRes[0]?.value || 0;
    } catch (err) {
      console.warn("[Dashboard API] Error querying D1 counts:", err);
    }
  }

  let analyticsKpis: any = null;
  let smartInsights: any[] = [];

  try {
    const [kpiData, insightsData] = await Promise.all([
      getAnalyticsKpis("last_30_days"),
      getTodaySmartInsights(),
    ]);
    analyticsKpis = kpiData;
    smartInsights = insightsData.insights || [];
  } catch (err) {
    console.warn("[Dashboard API] Error querying analytics data:", err);
  }

  const responseData = {
    counts: {
      totalProducts,
      totalCategories,
      totalMedia,
      totalSettings,
      whatsappOrdersThisMonth,
    },
    analyticsKpis,
    smartInsights,
    admin: {
      email: admin.email,
      role: admin.role,
    },
  };

  setAdminApiCache(cacheKey, responseData);

  return NextResponse.json(
    {
      success: true,
      data: responseData,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Admin-Cache": "MISS",
      },
    }
  );
}


import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, products, categories, media, settings } from "@/lib/db";
import { count } from "drizzle-orm";
import {
  getAnalyticsKpis,
  getTodaySmartInsights,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const db = getDb();
  let totalProducts = 0;
  let totalCategories = 0;
  let totalMedia = 0;
  let totalSettings = 0;

  if (db) {
    try {
      const [prodRes, catRes, mediaRes, setRes] = await Promise.all([
        db.select({ value: count() }).from(products),
        db.select({ value: count() }).from(categories),
        db.select({ value: count() }).from(media),
        db.select({ value: count() }).from(settings),
      ]);
      totalProducts = prodRes[0]?.value || 0;
      totalCategories = catRes[0]?.value || 0;
      totalMedia = mediaRes[0]?.value || 0;
      totalSettings = setRes[0]?.value || 0;
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

  return NextResponse.json(
    {
      success: true,
      data: {
        counts: {
          totalProducts,
          totalCategories,
          totalMedia,
          totalSettings,
        },
        analyticsKpis,
        smartInsights,
        admin: {
          email: admin.email,
          role: admin.role,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}

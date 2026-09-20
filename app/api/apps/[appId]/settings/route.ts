import { NextRequest, NextResponse } from "next/server";
import { getDb, installedApps } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getStorefrontCache, setStorefrontCache } from "@/lib/store-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/apps/[appId]/settings
 * Public storefront route: Retrieves cached settings for an installed and enabled app.
 * Adheres to micro-cache and strict column selection rules.
 * Stage 29.6: 3s micro-cache TTL for whatsapp-order to achieve fast sub-5s settings reflection.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    if (!appId) {
      return NextResponse.json(
        { success: false, error: "Missing appId parameter." },
        { status: 400 }
      );
    }

    const isWhatsApp = appId === "whatsapp-order";
    const cacheKey = `app_settings:${appId}`;
    const hasBypassParam = req.nextUrl.searchParams.has("t");

    // Fast in-memory micro-cache lookup for WhatsApp (3s TTL)
    if (isWhatsApp && !hasBypassParam) {
      const cached = getStorefrontCache<Record<string, unknown>>(cacheKey);
      if (cached !== null) {
        return NextResponse.json(
          { success: true, data: cached },
          {
            status: 200,
            headers: {
              "Cache-Control": "public, max-age=3, s-maxage=3, stale-while-revalidate=2",
            },
          }
        );
      }
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database connection unavailable." },
        { status: 500 }
      );
    }

    const rows = await db
      .select({
        id: installedApps.id,
        enabled: installedApps.enabled,
        settings: installedApps.settings,
      })
      .from(installedApps)
      .where(and(eq(installedApps.id, appId), eq(installedApps.enabled, true)))
      .limit(1);

    const cacheHeader = isWhatsApp
      ? "public, max-age=3, s-maxage=3, stale-while-revalidate=2"
      : "no-cache, no-store, max-age=0, must-revalidate";

    if (rows.length === 0) {
      return NextResponse.json(
        { success: true, data: null, message: "App not enabled or installed." },
        {
          status: 200,
          headers: {
            "Cache-Control": cacheHeader,
          },
        }
      );
    }

    const rawSettings = rows[0].settings;
    let parsedSettings: Record<string, unknown> = {};
    if (rawSettings) {
      try {
        parsedSettings =
          typeof rawSettings === "string" ? JSON.parse(rawSettings) : rawSettings;
      } catch {
        parsedSettings = {};
      }
    }

    // Cache in isolate for 3s for WhatsApp
    if (isWhatsApp) {
      setStorefrontCache(cacheKey, parsedSettings, 3000);
    }

    return NextResponse.json(
      { success: true, data: parsedSettings },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheHeader,
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/apps/[appId]/settings] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

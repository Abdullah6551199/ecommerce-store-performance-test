import { NextRequest, NextResponse } from "next/server";
import { getDb, installedApps } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/apps/[appId]/settings
 * Public storefront route: Retrieves cached settings for an installed and enabled app.
 * Adheres to micro-cache and strict column selection rules.
 */
export async function GET(
  _req: NextRequest,
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

    if (rows.length === 0) {
      return NextResponse.json(
        { success: true, data: null, message: "App not enabled or installed." },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=30, s-maxage=30",
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

    return NextResponse.json(
      { success: true, data: parsedSettings },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
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

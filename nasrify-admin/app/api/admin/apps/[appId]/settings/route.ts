import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, installedApps } from "@/lib/db";
import { eq } from "drizzle-orm";
import { invalidateInstalledAppsCache } from "@/lib/apps/installed";
import { invalidateStorefront } from "@/lib/storefront-invalidation";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/apps/[appId]/settings
 * Protected route: Saves settings JSON for an installed app.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const sessionToken =
      req.cookies.get("admin_session")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    const admin = await getCurrentAdmin(sessionToken);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { appId } = await params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid settings payload." },
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

    const existing = await db
      .select()
      .from(installedApps)
      .where(eq(installedApps.id, appId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: `App "${appId}" is not currently installed.` },
        { status: 400 }
      );
    }

    const payload = body as Record<string, any>;
    const settingsToSave =
      payload.settings && typeof payload.settings === "object"
        ? payload.settings
        : payload;

    await db
      .update(installedApps)
      .set({
        settings: JSON.stringify(settingsToSave),
        updatedAt: Date.now(),
      })
      .where(eq(installedApps.id, appId));

    invalidateInstalledAppsCache();
    await invalidateStorefront({ target: "apps" }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: "App settings updated successfully.",
    });
  } catch (error) {
    console.error("[PUT /api/admin/apps/[appId]/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update app settings." },
      { status: 500 }
    );
  }
}

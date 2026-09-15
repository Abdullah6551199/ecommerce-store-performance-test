import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, installedApps, appInstallLogs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { invalidateInstalledAppsCache } from "@/lib/apps/installed";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/apps/uninstall
 * Protected route: Uninstalls an app, logs the action, and preserves all data tables.
 */
export async function POST(req: NextRequest) {
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

    const body = (await req.json().catch(() => null)) as any;
    const appId = body?.appId;

    if (!appId || typeof appId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid appId." },
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

    const now = Date.now();

    // Check if app is installed
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

    // Delete record from installed_apps table
    // DATA SAFETY: NEVER drop app-owned data tables (e.g. app_<id>_*)
    await db.delete(installedApps).where(eq(installedApps.id, appId));

    // Audit log
    await db.insert(appInstallLogs).values({
      appId,
      action: "uninstall",
      performedAt: now,
      performedBy: admin.email,
      notes: "Uninstalled app, preserved all app data tables",
    });

    invalidateInstalledAppsCache();

    return NextResponse.json({
      success: true,
      data: {
        appId,
        status: "uninstalled",
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/apps/uninstall] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to uninstall app." },
      { status: 500 }
    );
  }
}

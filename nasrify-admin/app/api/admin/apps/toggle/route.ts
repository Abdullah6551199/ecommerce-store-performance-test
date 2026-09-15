import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, installedApps, appInstallLogs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { invalidateInstalledAppsCache } from "@/lib/apps/installed";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/apps/toggle
 * Protected route: Enables or disables an installed app.
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
    const enabled = typeof body?.enabled === "boolean" ? body.enabled : null;

    if (!appId || typeof appId !== "string" || enabled === null) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid appId or enabled boolean." },
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

    await db
      .update(installedApps)
      .set({
        enabled,
        updatedAt: now,
      })
      .where(eq(installedApps.id, appId));

    // Audit log
    await db.insert(appInstallLogs).values({
      appId,
      action: enabled ? "enable" : "disable",
      performedAt: now,
      performedBy: admin.email,
      notes: `App status changed to ${enabled ? "enabled" : "disabled"}`,
    });

    invalidateInstalledAppsCache();

    return NextResponse.json({
      success: true,
      data: {
        appId,
        enabled,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/apps/toggle] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle app." },
      { status: 500 }
    );
  }
}

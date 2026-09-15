import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, installedApps, appInstallLogs } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getManifest } from "@/lib/apps/registry";
import { validateManifest } from "@/lib/apps/manifest";
import { validatePermissions } from "@/lib/apps/permissions";
import { invalidateInstalledAppsCache } from "@/lib/apps/installed";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/apps/install
 * Protected route: Installs an app and records an audit log.
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

    const manifest = getManifest(appId);
    if (!manifest) {
      return NextResponse.json(
        { success: false, error: `App "${appId}" not found in available manifests.` },
        { status: 404 }
      );
    }

    const validation = validateManifest(manifest);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: "Manifest validation failed.", details: validation.errors },
        { status: 400 }
      );
    }

    if (!validatePermissions(manifest.permissions)) {
      return NextResponse.json(
        { success: false, error: "Manifest contains invalid permission declarations." },
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

    // Check existing
    const existing = await db
      .select()
      .from(installedApps)
      .where(eq(installedApps.id, appId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing installation
      await db
        .update(installedApps)
        .set({
          version: manifest.version,
          enabled: true,
          updatedAt: now,
          permissions: JSON.stringify(manifest.permissions),
          installedBy: admin.email,
        })
        .where(eq(installedApps.id, appId));
    } else {
      // Insert new installation
      await db.insert(installedApps).values({
        id: appId,
        version: manifest.version,
        enabled: true,
        installedAt: now,
        updatedAt: now,
        permissions: JSON.stringify(manifest.permissions),
        installedBy: admin.email,
      });
    }

    // Log action to app_install_log
    await db.insert(appInstallLogs).values({
      appId,
      action: "install",
      performedAt: now,
      performedBy: admin.email,
      notes: `Installed v${manifest.version}`,
    });

    invalidateInstalledAppsCache();

    return NextResponse.json({
      success: true,
      data: {
        appId,
        version: manifest.version,
        status: "installed",
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/apps/install] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to install app." },
      { status: 500 }
    );
  }
}

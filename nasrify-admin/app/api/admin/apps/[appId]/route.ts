import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, installedApps, appInstallLogs } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { getManifest } from "@/lib/apps/registry";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/apps/[appId]
 * Protected route: Returns details, manifest, and installation audit logs for a single app.
 */
export async function GET(
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
    if (!appId) {
      return NextResponse.json(
        { success: false, error: "Missing appId parameter." },
        { status: 400 }
      );
    }

    const manifest = getManifest(appId);
    if (!manifest) {
      return NextResponse.json(
        { success: false, error: `App "${appId}" not found.` },
        { status: 404 }
      );
    }

    const db = getDb();
    let installed = null;
    let logs: any[] = [];

    if (db) {
      const installedRows = await db
        .select()
        .from(installedApps)
        .where(eq(installedApps.id, appId))
        .limit(1);

      if (installedRows.length > 0) {
        installed = installedRows[0];
      }

      logs = await db
        .select()
        .from(appInstallLogs)
        .where(eq(appInstallLogs.appId, appId))
        .orderBy(desc(appInstallLogs.performedAt))
        .limit(50);
    }

    return NextResponse.json({
      success: true,
      data: {
        manifest,
        installed: !!installed,
        installation: installed,
        logs,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/apps/[appId]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load app details." },
      { status: 500 }
    );
  }
}

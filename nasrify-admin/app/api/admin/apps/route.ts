import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getAllManifests } from "@/lib/apps/registry";
import { getInstalledApps } from "@/lib/apps/installed";
import type { AppSummary } from "@/types/apps";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/apps
 * Protected route: Lists all available apps merged with installation status.
 */
export async function GET(req: NextRequest) {
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

    const manifests = getAllManifests();
    const installed = await getInstalledApps();
    const installedMap = new Map(installed.map((item) => [item.id, item]));

    const apps: AppSummary[] = manifests.map((manifest) => {
      const record = installedMap.get(manifest.id);
      return {
        ...manifest,
        installed: !!record,
        enabled: record ? Boolean(record.enabled) : false,
        installedVersion: record?.version,
        installedAt: record?.installedAt,
        updatedAt: record?.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: apps,
    });
  } catch (error) {
    console.error("[GET /api/admin/apps] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load apps list." },
      { status: 500 }
    );
  }
}

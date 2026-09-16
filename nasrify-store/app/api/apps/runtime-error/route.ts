import { NextRequest, NextResponse } from "next/server";
import { getDb, appInstallLogs } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/apps/runtime-error
 * Logs client-side app crashes into app_install_log with action: "runtime_error"
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    if (!body || !body.appId) {
      return NextResponse.json({ success: false, error: "Missing appId." }, { status: 400 });
    }

    const { appId, extensionPoint, message } = body;
    const db = getDb();

    if (db) {
      await db.insert(appInstallLogs).values({
        appId,
        action: "runtime_error",
        performedAt: Date.now(),
        performedBy: "client_runtime",
        notes: `Crash at ${extensionPoint || "extension"}: ${message || "Unknown error"}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/apps/runtime-error] Error:", err);
    return NextResponse.json({ success: false, error: "Failed to record error log." }, { status: 500 });
  }
}

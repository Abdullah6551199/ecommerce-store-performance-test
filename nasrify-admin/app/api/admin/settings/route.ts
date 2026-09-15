import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getStoreSettings, updateStoreSettings, StoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 * Protected route: Returns current full store settings.
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

    const settings = await getStoreSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("[GET /api/admin/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve store settings." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Protected route: Updates global store settings.
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

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const updated = await updateStoreSettings(body as Partial<StoreSettings>);
    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[POST /api/admin/settings] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update store settings.",
      },
      { status: 500 }
    );
  }
}

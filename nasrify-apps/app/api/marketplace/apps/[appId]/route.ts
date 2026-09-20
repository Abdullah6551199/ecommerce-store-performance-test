import { NextRequest, NextResponse } from "next/server";
import { getListingByAppId } from "@/lib/marketplace/listings";
import { getInstallCount } from "@/lib/marketplace/installs";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    if (!appId) {
      return NextResponse.json({ success: false, error: "App ID is required" }, { status: 400 });
    }

    const app = await getListingByAppId(appId);
    if (!app) {
      return NextResponse.json({ success: false, error: "App not found or not approved" }, { status: 404 });
    }

    const installs = await getInstallCount(app.id);

    return NextResponse.json(
      {
        success: true,
        app: {
          ...app,
          installs,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch app details" },
      { status: 500 }
    );
  }
}

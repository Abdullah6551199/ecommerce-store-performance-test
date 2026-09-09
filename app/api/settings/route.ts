import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings
 * Public endpoint returning current store branding, navigation, and contact settings.
 */
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load store settings." },
      { status: 500 }
    );
  }
}

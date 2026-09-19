import { NextRequest, NextResponse } from "next/server";
import { getCookieConsentSettings } from "@/apps/cookie-consent/lib/cookie-consent";

export const dynamic = "force-dynamic";

/**
 * GET /api/cookie-settings (delegated from app)
 * Public endpoint with 20s micro-cache
 */
export async function GET(_req: NextRequest) {
  try {
    const settings = await getCookieConsentSettings();
    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch cookie settings",
      },
      { status: 500 }
    );
  }
}

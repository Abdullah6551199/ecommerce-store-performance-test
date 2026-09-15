import { NextRequest, NextResponse } from "next/server";
import { getCookieConsentSettings } from "@/lib/cookie-consent";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const settings = await getCookieConsentSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GET /api/cookie-settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cookie settings" },
      { status: 500 }
    );
  }
}

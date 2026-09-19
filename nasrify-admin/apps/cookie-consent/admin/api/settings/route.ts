import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getCookieConsentSettings,
  updateCookieConsentSettings,
} from "@/apps/cookie-consent/lib/cookie-consent";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const settings = await getCookieConsentSettings();
    return NextResponse.json({ success: true, data: settings });
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

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const updated = await updateCookieConsentSettings({
      isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : undefined,
      bannerTitle: body.bannerTitle,
      bannerMessage: body.bannerMessage,
      acceptText: body.acceptText,
      rejectText: body.rejectText,
      customizeText: body.customizeText,
      position: body.position,
      theme: body.theme,
      analyticsEnabled:
        body.analyticsEnabled !== undefined ? Boolean(body.analyticsEnabled) : undefined,
      marketingEnabled:
        body.marketingEnabled !== undefined ? Boolean(body.marketingEnabled) : undefined,
      functionalEnabled:
        body.functionalEnabled !== undefined ? Boolean(body.functionalEnabled) : undefined,
      cookiePolicyContent: body.cookiePolicyContent,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update cookie settings",
      },
      { status: 500 }
    );
  }
}

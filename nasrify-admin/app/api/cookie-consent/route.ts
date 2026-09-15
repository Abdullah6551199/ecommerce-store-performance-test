import { NextRequest, NextResponse } from "next/server";
import { logCookieConsent } from "@/lib/cookie-consent";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    await logCookieConsent({
      necessary: body.necessary !== false,
      analytics: Boolean(body.analytics),
      marketing: Boolean(body.marketing),
      functional: Boolean(body.functional),
      timestamp: body.timestamp || new Date().toISOString(),
      version: body.version || "v1",
      ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/cookie-consent error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record cookie consent" },
      { status: 500 }
    );
  }
}

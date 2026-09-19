import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getActiveBroadcastForVisitor,
  getBroadcastAppSettings,
  VISITOR_COOKIE_NAME,
  VISITOR_COOKIE_MAX_AGE,
} from "@/apps/broadcast/lib/broadcasts";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const settings = await getBroadcastAppSettings();
    if (!settings.enablePopup) {
      return NextResponse.json({
        success: true,
        broadcast: null,
      });
    }

    const cookieStore = await cookies();
    let visitorId =
      cookieStore.get(VISITOR_COOKIE_NAME)?.value ||
      req.cookies.get(VISITOR_COOKIE_NAME)?.value;

    let isNewVisitor = false;
    if (!visitorId || typeof visitorId !== "string" || visitorId.length < 10) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }

    const currentCustomer = await getCurrentCustomer();
    const broadcast = await getActiveBroadcastForVisitor(
      visitorId,
      currentCustomer?.id || null
    );

    const res = NextResponse.json(
      {
        success: true,
        broadcast,
        settings: {
          popupPosition: settings.popupPosition,
          popupDelaySeconds: settings.popupDelaySeconds,
        },
        visitorId,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=40",
        },
      }
    );

    if (isNewVisitor) {
      res.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }

    return res;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch active broadcast",
      },
      { status: 500 }
    );
  }
}

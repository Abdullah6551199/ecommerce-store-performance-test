import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  recordBroadcastView,
  dismissBroadcast,
  VISITOR_COOKIE_NAME,
} from "@/apps/broadcast/lib/broadcasts";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const { broadcastId, isDismissed } = body;

    if (!broadcastId) {
      return NextResponse.json(
        { success: false, error: "broadcastId is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    let visitorId =
      body.visitorId ||
      cookieStore.get(VISITOR_COOKIE_NAME)?.value ||
      req.cookies.get(VISITOR_COOKIE_NAME)?.value ||
      "anonymous_visitor";

    const customer = await getCurrentCustomer();
    const customerId = customer?.id || null;

    if (isDismissed) {
      await dismissBroadcast(broadcastId, visitorId, customerId);
    } else {
      await recordBroadcastView(broadcastId, visitorId, customerId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to record broadcast view",
      },
      { status: 500 }
    );
  }
}

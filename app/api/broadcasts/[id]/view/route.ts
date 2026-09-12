import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  recordBroadcastView,
  VISITOR_COOKIE_NAME,
  VISITOR_COOKIE_MAX_AGE,
} from "@/lib/broadcasts";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    let visitorId =
      cookieStore.get(VISITOR_COOKIE_NAME)?.value ||
      req.cookies.get(VISITOR_COOKIE_NAME)?.value;

    let isNewVisitor = false;
    if (!visitorId || typeof visitorId !== "string") {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }

    const currentCustomer = await getCurrentCustomer();
    await recordBroadcastView(id, visitorId, currentCustomer?.id || null);

    const res = NextResponse.json({ success: true });
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
    console.error("[POST /api/broadcasts/[id]/view] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record view" },
      { status: 500 }
    );
  }
}

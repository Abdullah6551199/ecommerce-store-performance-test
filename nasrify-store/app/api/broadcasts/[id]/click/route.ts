import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  recordBroadcastClick,
  VISITOR_COOKIE_NAME,
} from "@/lib/broadcasts";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const visitorId =
      cookieStore.get(VISITOR_COOKIE_NAME)?.value ||
      req.cookies.get(VISITOR_COOKIE_NAME)?.value;

    if (visitorId) {
      await recordBroadcastClick(id, visitorId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/broadcasts/[id]/click] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record click" },
      { status: 500 }
    );
  }
}

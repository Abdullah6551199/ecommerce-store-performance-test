import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { updateOrderTrackingStatus } from "@/apps/order-tracking/lib/order-tracking";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as any;
    const { orderId, status, courierName, trackingNumber, estimatedDelivery, statusNotes } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Both orderId and status are required." },
        { status: 400 }
      );
    }

    const updated = await updateOrderTrackingStatus(
      orderId,
      status,
      {
        courierName,
        trackingNumber,
        estimatedDelivery,
        statusNotes,
      },
      { sendNotification: true }
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update order tracking status.",
      },
      { status: 500 }
    );
  }
}

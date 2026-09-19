import { NextRequest, NextResponse } from "next/server";
import { trackOrder, getOrderTrackingSettings } from "@/apps/order-tracking/lib/order-tracking";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("orderId") || searchParams.get("query") || "";
    const contact = searchParams.get("contact") || searchParams.get("email") || searchParams.get("phone") || undefined;

    if (!id.trim()) {
      return NextResponse.json(
        { success: false, error: "Order ID or tracking number is required." },
        { status: 400 }
      );
    }

    const settings = await getOrderTrackingSettings();
    if (!settings.enablePublicTracking) {
      return NextResponse.json(
        { success: false, error: "Public order tracking is currently disabled by store administration." },
        { status: 403 }
      );
    }

    const order = await trackOrder(id.trim(), contact);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found. Please verify your order number or tracking code." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
        settings: {
          showCourierField: settings.showCourierField,
          showTimeline: settings.showTimeline,
          timelineStages: settings.timelineStages,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to retrieve order tracking details.",
      },
      { status: 500 }
    );
  }
}

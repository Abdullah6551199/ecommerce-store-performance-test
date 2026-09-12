import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { markNotificationRead } from "@/lib/customer-notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(_req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const success = await markNotificationRead(customer.id, id);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("[CustomerNotification] Mark read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

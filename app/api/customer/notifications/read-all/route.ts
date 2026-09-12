import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { markAllNotificationsRead } from "@/lib/customer-notifications";

export async function PUT() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await markAllNotificationsRead(customer.id);
    return NextResponse.json({ success, message: "All notifications marked as read" });
  } catch (error) {
    console.error("[CustomerNotifications] Read all error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

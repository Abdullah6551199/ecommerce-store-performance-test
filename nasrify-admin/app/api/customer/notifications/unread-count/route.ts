import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getUnreadNotificationCount } from "@/lib/customer-notifications";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ unreadCount: 0, authenticated: false });
    }

    const unreadCount = await getUnreadNotificationCount(customer.id);
    return NextResponse.json({ unreadCount, authenticated: true });
  } catch (error) {
    console.error("[CustomerNotifications] Unread count error:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}

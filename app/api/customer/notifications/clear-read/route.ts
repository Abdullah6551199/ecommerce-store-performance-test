import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { clearReadNotifications } from "@/lib/customer-notifications";

export async function DELETE() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await clearReadNotifications(customer.id);
    return NextResponse.json({ success, message: "Cleared read notifications" });
  } catch (error) {
    console.error("[CustomerNotifications] Clear read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

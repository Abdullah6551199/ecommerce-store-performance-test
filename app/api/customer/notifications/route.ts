import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getCustomerNotifications } from "@/lib/customer-notifications";

export async function GET(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const filter = (searchParams.get("filter") || "all") as "all" | "unread" | "read";

    const result = await getCustomerNotifications(customer.id, {
      page,
      limit,
      filter,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CustomerNotifications] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

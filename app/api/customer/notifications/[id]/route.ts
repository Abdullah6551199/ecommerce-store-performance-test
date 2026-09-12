import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { deleteNotification } from "@/lib/customer-notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const success = await deleteNotification(customer.id, id);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("[CustomerNotification] Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

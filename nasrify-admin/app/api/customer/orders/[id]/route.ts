import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, orders, orderItems } from "@/lib/db";
import { eq, and, or, sql } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const customerEmail = customer.email.toLowerCase().trim();

    // Query order verifying customer ownership
    const orderRows = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, id),
          or(
            eq(orders.customerId, customer.id),
            sql`LOWER(${orders.email}) = ${customerEmail}`
          )
        )
      )
      .limit(1);

    if (orderRows.length === 0) {
      return NextResponse.json(
        { error: "Order not found or access denied" },
        { status: 404 }
      );
    }

    const order = orderRows[0];

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return NextResponse.json({
      order: {
        ...order,
        items,
      },
    });
  } catch (error) {
    console.error("[CustomerOrder] GET [id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, orders, orderItems } from "@/lib/db";
import { eq, and, or, sql } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, context: RouteContext) {
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

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return NextResponse.json({
      success: true,
      message: `${items.length} items ready for reordering`,
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId || null,
        title: it.productName,
        price: it.unitPrice,
        quantity: it.quantity,
        image: "/images/placeholder.svg",
      })),
    });
  } catch (error) {
    console.error("[CustomerReorder] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

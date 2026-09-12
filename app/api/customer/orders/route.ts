import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, orders, orderItems, type OrderRecord, type OrderItemRecord } from "@/lib/db";
import { eq, or, desc, inArray, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const offset = (page - 1) * limit;

    const db = getDb();
    if (!db) {
      return NextResponse.json({
        orders: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    const customerEmail = customer.email.toLowerCase().trim();
    const whereClause = or(
      eq(orders.customerId, customer.id),
      sql`LOWER(${orders.email}) = ${customerEmail}`
    );

    // 1. Total count
    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause);
    const total = Number(countRes[0]?.count || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // 2. Fetch paginated orders
    const rows = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    if (rows.length === 0) {
      return NextResponse.json({
        orders: [],
        total,
        page,
        totalPages,
      });
    }

    // 3. Fetch items for these orders
    const orderIds = rows.map((r) => r.id);
    const items = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    // Group items by orderId
    const itemsByOrder = new Map<string, OrderItemRecord[]>();
    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) || [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    const formattedOrders = rows.map((order) => {
      const oItems = itemsByOrder.get(order.id) || [];
      const itemCount = oItems.reduce((acc, it) => acc + it.quantity, 0);

      return {
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        shippingFee: order.shipping,
        total: order.total,
        createdAt: order.createdAt,
        itemCount,
        items: oItems,
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("[CustomerOrders] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

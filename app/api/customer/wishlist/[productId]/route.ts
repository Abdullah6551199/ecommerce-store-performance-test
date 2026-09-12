import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customerWishlist } from "@/lib/db";
import { eq, and } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await context.params;
    const db = getDb();

    if (db) {
      await db
        .delete(customerWishlist)
        .where(
          and(
            eq(customerWishlist.customerId, customer.id),
            eq(customerWishlist.productId, productId)
          )
        );
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("[CustomerWishlist] DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

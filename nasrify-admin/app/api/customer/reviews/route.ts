import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, reviews, products } from "@/lib/db";
import { eq, or, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ reviews: [] });
    }

    const customerEmail = customer.email.toLowerCase().trim();

    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productName: products.name,
        productSlug: products.slug,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        status: reviews.status,
        adminReply: reviews.adminReply,
        adminReplyAt: reviews.adminReplyAt,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(
        or(
          eq(reviews.customerId, customer.id),
          sql`LOWER(${reviews.customerEmail}) = ${customerEmail}`
        )
      )
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json({ reviews: rows });
  } catch (error) {
    console.error("[CustomerReviews] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customerWishlist, products } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const addWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    if (db) {
      const items = await db
        .select({
          id: customerWishlist.id,
          productId: customerWishlist.productId,
          createdAt: customerWishlist.createdAt,
          product: {
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            compareAtPrice: products.compareAtPrice,
            stock: products.stockQuantity,
            status: products.status,
          },
        })
        .from(customerWishlist)
        .innerJoin(products, eq(customerWishlist.productId, products.id))
        .where(eq(customerWishlist.customerId, customer.id))
        .orderBy(desc(customerWishlist.createdAt));

      return NextResponse.json({ items });
    }

    return NextResponse.json({ items: [] });
  } catch (error) {
    console.error("[CustomerWishlist] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = addWishlistSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const { productId } = parseResult.data;
    const db = getDb();

    if (db) {
      // Check if already in wishlist
      const existing = await db
        .select({ id: customerWishlist.id })
        .from(customerWishlist)
        .where(
          and(
            eq(customerWishlist.customerId, customer.id),
            eq(customerWishlist.productId, productId)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(customerWishlist).values({
          id: crypto.randomUUID(),
          customerId: customer.id,
          productId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    console.error("[CustomerWishlist] POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

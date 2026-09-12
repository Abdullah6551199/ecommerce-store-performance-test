import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customerWishlist } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const syncSchema = z.object({
  productIds: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = syncSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid sync data" }, { status: 400 });
    }

    const { productIds } = parseResult.data;
    const db = getDb();
    const mergedIds = new Set<string>(productIds);

    if (db) {
      // 1. Get existing DB wishlist
      const dbRows = await db
        .select({ productId: customerWishlist.productId })
        .from(customerWishlist)
        .where(eq(customerWishlist.customerId, customer.id));

      for (const row of dbRows) {
        mergedIds.add(row.productId);
      }

      // 2. Insert any new ones from localStorage into DB
      const existingInDb = new Set(dbRows.map((r) => r.productId));
      const toInsert = productIds.filter((id) => !existingInDb.has(id));

      for (const pid of toInsert) {
        try {
          await db.insert(customerWishlist).values({
            id: crypto.randomUUID(),
            customerId: customer.id,
            productId: pid,
            createdAt: new Date().toISOString(),
          });
        } catch (_err) {
          // Ignore foreign key or unique conflict if invalid product
        }
      }
    }

    return NextResponse.json({
      success: true,
      mergedProductIds: Array.from(mergedIds),
    });
  } catch (error) {
    console.error("[WishlistSync] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, reviews } from "@/lib/db";
import { eq, and, or, sql } from "drizzle-orm";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().optional().nullable(),
  content: z.string().trim().min(5, "Review content must be at least 5 characters").optional(),
});

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const parseResult = updateReviewSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid review data" },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const customerEmail = customer.email.toLowerCase().trim();

    // Check review ownership
    const existing = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.id, id),
          or(
            eq(reviews.customerId, customer.id),
            sql`LOWER(${reviews.customerEmail}) = ${customerEmail}`
          )
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Review not found or access denied" },
        { status: 404 }
      );
    }

    const rev = existing[0];
    if (rev.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending reviews can be edited" },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.rating !== undefined) updateValues.rating = data.rating;
    if (data.title !== undefined) updateValues.title = data.title;
    if (data.content !== undefined) updateValues.content = data.content;

    await db.update(reviews).set(updateValues).where(eq(reviews.id, id));

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("[CustomerReview] PUT Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
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

    const existing = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.id, id),
          or(
            eq(reviews.customerId, customer.id),
            sql`LOWER(${reviews.customerEmail}) = ${customerEmail}`
          )
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Review not found or access denied" },
        { status: 404 }
      );
    }

    await db.delete(reviews).where(eq(reviews.id, id));

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("[CustomerReview] DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

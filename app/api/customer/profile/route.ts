import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().optional().nullable(),
});

export async function PUT(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = profileSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid profile data" },
        { status: 400 }
      );
    }

    const { name, phone } = parseResult.data;
    const db = getDb();
    const nowStr = new Date().toISOString();

    if (db) {
      await db
        .update(customers)
        .set({
          name,
          phone: phone || null,
          updatedAt: nowStr,
        })
        .where(eq(customers.id, customer.id));
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      customer: {
        ...customer,
        name,
        phone: phone || null,
        updatedAt: nowStr,
      },
    });
  } catch (error) {
    console.error("[CustomerProfile] PUT Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

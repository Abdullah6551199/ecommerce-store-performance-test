import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customers } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateMeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().trim().optional().nullable(),
});

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        status: customer.status,
        isVerified: customer.isVerified,
        lastLogin: customer.lastLogin,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    });
  } catch (error) {
    console.error("[AuthMe] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = updateMeSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const { name, phone } = parseResult.data;
    const db = getDb();
    const nowStr = new Date().toISOString();

    const updateFields: { name?: string; phone?: string | null; updatedAt: string } = {
      updatedAt: nowStr,
    };
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone || null;

    if (db) {
      await db
        .update(customers)
        .set(updateFields)
        .where(eq(customers.id, customer.id));
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      customer: {
        ...customer,
        ...updateFields,
      },
    });
  } catch (error) {
    console.error("[AuthMe] PUT Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

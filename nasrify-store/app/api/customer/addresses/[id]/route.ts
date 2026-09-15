import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customerAddresses } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateAddressSchema = z.object({
  label: z.string().trim().optional(),
  fullName: z.string().trim().min(2, "Full name is required").optional(),
  phone: z.string().trim().min(5, "Valid phone number is required").optional(),
  address: z.string().trim().min(5, "Full street address is required").optional(),
  city: z.string().trim().min(2, "City is required").optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const parseResult = updateAddressSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid address data" },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = getDb();

    if (db) {
      // Check ownership
      const existing = await db
        .select()
        .from(customerAddresses)
        .where(
          and(
            eq(customerAddresses.id, id),
            eq(customerAddresses.customerId, customer.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        return NextResponse.json(
          { error: "Address not found or access denied" },
          { status: 404 }
        );
      }

      if (data.isDefault) {
        // Reset all other addresses to non-default
        await db
          .update(customerAddresses)
          .set({ isDefault: false })
          .where(eq(customerAddresses.customerId, customer.id));
      }

      const updateValues: Record<string, unknown> = {};
      if (data.label !== undefined) updateValues.label = data.label;
      if (data.fullName !== undefined) updateValues.fullName = data.fullName;
      if (data.phone !== undefined) updateValues.phone = data.phone;
      if (data.address !== undefined) updateValues.address = data.address;
      if (data.city !== undefined) updateValues.city = data.city;
      if (data.country !== undefined) updateValues.country = data.country;
      if (data.postalCode !== undefined) updateValues.postalCode = data.postalCode;
      if (data.isDefault !== undefined) updateValues.isDefault = data.isDefault;

      await db
        .update(customerAddresses)
        .set(updateValues)
        .where(
          and(
            eq(customerAddresses.id, id),
            eq(customerAddresses.customerId, customer.id)
          )
        );
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
    });
  } catch (error) {
    console.error("[CustomerAddress] PUT Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const db = getDb();

    if (db) {
      const existing = await db
        .select()
        .from(customerAddresses)
        .where(
          and(
            eq(customerAddresses.id, id),
            eq(customerAddresses.customerId, customer.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        return NextResponse.json(
          { error: "Address not found or access denied" },
          { status: 404 }
        );
      }

      await db
        .delete(customerAddresses)
        .where(
          and(
            eq(customerAddresses.id, id),
            eq(customerAddresses.customerId, customer.id)
          )
        );

      // If deleted address was default, make another one default if available
      if (existing[0].isDefault) {
        const remaining = await db
          .select({ id: customerAddresses.id })
          .from(customerAddresses)
          .where(eq(customerAddresses.customerId, customer.id))
          .limit(1);

        if (remaining.length > 0) {
          await db
            .update(customerAddresses)
            .set({ isDefault: true })
            .where(eq(customerAddresses.id, remaining[0].id));
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("[CustomerAddress] DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

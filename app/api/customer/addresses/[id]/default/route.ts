import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customerAddresses } from "@/lib/db";
import { eq, and } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(_req: NextRequest, context: RouteContext) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const db = getDb();

    if (db) {
      // Check address ownership
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

      // Reset all defaults for customer
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customer.id));

      // Set target address as default
      await db
        .update(customerAddresses)
        .set({ isDefault: true })
        .where(
          and(
            eq(customerAddresses.id, id),
            eq(customerAddresses.customerId, customer.id)
          )
        );
    }

    return NextResponse.json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.error("[CustomerAddressDefault] PUT Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getDb, customerAddresses, type CustomerAddressRecord } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().trim().default("Home"),
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(5, "Valid phone number is required"),
  address: z.string().trim().min(5, "Full street address is required"),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().default("Pakistan"),
  postalCode: z.string().trim().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    let addresses: CustomerAddressRecord[] = [];

    if (db) {
      addresses = await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customer.id))
        .orderBy(desc(customerAddresses.isDefault), desc(customerAddresses.createdAt));
    }

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("[CustomerAddresses] GET Error:", error);
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
    const parseResult = addressSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid address data" },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = getDb();
    const addressId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (db) {
      // Check if this is customer's first address, make it default automatically
      const existingAddresses = await db
        .select({ id: customerAddresses.id })
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customer.id));

      const shouldBeDefault = data.isDefault || existingAddresses.length === 0;

      if (shouldBeDefault) {
        // Reset existing default addresses
        await db
          .update(customerAddresses)
          .set({ isDefault: false })
          .where(eq(customerAddresses.customerId, customer.id));
      }

      await db.insert(customerAddresses).values({
        id: addressId,
        customerId: customer.id,
        label: data.label || "Home",
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country || "Pakistan",
        postalCode: data.postalCode || null,
        isDefault: shouldBeDefault,
        createdAt,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Address saved successfully",
      address: {
        id: addressId,
        customerId: customer.id,
        label: data.label || "Home",
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country || "Pakistan",
        postalCode: data.postalCode || null,
        isDefault: data.isDefault,
        createdAt,
      },
    });
  } catch (error) {
    console.error("[CustomerAddresses] POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

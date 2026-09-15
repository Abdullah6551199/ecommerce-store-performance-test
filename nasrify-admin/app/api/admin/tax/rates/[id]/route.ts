import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, taxRates, type TaxRateRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryTaxRates } from "@/lib/tax";

export const dynamic = "force-dynamic";

const updateTaxRateSchema = z.object({
  country: z
    .string()
    .trim()
    .min(2)
    .max(3)
    .transform((val) => val.toUpperCase())
    .optional(),
  state: z.string().trim().nullable().optional().transform((val) => val ? val.toUpperCase() : null),
  city: z.string().trim().nullable().optional(),
  rate: z.coerce.number().min(0).max(100).optional(),
  label: z.string().trim().optional(),
  taxType: z.enum(["inclusive", "exclusive"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const validated = updateTaxRateSchema.parse(body);

    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      const updateData: Partial<TaxRateRecord> = {
        updatedAt: now,
      };

      if (validated.country !== undefined) updateData.country = validated.country;
      if (validated.state !== undefined) updateData.state = validated.state;
      if (validated.city !== undefined) updateData.city = validated.city;
      if (validated.rate !== undefined) updateData.rate = validated.rate;
      if (validated.label !== undefined) updateData.label = validated.label;
      if (validated.taxType !== undefined) updateData.taxType = validated.taxType;
      if (validated.isActive !== undefined) updateData.isActive = validated.isActive;

      await db.update(taxRates).set(updateData).where(eq(taxRates.id, id));

      const updated = await db.select().from(taxRates).where(eq(taxRates.id, id)).limit(1);
      if (updated.length === 0) {
        return NextResponse.json({ success: false, error: "Tax rate not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: updated[0],
        message: "Tax rate updated successfully",
      });
    } else {
      const idx = memoryTaxRates.findIndex((r) => r.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Tax rate not found" }, { status: 404 });
      }
      memoryTaxRates[idx] = {
        ...memoryTaxRates[idx],
        ...validated,
        updatedAt: now,
      };
      return NextResponse.json({
        success: true,
        data: memoryTaxRates[idx],
        message: "Tax rate updated successfully",
      });
    }
  } catch (error) {
    console.error("Failed to update tax rate:", error);
    const msg = error instanceof z.ZodError ? error.issues[0]?.message : "Failed to update tax rate";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const db = getDb();

    if (db) {
      await db.delete(taxRates).where(eq(taxRates.id, id));
    } else {
      const idx = memoryTaxRates.findIndex((r) => r.id === id);
      if (idx !== -1) {
        memoryTaxRates.splice(idx, 1);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tax rate deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete tax rate:", error);
    return NextResponse.json({ success: false, error: "Failed to delete tax rate" }, { status: 500 });
  }
}

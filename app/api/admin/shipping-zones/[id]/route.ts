import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, shippingZones, type ShippingZoneRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { formatShippingZone, memoryShippingZones } from "@/lib/shipping";

export const dynamic = "force-dynamic";

const updateShippingZoneSchema = z.object({
  name: z.string().trim().min(2).optional(),
  countries: z.array(z.string().trim().toUpperCase()).min(1).optional(),
  states: z.array(z.string().trim().toUpperCase()).nullable().optional(),
  rateType: z.enum(["flat", "percentage", "free"]).optional(),
  rate: z.coerce.number().min(0).optional(),
  freeShippingThreshold: z.coerce.number().min(0).nullable().optional(),
  minOrderValue: z.coerce.number().min(0).nullable().optional(),
  deliveryTimeMin: z.coerce.number().int().min(0).nullable().optional(),
  deliveryTimeMax: z.coerce.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
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
    const validated = updateShippingZoneSchema.parse(body);

    const db = getDb();
    const now = new Date().toISOString();

    if (db) {
      const updateData: Partial<ShippingZoneRecord> = {
        updatedAt: now,
      };

      if (validated.name !== undefined) updateData.name = validated.name;
      if (validated.countries !== undefined) updateData.countries = JSON.stringify(validated.countries);
      if (validated.states !== undefined) {
        updateData.states = validated.states && validated.states.length > 0 ? JSON.stringify(validated.states) : null;
      }
      if (validated.rateType !== undefined) updateData.rateType = validated.rateType;
      if (validated.rate !== undefined) updateData.rate = validated.rate;
      if (validated.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = validated.freeShippingThreshold;
      if (validated.minOrderValue !== undefined) updateData.minOrderValue = validated.minOrderValue;
      if (validated.deliveryTimeMin !== undefined) updateData.deliveryTimeMin = validated.deliveryTimeMin;
      if (validated.deliveryTimeMax !== undefined) updateData.deliveryTimeMax = validated.deliveryTimeMax;
      if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
      if (validated.sortOrder !== undefined) updateData.sortOrder = validated.sortOrder;

      await db.update(shippingZones).set(updateData).where(eq(shippingZones.id, id));

      const updated = await db.select().from(shippingZones).where(eq(shippingZones.id, id)).limit(1);
      if (updated.length === 0) {
        return NextResponse.json({ success: false, error: "Shipping zone not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: formatShippingZone(updated[0]),
        message: "Shipping zone updated successfully",
      });
    } else {
      const idx = memoryShippingZones.findIndex((z) => z.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Shipping zone not found" }, { status: 404 });
      }

      const existing = memoryShippingZones[idx];
      const updatedRecord: ShippingZoneRecord = {
        ...existing,
        name: validated.name ?? existing.name,
        countries: validated.countries ? JSON.stringify(validated.countries) : existing.countries,
        states: validated.states !== undefined ? (validated.states ? JSON.stringify(validated.states) : null) : existing.states,
        rateType: validated.rateType ?? existing.rateType,
        rate: validated.rate ?? existing.rate,
        freeShippingThreshold: validated.freeShippingThreshold !== undefined ? validated.freeShippingThreshold : existing.freeShippingThreshold,
        minOrderValue: validated.minOrderValue !== undefined ? validated.minOrderValue : existing.minOrderValue,
        deliveryTimeMin: validated.deliveryTimeMin !== undefined ? validated.deliveryTimeMin : existing.deliveryTimeMin,
        deliveryTimeMax: validated.deliveryTimeMax !== undefined ? validated.deliveryTimeMax : existing.deliveryTimeMax,
        isActive: validated.isActive !== undefined ? validated.isActive : existing.isActive,
        sortOrder: validated.sortOrder !== undefined ? validated.sortOrder : existing.sortOrder,
        updatedAt: now,
      };

      memoryShippingZones[idx] = updatedRecord;
      return NextResponse.json({
        success: true,
        data: formatShippingZone(updatedRecord),
        message: "Shipping zone updated successfully",
      });
    }
  } catch (error) {
    console.error("Failed to update shipping zone:", error);
    const msg = error instanceof z.ZodError ? error.issues[0]?.message : "Failed to update shipping zone";
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
      await db.delete(shippingZones).where(eq(shippingZones.id, id));
    } else {
      const idx = memoryShippingZones.findIndex((z) => z.id === id);
      if (idx !== -1) {
        memoryShippingZones.splice(idx, 1);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Shipping zone deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete shipping zone:", error);
    return NextResponse.json({ success: false, error: "Failed to delete shipping zone" }, { status: 500 });
  }
}

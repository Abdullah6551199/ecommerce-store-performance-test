import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq, desc } from "drizzle-orm";
import { getDb, shippingZones, type ShippingZoneRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { formatShippingZone, memoryShippingZones } from "@/lib/shipping";

export const dynamic = "force-dynamic";

const createShippingZoneSchema = z.object({
  name: z.string().trim().min(2, "Zone name must be at least 2 characters"),
  countries: z.array(z.string().trim().toUpperCase()).min(1, "At least one country is required"),
  states: z.array(z.string().trim().toUpperCase()).nullable().optional(),
  rateType: z.enum(["flat", "percentage", "free"]).default("flat"),
  rate: z.coerce.number().min(0, "Rate cannot be negative").default(0),
  freeShippingThreshold: z.coerce.number().min(0).nullable().optional(),
  minOrderValue: z.coerce.number().min(0).nullable().optional(),
  deliveryTimeMin: z.coerce.number().int().min(0).nullable().optional().default(2),
  deliveryTimeMax: z.coerce.number().int().min(0).nullable().optional().default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const db = getDb();
    let records: ShippingZoneRecord[] = [];

    if (db) {
      records = await db
        .select()
        .from(shippingZones)
        .orderBy(asc(shippingZones.sortOrder), desc(shippingZones.createdAt));
    } else {
      records = [...memoryShippingZones].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
    }

    const formatted = records.map(formatShippingZone);

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Failed to fetch shipping zones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shipping zones" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createShippingZoneSchema.parse(body);

    const db = getDb();
    const id = `zone_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newZoneRecord: ShippingZoneRecord = {
      id,
      tenantId: null,
      name: validated.name,
      countries: JSON.stringify(validated.countries),
      states: validated.states && validated.states.length > 0 ? JSON.stringify(validated.states) : null,
      rateType: validated.rateType,
      rate: validated.rate,
      freeShippingThreshold: validated.freeShippingThreshold ?? null,
      minOrderValue: validated.minOrderValue ?? null,
      deliveryTimeMin: validated.deliveryTimeMin ?? null,
      deliveryTimeMax: validated.deliveryTimeMax ?? null,
      isActive: validated.isActive,
      sortOrder: validated.sortOrder,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.insert(shippingZones).values(newZoneRecord);
    } else {
      memoryShippingZones.push(newZoneRecord);
    }

    return NextResponse.json({
      success: true,
      data: formatShippingZone(newZoneRecord),
      message: "Shipping zone created successfully",
    });
  } catch (error) {
    console.error("Failed to create shipping zone:", error);
    const msg = error instanceof z.ZodError ? error.issues[0]?.message : "Failed to create shipping zone";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

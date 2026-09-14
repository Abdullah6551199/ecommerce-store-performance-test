import { NextRequest, NextResponse } from "next/server";
import { getDb, shippingZones, type ShippingZoneRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { PRESET_SHIPPING_ZONES, formatShippingZone, memoryShippingZones } from "@/lib/shipping";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();
    const created: ShippingZoneRecord[] = [];

    for (let i = 0; i < PRESET_SHIPPING_ZONES.length; i++) {
      const p = PRESET_SHIPPING_ZONES[i];
      const id = `zone_preset_${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

      const record: ShippingZoneRecord = {
        id,
        tenantId: null,
        name: p.name,
        countries: JSON.stringify(p.countries),
        states: p.states ? JSON.stringify(p.states) : null,
        rateType: p.rateType,
        rate: p.rate,
        freeShippingThreshold: p.freeShippingThreshold,
        minOrderValue: p.minOrderValue,
        deliveryTimeMin: p.deliveryTimeMin,
        deliveryTimeMax: p.deliveryTimeMax,
        isActive: true,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      };

      if (db) {
        try {
          await db.insert(shippingZones).values(record);
        } catch {
          // Update if already exists
          await db
            .update(shippingZones)
            .set({
              countries: record.countries,
              rateType: record.rateType,
              rate: record.rate,
              freeShippingThreshold: record.freeShippingThreshold,
              deliveryTimeMin: record.deliveryTimeMin,
              deliveryTimeMax: record.deliveryTimeMax,
              isActive: true,
              updatedAt: now,
            })
            .where(eq(shippingZones.id, id));
        }
      } else {
        const existingIdx = memoryShippingZones.findIndex((z) => z.id === id);
        if (existingIdx !== -1) {
          memoryShippingZones[existingIdx] = record;
        } else {
          memoryShippingZones.push(record);
        }
      }
      created.push(record);
    }

    return NextResponse.json({
      success: true,
      message: `Loaded ${created.length} preset shipping zone(s)`,
      data: created.map(formatShippingZone),
    });
  } catch (error) {
    console.error("Failed to load preset shipping zones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load preset shipping zones" },
      { status: 500 }
    );
  }
}

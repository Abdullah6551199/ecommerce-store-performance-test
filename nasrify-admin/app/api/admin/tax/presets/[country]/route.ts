import { NextRequest, NextResponse } from "next/server";
import { getDb, taxRates, type TaxRateRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { TAX_PRESETS, memoryTaxRates } from "@/lib/tax";
import { and, eq, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ country: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { country } = await context.params;
    const normalizedCountry = country.trim().toUpperCase();
    const presetList = TAX_PRESETS[normalizedCountry];

    if (!presetList || presetList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No pre-configured tax presets found for country code "${normalizedCountry}". Available presets: ${Object.keys(
            TAX_PRESETS
          ).join(", ")}`,
        },
        { status: 404 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();
    const insertedRecords: TaxRateRecord[] = [];

    for (const item of presetList) {
      const id = `tax_${item.country.toLowerCase()}_${item.state ? item.state.toLowerCase() : "default"}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const record: TaxRateRecord = {
        id,
        tenantId: null,
        country: item.country,
        state: item.state,
        city: item.city,
        rate: item.rate,
        label: item.label,
        taxType: item.taxType,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      if (db) {
        // Upsert or insert new
        try {
          await db.insert(taxRates).values(record);
        } catch (err) {
          // If conflict exists on UNIQUE(country, state, city), update it
          if (item.state) {
            await db
              .update(taxRates)
              .set({
                rate: item.rate,
                label: item.label,
                taxType: item.taxType,
                isActive: true,
                updatedAt: now,
              })
              .where(
                and(
                  eq(taxRates.country, item.country),
                  eq(taxRates.state, item.state)
                )
              );
          } else {
            await db
              .update(taxRates)
              .set({
                rate: item.rate,
                label: item.label,
                taxType: item.taxType,
                isActive: true,
                updatedAt: now,
              })
              .where(
                and(
                  eq(taxRates.country, item.country),
                  isNull(taxRates.state)
                )
              );
          }
        }
      } else {
        const existingIdx = memoryTaxRates.findIndex(
          (r) => r.country === item.country && r.state === item.state && r.city === item.city
        );
        if (existingIdx !== -1) {
          memoryTaxRates[existingIdx] = record;
        } else {
          memoryTaxRates.push(record);
        }
      }
      insertedRecords.push(record);
    }

    return NextResponse.json({
      success: true,
      message: `Loaded ${insertedRecords.length} preset tax rate(s) for ${normalizedCountry}`,
      data: insertedRecords,
    });
  } catch (error) {
    console.error("Failed to load preset tax rates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load preset tax rates" },
      { status: 500 }
    );
  }
}

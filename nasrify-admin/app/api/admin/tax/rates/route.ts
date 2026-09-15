import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc, asc, and, sql, like, or } from "drizzle-orm";
import { getDb, taxRates, type TaxRateRecord } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { memoryTaxRates } from "@/lib/tax";

export const dynamic = "force-dynamic";

const createTaxRateSchema = z.object({
  country: z
    .string()
    .trim()
    .min(2, "Country code must be at least 2 letters")
    .max(3, "Country code cannot exceed 3 letters")
    .transform((val) => val.toUpperCase()),
  state: z.string().trim().nullable().optional().transform((val) => val ? val.toUpperCase() : null),
  city: z.string().trim().nullable().optional(),
  rate: z.coerce.number().min(0, "Rate cannot be negative").max(100, "Rate cannot exceed 100%"),
  label: z.string().trim().default("Tax"),
  taxType: z.enum(["inclusive", "exclusive"]).default("exclusive"),
  isActive: z.boolean().default(true),
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toUpperCase() || "";
    const status = searchParams.get("status")?.trim().toLowerCase() || "all";
    const sort = searchParams.get("sort") || "country_asc";

    const db = getDb();
    let rates: TaxRateRecord[] = [];

    if (db) {
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            like(sql`UPPER(${taxRates.country})`, `%${search}%`),
            like(sql`UPPER(${taxRates.state})`, `%${search}%`),
            like(sql`UPPER(${taxRates.city})`, `%${search}%`),
            like(sql`UPPER(${taxRates.label})`, `%${search}%`)
          )
        );
      }

      if (status === "active") {
        conditions.push(eq(taxRates.isActive, true));
      } else if (status === "inactive") {
        conditions.push(eq(taxRates.isActive, false));
      }

      const orderByClause =
        sort === "country_desc"
          ? desc(taxRates.country)
          : sort === "rate_desc"
          ? desc(taxRates.rate)
          : sort === "rate_asc"
          ? asc(taxRates.rate)
          : asc(taxRates.country);

      rates = await db
        .select()
        .from(taxRates)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderByClause);
    } else {
      rates = memoryTaxRates.filter((r) => {
        if (search && !r.country.includes(search) && !(r.state && r.state.includes(search))) {
          return false;
        }
        if (status === "active" && !r.isActive) return false;
        if (status === "inactive" && r.isActive) return false;
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error("Failed to fetch tax rates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tax rates" },
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
    const validated = createTaxRateSchema.parse(body);

    const db = getDb();
    const id = `tax_${validated.country.toLowerCase()}_${Date.now()}`;
    const now = new Date().toISOString();

    const newRate: TaxRateRecord = {
      id,
      tenantId: null,
      country: validated.country,
      state: validated.state || null,
      city: validated.city || null,
      rate: validated.rate,
      label: validated.label,
      taxType: validated.taxType,
      isActive: validated.isActive,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      await db.insert(taxRates).values(newRate);
    } else {
      memoryTaxRates.push(newRate);
    }

    return NextResponse.json({
      success: true,
      data: newRate,
      message: "Tax rate created successfully",
    });
  } catch (error) {
    console.error("Failed to create tax rate:", error);
    const msg = error instanceof z.ZodError ? error.issues[0]?.message : "Failed to create tax rate";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

import { getDb, taxRates, taxSettings, type TaxRateRecord, type TaxSettingRecord } from "./db";
import { eq, and, sql, desc, asc, isNull, or } from "drizzle-orm";

export type TaxType = "inclusive" | "exclusive";

export interface TaxRate {
  id: string;
  country: string;
  state: string | null;
  city: string | null;
  rate: number;
  label: string | null;
  taxType: TaxType;
  isActive: boolean | null;
}

export interface VisitorLocation {
  country: string | null;
  region: string | null;
  city: string | null;
}

export interface TaxCalculationResult {
  taxAmount: number;
  netAmount: number;
  totalAmount: number;
  rate: number;
  label: string;
  taxType: TaxType;
  appliedToShipping: boolean;
}

// In-memory fallback stores for local Next.js / build / test environments
export const memoryTaxRates: TaxRateRecord[] = [
  {
    id: "tax_pk_default",
    tenantId: null,
    country: "PK",
    state: null,
    city: null,
    rate: 17.0,
    label: "GST",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_in_default",
    tenantId: null,
    country: "IN",
    state: null,
    city: null,
    rate: 18.0,
    label: "GST",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_us_ca",
    tenantId: null,
    country: "US",
    state: "CA",
    city: null,
    rate: 7.25,
    label: "Sales Tax",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_us_ny",
    tenantId: null,
    country: "US",
    state: "NY",
    city: null,
    rate: 4.0,
    label: "Sales Tax",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_us_tx",
    tenantId: null,
    country: "US",
    state: "TX",
    city: null,
    rate: 6.25,
    label: "Sales Tax",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_us_default",
    tenantId: null,
    country: "US",
    state: null,
    city: null,
    rate: 0.0,
    label: "Sales Tax",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_gb_default",
    tenantId: null,
    country: "GB",
    state: null,
    city: null,
    rate: 20.0,
    label: "VAT",
    taxType: "inclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_ae_default",
    tenantId: null,
    country: "AE",
    state: null,
    city: null,
    rate: 5.0,
    label: "VAT",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_sa_default",
    tenantId: null,
    country: "SA",
    state: null,
    city: null,
    rate: 15.0,
    label: "VAT",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax_bd_default",
    tenantId: null,
    country: "BD",
    state: null,
    city: null,
    rate: 15.0,
    label: "VAT",
    taxType: "exclusive",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export let memoryTaxSettings: TaxSettingRecord = {
  id: "tax_settings_default",
  tenantId: null,
  isEnabled: true,
  defaultRate: 0,
  defaultLabel: "Tax",
  defaultTaxType: "exclusive",
  applyToShipping: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Get visitor's country/region from Cloudflare request.cf and standard fallback headers
 */
export function getVisitorLocation(request: Request): VisitorLocation {
  const cf = (request as any).cf;
  const headers = request.headers;

  const country =
    cf?.country ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country") ||
    null;

  const region =
    cf?.region ||
    cf?.regionCode ||
    headers.get("cf-region") ||
    headers.get("x-region") ||
    null;

  const city =
    cf?.city ||
    headers.get("cf-ipcity") ||
    headers.get("x-city") ||
    null;

  return {
    country: country ? country.toUpperCase().trim() : null,
    region: region ? region.trim() : null,
    city: city ? city.trim() : null,
  };
}

/**
 * Fetch global tax settings
 */
export async function getTaxSettings(): Promise<TaxSettingRecord> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(taxSettings).limit(1);
      if (rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      console.warn("Failed to fetch tax settings from D1:", err);
    }
  }
  return memoryTaxSettings;
}

/**
 * Detect applicable tax rate based on location hierarchy:
 * 1. Exact match (country + state + city)
 * 2. Country + state (city is null or empty)
 * 3. Country only (state is null or empty)
 * 4. Default settings (if enabled)
 */
export async function detectTaxRate(
  country: string,
  state?: string | null,
  city?: string | null
): Promise<TaxRate | null> {
  const normalizedCountry = country.trim().toUpperCase();
  const normalizedState = state && state.trim() ? state.trim().toUpperCase() : null;
  const normalizedCity = city && city.trim() ? city.trim().toLowerCase() : null;

  const settings = await getTaxSettings();
  if (!settings.isEnabled) {
    return null;
  }

  const db = getDb();
  let rates: TaxRateRecord[] = [];

  if (db) {
    try {
      rates = await db
        .select()
        .from(taxRates)
        .where(
          and(
            eq(taxRates.country, normalizedCountry),
            eq(taxRates.isActive, true)
          )
        );
    } catch (err) {
      console.warn("Failed to query tax rates from D1, falling back to memory:", err);
      rates = memoryTaxRates.filter(
        (r) => r.country === normalizedCountry && r.isActive
      );
    }
  } else {
    rates = memoryTaxRates.filter(
      (r) => r.country === normalizedCountry && r.isActive
    );
  }

  // 1. Exact match: Country + State + City
  if (normalizedState && normalizedCity) {
    const exact = rates.find(
      (r) =>
        r.state &&
        r.state.toUpperCase() === normalizedState &&
        r.city &&
        r.city.toLowerCase() === normalizedCity
    );
    if (exact) return formatTaxRate(exact);
  }

  // 2. Country + State match (city is null/empty)
  if (normalizedState) {
    const stateMatch = rates.find(
      (r) =>
        r.state &&
        r.state.toUpperCase() === normalizedState &&
        (!r.city || r.city.trim() === "")
    );
    if (stateMatch) return formatTaxRate(stateMatch);
  }

  // 3. Country-only match (state is null/empty, city is null/empty)
  const countryMatch = rates.find(
    (r) => (!r.state || r.state.trim() === "") && (!r.city || r.city.trim() === "")
  );
  if (countryMatch) return formatTaxRate(countryMatch);

  // 4. Default settings fallback if defaultRate > 0 or default is enabled
  if (settings.isEnabled && settings.defaultRate !== null && settings.defaultRate >= 0) {
    return {
      id: "default_fallback",
      country: normalizedCountry,
      state: normalizedState,
      city: normalizedCity,
      rate: Number(settings.defaultRate),
      label: settings.defaultLabel || "Tax",
      taxType: (settings.defaultTaxType as TaxType) || "exclusive",
      isActive: true,
    };
  }

  return null;
}

function formatTaxRate(record: TaxRateRecord): TaxRate {
  return {
    id: record.id,
    country: record.country,
    state: record.state,
    city: record.city,
    rate: Number(record.rate),
    label: record.label || "Tax",
    taxType: (record.taxType as TaxType) || "exclusive",
    isActive: Boolean(record.isActive),
  };
}

/**
 * Calculate tax based on amount, rate percentage, and tax type (inclusive vs exclusive)
 */
export function calculateTax(
  amount: number,
  rate: number,
  taxType: TaxType
): { taxAmount: number; netAmount: number } {
  if (rate <= 0 || amount <= 0) {
    return { taxAmount: 0, netAmount: amount };
  }

  if (taxType === "inclusive") {
    // Tax is already included in amount: netAmount = amount / (1 + rate / 100)
    const netAmount = Math.round((amount / (1 + rate / 100)) * 100) / 100;
    const taxAmount = Math.round((amount - netAmount) * 100) / 100;
    return {
      taxAmount,
      netAmount,
    };
  } else {
    // Tax is added on top of amount: taxAmount = amount * (rate / 100)
    const taxAmount = Math.round(amount * (rate / 100) * 100) / 100;
    return {
      taxAmount,
      netAmount: amount,
    };
  }
}

/**
 * Preset data for countries
 */
export const TAX_PRESETS: Record<
  string,
  Array<{
    country: string;
    state: string | null;
    city: string | null;
    rate: number;
    label: string;
    taxType: TaxType;
  }>
> = {
  PK: [
    { country: "PK", state: null, city: null, rate: 17.0, label: "GST", taxType: "exclusive" },
  ],
  IN: [
    { country: "IN", state: null, city: null, rate: 18.0, label: "GST", taxType: "exclusive" },
  ],
  US: [
    { country: "US", state: "CA", city: null, rate: 7.25, label: "Sales Tax", taxType: "exclusive" },
    { country: "US", state: "NY", city: null, rate: 4.0, label: "Sales Tax", taxType: "exclusive" },
    { country: "US", state: "TX", city: null, rate: 6.25, label: "Sales Tax", taxType: "exclusive" },
    { country: "US", state: "FL", city: null, rate: 6.0, label: "Sales Tax", taxType: "exclusive" },
    { country: "US", state: "WA", city: null, rate: 6.5, label: "Sales Tax", taxType: "exclusive" },
    { country: "US", state: null, city: null, rate: 0.0, label: "Sales Tax", taxType: "exclusive" },
  ],
  GB: [
    { country: "GB", state: null, city: null, rate: 20.0, label: "VAT", taxType: "inclusive" },
  ],
  AE: [
    { country: "AE", state: null, city: null, rate: 5.0, label: "VAT", taxType: "exclusive" },
  ],
  SA: [
    { country: "SA", state: null, city: null, rate: 15.0, label: "VAT", taxType: "exclusive" },
  ],
  BD: [
    { country: "BD", state: null, city: null, rate: 15.0, label: "VAT", taxType: "exclusive" },
  ],
};

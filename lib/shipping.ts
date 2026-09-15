import { cache } from "react";
import { getDb, shippingZones, type ShippingZoneRecord } from "./db";
import { eq, asc, and, desc } from "drizzle-orm";

export type ShippingRateType = "flat" | "percentage" | "free";

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states: string[] | null;
  rateType: ShippingRateType;
  rate: number;
  freeShippingThreshold: number | null;
  minOrderValue: number | null;
  deliveryTimeMin: number | null;
  deliveryTimeMax: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingCalculationResult {
  zone: ShippingZone | null;
  shippingCost: number;
  isFree: boolean;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  shippingAvailable: boolean;
  minOrderValueMet: boolean;
  minOrderValue: number | null;
  message?: string;
}

// In-memory fallback stores for local testing / build environments
export const memoryShippingZones: ShippingZoneRecord[] = [
  {
    id: "zone_pk_domestic",
    tenantId: null,
    name: "Pakistan Domestic",
    countries: JSON.stringify(["PK"]),
    states: null,
    rateType: "flat",
    rate: 5.0,
    freeShippingThreshold: 100.0,
    minOrderValue: null,
    deliveryTimeMin: 2,
    deliveryTimeMax: 3,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone_south_asia",
    tenantId: null,
    name: "South Asia",
    countries: JSON.stringify(["IN", "BD", "LK", "NP"]),
    states: null,
    rateType: "flat",
    rate: 15.0,
    freeShippingThreshold: 150.0,
    minOrderValue: null,
    deliveryTimeMin: 4,
    deliveryTimeMax: 7,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone_middle_east",
    tenantId: null,
    name: "Middle East",
    countries: JSON.stringify(["AE", "SA", "QA", "KW", "BH", "OM"]),
    states: null,
    rateType: "flat",
    rate: 20.0,
    freeShippingThreshold: 200.0,
    minOrderValue: null,
    deliveryTimeMin: 3,
    deliveryTimeMax: 5,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone_north_america",
    tenantId: null,
    name: "North America",
    countries: JSON.stringify(["US", "CA", "MX"]),
    states: null,
    rateType: "flat",
    rate: 25.0,
    freeShippingThreshold: 250.0,
    minOrderValue: null,
    deliveryTimeMin: 5,
    deliveryTimeMax: 10,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone_europe",
    tenantId: null,
    name: "Europe",
    countries: JSON.stringify(["GB", "DE", "FR", "IT", "ES", "NL", "BE", "SE"]),
    states: null,
    rateType: "flat",
    rate: 25.0,
    freeShippingThreshold: 250.0,
    minOrderValue: null,
    deliveryTimeMin: 5,
    deliveryTimeMax: 8,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone_rest_of_world",
    tenantId: null,
    name: "Rest of World",
    countries: JSON.stringify(["*"]),
    states: null,
    rateType: "flat",
    rate: 35.0,
    freeShippingThreshold: null,
    minOrderValue: null,
    deliveryTimeMin: 7,
    deliveryTimeMax: 14,
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function parseStringArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim().toUpperCase());
    }
    return [String(parsed).trim().toUpperCase()];
  } catch {
    // If comma-separated or plain text
    return jsonString
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
  }
}

export function formatShippingZone(record: ShippingZoneRecord): ShippingZone {
  return {
    id: record.id,
    name: record.name,
    countries: parseStringArray(record.countries),
    states: record.states ? parseStringArray(record.states) : null,
    rateType: (record.rateType as ShippingRateType) || "flat",
    rate: Number(record.rate ?? 0),
    freeShippingThreshold: record.freeShippingThreshold !== null ? Number(record.freeShippingThreshold) : null,
    minOrderValue: record.minOrderValue !== null ? Number(record.minOrderValue) : null,
    deliveryTimeMin: record.deliveryTimeMin !== null ? Number(record.deliveryTimeMin) : null,
    deliveryTimeMax: record.deliveryTimeMax !== null ? Number(record.deliveryTimeMax) : null,
    isActive: Boolean(record.isActive),
    sortOrder: Number(record.sortOrder ?? 0),
  };
}

let _cachedActiveZones: ShippingZone[] | null = null;
let _cachedActiveZonesTtl = 0;
const SHIPPING_ZONES_CACHE_TTL_MS = 60000;

export function invalidateShippingZonesCache(): void {
  _cachedActiveZones = null;
  _cachedActiveZonesTtl = 0;
}

/**
 * Fetch all active shipping zones ordered by sort_order
 * Deduplicated via React.cache with 60s in-memory TTL
 */
export const getActiveShippingZones = cache(async (): Promise<ShippingZone[]> => {
  if (_cachedActiveZones && Date.now() - _cachedActiveZonesTtl < SHIPPING_ZONES_CACHE_TTL_MS) {
    return _cachedActiveZones;
  }
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(shippingZones)
        .where(eq(shippingZones.isActive, true))
        .orderBy(asc(shippingZones.sortOrder), asc(shippingZones.createdAt));
      const formatted = rows.map(formatShippingZone);
      _cachedActiveZones = formatted;
      _cachedActiveZonesTtl = Date.now();
      return formatted;
    } catch (err) {
      console.warn("Failed to fetch shipping zones from D1, falling back to memory:", err);
    }
  }

  return memoryShippingZones
    .filter((z) => z.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(formatShippingZone);
});

/**
 * Calculate shipping cost and matching zone based on country, state, and order subtotal
 */
export async function calculateShipping(
  country: string,
  state: string | null = null,
  orderSubtotal: number
): Promise<ShippingCalculationResult> {
  const normalizedCountry = country ? country.trim().toUpperCase() : "";
  const normalizedState = state && state.trim() ? state.trim().toUpperCase() : null;

  if (!normalizedCountry) {
    return {
      zone: null,
      shippingCost: 0,
      isFree: false,
      deliveryTimeMin: 3,
      deliveryTimeMax: 5,
      shippingAvailable: false,
      minOrderValueMet: true,
      minOrderValue: null,
      message: "Please select a destination country",
    };
  }

  const zones = await getActiveShippingZones();

  // Zone Matching Logic with Priority:
  // 1. Exact country match with matching state
  // 2. Exact country match with no state constraint
  // 3. Wildcard / Rest of World ('*' in countries)
  let matchedZone: ShippingZone | null = null;

  // Check 1 & 2 in order of zone sortOrder
  for (const zone of zones) {
    const hasCountry = zone.countries.includes(normalizedCountry);
    if (!hasCountry) continue;

    if (zone.states && zone.states.length > 0) {
      if (normalizedState && zone.states.includes(normalizedState)) {
        matchedZone = zone;
        break;
      }
    } else {
      matchedZone = zone;
      break;
    }
  }

  // Check 3: Wildcard / Rest of World if no specific zone matched
  if (!matchedZone) {
    matchedZone = zones.find((z) => z.countries.includes("*") || z.countries.includes("REST_OF_WORLD")) || null;
  }

  // If no zone matches, shipping is not available
  if (!matchedZone) {
    return {
      zone: null,
      shippingCost: 0,
      isFree: false,
      deliveryTimeMin: 0,
      deliveryTimeMax: 0,
      shippingAvailable: false,
      minOrderValueMet: true,
      minOrderValue: null,
      message: "Shipping not available to this location",
    };
  }

  // Check Minimum Order Value
  const minOrderValue = matchedZone.minOrderValue;
  const minOrderValueMet = minOrderValue === null || orderSubtotal >= minOrderValue;

  // Check Free Shipping Threshold
  const isThresholdFree =
    matchedZone.freeShippingThreshold !== null &&
    matchedZone.freeShippingThreshold > 0 &&
    orderSubtotal >= matchedZone.freeShippingThreshold;

  let shippingCost = 0;
  let isFree = false;

  if (matchedZone.rateType === "free" || isThresholdFree) {
    shippingCost = 0;
    isFree = true;
  } else if (matchedZone.rateType === "flat") {
    shippingCost = Math.round(matchedZone.rate * 100) / 100;
    isFree = shippingCost === 0;
  } else if (matchedZone.rateType === "percentage") {
    shippingCost = Math.round((orderSubtotal * (matchedZone.rate / 100)) * 100) / 100;
    isFree = shippingCost === 0;
  }

  return {
    zone: matchedZone,
    shippingCost,
    isFree,
    deliveryTimeMin: matchedZone.deliveryTimeMin ?? 2,
    deliveryTimeMax: matchedZone.deliveryTimeMax ?? 5,
    shippingAvailable: true,
    minOrderValueMet,
    minOrderValue,
    message: minOrderValueMet
      ? undefined
      : `Minimum order value for ${matchedZone.name} is $${minOrderValue?.toFixed(2)}`,
  };
}

/**
 * Standard preset zones
 */
export const PRESET_SHIPPING_ZONES = [
  {
    name: "Pakistan Domestic",
    countries: ["PK"],
    states: null,
    rateType: "flat" as ShippingRateType,
    rate: 5.0,
    freeShippingThreshold: 100.0,
    minOrderValue: null,
    deliveryTimeMin: 2,
    deliveryTimeMax: 3,
  },
  {
    name: "South Asia",
    countries: ["IN", "BD", "LK", "NP"],
    states: null,
    rateType: "flat" as ShippingRateType,
    rate: 15.0,
    freeShippingThreshold: 150.0,
    minOrderValue: null,
    deliveryTimeMin: 4,
    deliveryTimeMax: 7,
  },
  {
    name: "Middle East",
    countries: ["AE", "SA", "QA", "KW", "BH", "OM"],
    states: null,
    rateType: "flat" as ShippingRateType,
    rate: 20.0,
    freeShippingThreshold: 200.0,
    minOrderValue: null,
    deliveryTimeMin: 3,
    deliveryTimeMax: 5,
  },
  {
    name: "North America",
    countries: ["US", "CA", "MX"],
    states: null,
    rateType: "flat" as ShippingRateType,
    rate: 25.0,
    freeShippingThreshold: 250.0,
    minOrderValue: null,
    deliveryTimeMin: 5,
    deliveryTimeMax: 10,
  },
  {
    name: "Europe",
    countries: ["GB", "DE", "FR", "IT", "ES", "NL", "BE", "SE"],
    states: null,
    rateType: "flat" as ShippingRateType,
    rate: 25.0,
    freeShippingThreshold: 250.0,
    minOrderValue: null,
    deliveryTimeMin: 5,
    deliveryTimeMax: 8,
  },
  {
    name: "Rest of World",
    countries: ["*"],
    states: null,
    rateType: "flat" as ShippingRateType,
    rate: 35.0,
    freeShippingThreshold: null,
    minOrderValue: null,
    deliveryTimeMin: 7,
    deliveryTimeMax: 14,
  },
];

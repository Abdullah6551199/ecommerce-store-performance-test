import { cache } from "react";
import { eq, asc, and, or, inArray, sql } from "drizzle-orm";
import {
  getDb,
  trustBadges,
  paymentIcons,
  type TrustBadgeRecord,
  type PaymentIconRecord,
  type NewTrustBadgeRecord,
  type NewPaymentIconRecord,
} from "./db";

export type TrustBadgeLocation = "all" | "product" | "cart" | "checkout" | "footer";

export interface CreateTrustBadgeInput {
  icon: string;
  title: string;
  description?: string | null;
  location?: TrustBadgeLocation | string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateTrustBadgeInput extends Partial<CreateTrustBadgeInput> {}

export interface CreatePaymentIconInput {
  name: string;
  iconSvg?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePaymentIconInput extends Partial<CreatePaymentIconInput> {}

// In-memory fallback stores for local Next.js / build / test environments
export const memoryTrustBadges: TrustBadgeRecord[] = [
  {
    id: "tb_secure",
    tenantId: null,
    icon: "shield-check",
    title: "Secure Checkout",
    description: "256-bit SSL Encryption",
    location: "all",
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tb_returns",
    tenantId: null,
    icon: "refresh-cw",
    title: "30-Day Returns",
    description: "Hassle-free returns",
    location: "all",
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tb_shipping",
    tenantId: null,
    icon: "truck",
    title: "Free Shipping",
    description: "On orders over $50",
    location: "all",
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tb_support",
    tenantId: null,
    icon: "headphones",
    title: "24/7 Support",
    description: "We are here to help",
    location: "all",
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tb_authentic",
    tenantId: null,
    icon: "badge-check",
    title: "100% Authentic",
    description: "Genuine products only",
    location: "all",
    sortOrder: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tb_payment",
    tenantId: null,
    icon: "credit-card",
    title: "Safe Payment",
    description: "Multiple payment options",
    location: "all",
    sortOrder: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const memoryPaymentIcons: PaymentIconRecord[] = [
  {
    id: "pi_visa",
    tenantId: null,
    name: "Visa",
    iconSvg: null,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pi_mastercard",
    tenantId: null,
    name: "Mastercard",
    iconSvg: null,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pi_amex",
    tenantId: null,
    name: "American Express",
    iconSvg: null,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pi_paypal",
    tenantId: null,
    name: "PayPal",
    iconSvg: null,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pi_applepay",
    tenantId: null,
    name: "Apple Pay",
    iconSvg: null,
    sortOrder: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pi_googlepay",
    tenantId: null,
    name: "Google Pay",
    iconSvg: null,
    sortOrder: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let cachedTrustBadges: TrustBadgeRecord[] | null = null;
let lastTrustBadgesFetchTime = 0;
let cachedPaymentIcons: PaymentIconRecord[] | null = null;
let lastPaymentIconsFetchTime = 0;
const TRUST_CACHE_TTL_MS = 60000;

export function invalidateTrustBadgesCache(): void {
  cachedTrustBadges = null;
  lastTrustBadgesFetchTime = 0;
  cachedPaymentIcons = null;
  lastPaymentIconsFetchTime = 0;
}

/**
 * List trust badges with optional location and active status filtering
 * Deduplicated via React.cache and 60s in-memory TTL
 */
export const listTrustBadges = cache(async (options?: {
  location?: string;
  isActiveOnly?: boolean;
}): Promise<TrustBadgeRecord[]> => {
  const location = options?.location?.trim().toLowerCase();
  const isActiveOnly = options?.isActiveOnly ?? false;

  const isAllActiveQuery = (!location || location === "all") && isActiveOnly;
  if (
    isAllActiveQuery &&
    cachedTrustBadges &&
    Date.now() - lastTrustBadgesFetchTime < TRUST_CACHE_TTL_MS
  ) {
    return cachedTrustBadges;
  }

  const db = getDb();
  if (db) {
    try {
      const conditions: any[] = [];
      if (isActiveOnly) {
        conditions.push(eq(trustBadges.isActive, true));
      }
      if (location && location !== "all") {
        conditions.push(
          or(eq(trustBadges.location, location), eq(trustBadges.location, "all"))
        );
      }

      const query = conditions.length > 0
        ? db.select().from(trustBadges).where(and(...conditions)).orderBy(asc(trustBadges.sortOrder), asc(trustBadges.createdAt))
        : db.select().from(trustBadges).orderBy(asc(trustBadges.sortOrder), asc(trustBadges.createdAt));

      const rows = await query;
      if (rows.length > 0) {
        if (isAllActiveQuery) {
          cachedTrustBadges = rows;
          lastTrustBadgesFetchTime = Date.now();
        }
        return rows;
      }
    } catch (error) {
      console.warn("D1 query error in listTrustBadges, using fallback:", error);
    }
  }

  // Fallback in-memory
  return memoryTrustBadges.filter((b) => {
    if (isActiveOnly && !b.isActive) return false;
    if (location && location !== "all") {
      return b.location === location || b.location === "all";
    }
    return true;
  }).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
});

/**
 * Get single trust badge by ID
 */
export async function getTrustBadgeById(id: string): Promise<TrustBadgeRecord | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(trustBadges).where(eq(trustBadges.id, id)).limit(1);
      if (rows.length > 0) return rows[0];
    } catch (error) {
      console.warn("D1 query error in getTrustBadgeById:", error);
    }
  }
  return memoryTrustBadges.find((b) => b.id === id) || null;
}

/**
 * Create a new trust badge
 */
export async function createTrustBadge(input: CreateTrustBadgeInput): Promise<TrustBadgeRecord> {
  const id = `tb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: TrustBadgeRecord = {
    id,
    tenantId: null,
    icon: input.icon.trim(),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    location: input.location?.trim().toLowerCase() || "all",
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  if (db) {
    try {
      await db.insert(trustBadges).values(record);
      return record;
    } catch (error) {
      console.warn("D1 insert error in createTrustBadge:", error);
    }
  }

  // In-memory fallback
  memoryTrustBadges.push(record);
  invalidateTrustBadgesCache();
  return record;
}

/**
 * Update an existing trust badge
 */
export async function updateTrustBadge(
  id: string,
  input: UpdateTrustBadgeInput
): Promise<TrustBadgeRecord | null> {
  const now = new Date().toISOString();
  const db = getDb();

  if (db) {
    try {
      const updates: Partial<NewTrustBadgeRecord> = {
        updatedAt: now,
      };
      if (input.icon !== undefined) updates.icon = input.icon.trim();
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.description !== undefined) updates.description = input.description?.trim() || null;
      if (input.location !== undefined) updates.location = input.location.trim().toLowerCase();
      if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db.update(trustBadges).set(updates).where(eq(trustBadges.id, id));
      const updated = await getTrustBadgeById(id);
      if (updated) {
        invalidateTrustBadgesCache();
        return updated;
      }
    } catch (error) {
      console.warn("D1 update error in updateTrustBadge:", error);
    }
  }

  // In-memory fallback
  const idx = memoryTrustBadges.findIndex((b) => b.id === id);
  if (idx >= 0) {
    memoryTrustBadges[idx] = {
      ...memoryTrustBadges[idx],
      ...(input.icon !== undefined && { icon: input.icon.trim() }),
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.location !== undefined && { location: input.location.trim().toLowerCase() }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: now,
    };
    invalidateTrustBadgesCache();
    return memoryTrustBadges[idx];
  }

  return null;
}

/**
 * Delete a trust badge
 */
export async function deleteTrustBadge(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db.delete(trustBadges).where(eq(trustBadges.id, id));
      return true;
    } catch (error) {
      console.warn("D1 delete error in deleteTrustBadge:", error);
    }
  }

  const idx = memoryTrustBadges.findIndex((b) => b.id === id);
  if (idx >= 0) {
    memoryTrustBadges.splice(idx, 1);
    invalidateTrustBadgesCache();
    return true;
  }
  return false;
}

/**
 * Reorder trust badges by IDs array
 */
export async function reorderTrustBadges(orderedIds: string[]): Promise<boolean> {
  const now = new Date().toISOString();
  const db = getDb();

  if (db) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await db
          .update(trustBadges)
          .set({ sortOrder: i + 1, updatedAt: now })
          .where(eq(trustBadges.id, orderedIds[i]));
      }
      invalidateTrustBadgesCache();
      return true;
    } catch (error) {
      console.warn("D1 reorder error in reorderTrustBadges:", error);
    }
  }

  orderedIds.forEach((id, index) => {
    const badge = memoryTrustBadges.find((b) => b.id === id);
    if (badge) {
      badge.sortOrder = index + 1;
      badge.updatedAt = now;
    }
  });
  invalidateTrustBadgesCache();
  return true;
}

/**
 * List active payment icons (for footer, checkout, etc.)
 * Deduplicated via React.cache and 60s in-memory TTL
 */
export const listPaymentIcons = cache(async (options?: boolean | { isActiveOnly?: boolean }): Promise<PaymentIconRecord[]> => {
  const isActiveOnly = typeof options === "boolean" ? options : (options?.isActiveOnly ?? true);

  if (isActiveOnly && cachedPaymentIcons && Date.now() - lastPaymentIconsFetchTime < TRUST_CACHE_TTL_MS) {
    return cachedPaymentIcons;
  }

  const db = getDb();
  if (db) {
    try {
      const query = isActiveOnly
        ? db.select().from(paymentIcons).where(eq(paymentIcons.isActive, true)).orderBy(asc(paymentIcons.sortOrder), asc(paymentIcons.createdAt))
        : db.select().from(paymentIcons).orderBy(asc(paymentIcons.sortOrder), asc(paymentIcons.createdAt));

      const rows = await query;
      if (rows.length > 0) {
        if (isActiveOnly) {
          cachedPaymentIcons = rows;
          lastPaymentIconsFetchTime = Date.now();
        }
        return rows;
      }
    } catch (error) {
      console.warn("D1 query error in listPaymentIcons:", error);
    }
  }

  return memoryPaymentIcons
    .filter((p) => (isActiveOnly ? p.isActive : true))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
});

/**
 * Get payment icon by ID
 */
export async function getPaymentIconById(id: string): Promise<PaymentIconRecord | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(paymentIcons).where(eq(paymentIcons.id, id)).limit(1);
      if (rows.length > 0) return rows[0];
    } catch (error) {
      console.warn("D1 query error in getPaymentIconById:", error);
    }
  }
  return memoryPaymentIcons.find((p) => p.id === id) || null;
}

/**
 * Create a new payment icon
 */
export async function createPaymentIcon(input: CreatePaymentIconInput): Promise<PaymentIconRecord> {
  const id = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: PaymentIconRecord = {
    id,
    tenantId: null,
    name: input.name.trim(),
    iconSvg: input.iconSvg?.trim() || null,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  if (db) {
    try {
      await db.insert(paymentIcons).values(record);
      return record;
    } catch (error) {
      console.warn("D1 insert error in createPaymentIcon:", error);
    }
  }

  memoryPaymentIcons.push(record);
  invalidateTrustBadgesCache();
  return record;
}

/**
 * Update payment icon
 */
export async function updatePaymentIcon(
  id: string,
  input: UpdatePaymentIconInput
): Promise<PaymentIconRecord | null> {
  const now = new Date().toISOString();
  const db = getDb();

  if (db) {
    try {
      const updates: Partial<NewPaymentIconRecord> = {
        updatedAt: now,
      };
      if (input.name !== undefined) updates.name = input.name.trim();
      if (input.iconSvg !== undefined) updates.iconSvg = input.iconSvg?.trim() || null;
      if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db.update(paymentIcons).set(updates).where(eq(paymentIcons.id, id));
      const updated = await getPaymentIconById(id);
      if (updated) {
        invalidateTrustBadgesCache();
        return updated;
      }
    } catch (error) {
      console.warn("D1 update error in updatePaymentIcon:", error);
    }
  }

  const idx = memoryPaymentIcons.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memoryPaymentIcons[idx] = {
      ...memoryPaymentIcons[idx],
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.iconSvg !== undefined && { iconSvg: input.iconSvg?.trim() || null }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: now,
    };
    invalidateTrustBadgesCache();
    return memoryPaymentIcons[idx];
  }

  return null;
}

/**
 * Toggle payment icon active status
 */
export async function togglePaymentIcon(id: string, isActive: boolean): Promise<PaymentIconRecord | null> {
  return updatePaymentIcon(id, { isActive });
}

/**
 * Reorder payment icons
 */
export async function reorderPaymentIcons(orderedIds: string[]): Promise<boolean> {
  const now = new Date().toISOString();
  const db = getDb();

  if (db) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await db
          .update(paymentIcons)
          .set({ sortOrder: i + 1, updatedAt: now })
          .where(eq(paymentIcons.id, orderedIds[i]));
      }
      invalidateTrustBadgesCache();
      return true;
    } catch (error) {
      console.warn("D1 reorder error in reorderPaymentIcons:", error);
    }
  }

  orderedIds.forEach((id, index) => {
    const icon = memoryPaymentIcons.find((p) => p.id === id);
    if (icon) {
      icon.sortOrder = index + 1;
      icon.updatedAt = now;
    }
  });
  invalidateTrustBadgesCache();
  return true;
}

/**
 * Delete a payment icon
 */
export async function deletePaymentIcon(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db.delete(paymentIcons).where(eq(paymentIcons.id, id));
      invalidateTrustBadgesCache();
      return true;
    } catch (error) {
      console.warn("D1 delete error in deletePaymentIcon:", error);
    }
  }

  const idx = memoryPaymentIcons.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memoryPaymentIcons.splice(idx, 1);
    invalidateTrustBadgesCache();
    return true;
  }
  return false;
}

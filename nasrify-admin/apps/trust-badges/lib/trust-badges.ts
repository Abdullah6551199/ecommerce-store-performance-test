import { cache } from "react";
import { eq, asc, and, or } from "drizzle-orm";
import {
  getDb,
  trustBadges,
  paymentIcons,
  type TrustBadgeRecord,
  type PaymentIconRecord,
  type NewTrustBadgeRecord,
  type NewPaymentIconRecord,
} from "@/lib/db";
import { sendStorefrontInvalidation } from "@/lib/storefront-invalidation";
import type {
  TrustBadgeItem,
  PaymentIconItem,
  CreateTrustBadgeInput,
  UpdateTrustBadgeInput,
  CreatePaymentIconInput,
  UpdatePaymentIconInput,
  TrustBadgeLocation,
} from "../shared/types";

export type { TrustBadgeLocation };

// In-memory fallback stores for local Next.js / build / test environments
export const memoryTrustBadges: TrustBadgeItem[] = [
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

export const memoryPaymentIcons: PaymentIconItem[] = [
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
  {
    id: "pi_cod",
    tenantId: null,
    name: "Cash on Delivery",
    iconSvg: null,
    sortOrder: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 20-second micro-cache
const TRUST_CACHE_TTL_MS = 20_000;
let cachedTrustBadges: TrustBadgeItem[] | null = null;
let lastTrustBadgesFetchTime = 0;

let cachedPaymentIcons: PaymentIconItem[] | null = null;
let lastPaymentIconsFetchTime = 0;

export function invalidateTrustBadgesCache(): void {
  cachedTrustBadges = null;
  lastTrustBadgesFetchTime = 0;
  cachedPaymentIcons = null;
  lastPaymentIconsFetchTime = 0;
}

/**
 * Trigger cross-worker invalidation non-blockingly
 */
function triggerCrossWorkerInvalidation(): void {
  try {
    sendStorefrontInvalidation({
      target: "trust-badges",
    }).catch(() => {});
  } catch (_e) {
    // Non-blocking
  }
}

/**
 * Strict column selection for trust badges
 */
const TRUST_BADGES_COLUMNS = {
  id: trustBadges.id,
  tenantId: trustBadges.tenantId,
  icon: trustBadges.icon,
  title: trustBadges.title,
  description: trustBadges.description,
  location: trustBadges.location,
  sortOrder: trustBadges.sortOrder,
  isActive: trustBadges.isActive,
  createdAt: trustBadges.createdAt,
  updatedAt: trustBadges.updatedAt,
};

/**
 * Strict column selection for payment icons
 */
const PAYMENT_ICONS_COLUMNS = {
  id: paymentIcons.id,
  tenantId: paymentIcons.tenantId,
  name: paymentIcons.name,
  iconSvg: paymentIcons.iconSvg,
  sortOrder: paymentIcons.sortOrder,
  isActive: paymentIcons.isActive,
  createdAt: paymentIcons.createdAt,
  updatedAt: paymentIcons.updatedAt,
};

/**
 * List trust badges with 20s micro-cache and React.cache deduplication
 */
export const listTrustBadges = cache(
  async (options?: {
    location?: TrustBadgeLocation | string;
    isActiveOnly?: boolean;
    limit?: number;
  }): Promise<TrustBadgeItem[]> => {
    const location = options?.location;
    const isActiveOnly = options?.isActiveOnly ?? true;
    const queryLimit = Math.min(options?.limit ?? 50, 100);

    if (
      isActiveOnly &&
      !location &&
      cachedTrustBadges &&
      Date.now() - lastTrustBadgesFetchTime < TRUST_CACHE_TTL_MS
    ) {
      return cachedTrustBadges.slice(0, queryLimit);
    }

    const db = getDb();
    if (db) {
      try {
        const conditions = [];
        if (isActiveOnly) {
          conditions.push(eq(trustBadges.isActive, true));
        }
        if (location && location !== "all") {
          conditions.push(
            or(eq(trustBadges.location, location), eq(trustBadges.location, "all"))
          );
        }

        const rows =
          conditions.length > 0
            ? await db
                .select(TRUST_BADGES_COLUMNS)
                .from(trustBadges)
                .where(and(...conditions))
                .orderBy(asc(trustBadges.sortOrder), asc(trustBadges.createdAt))
                .limit(queryLimit)
            : await db
                .select(TRUST_BADGES_COLUMNS)
                .from(trustBadges)
                .orderBy(asc(trustBadges.sortOrder), asc(trustBadges.createdAt))
                .limit(queryLimit);

        if (rows.length > 0) {
          if (isActiveOnly && !location) {
            cachedTrustBadges = rows as TrustBadgeItem[];
            lastTrustBadgesFetchTime = Date.now();
          }
          return rows as TrustBadgeItem[];
        }
      } catch (error) {
        // Fallback to memory
      }
    }

    return memoryTrustBadges
      .filter((b) => {
        if (isActiveOnly && !b.isActive) return false;
        if (location && location !== "all" && b.location !== "all" && b.location !== location) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, queryLimit);
  }
);

/**
 * Get trust badge by ID
 */
export async function getTrustBadgeById(id: string): Promise<TrustBadgeItem | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select(TRUST_BADGES_COLUMNS)
        .from(trustBadges)
        .where(eq(trustBadges.id, id))
        .limit(1);
      if (rows.length > 0) return rows[0] as TrustBadgeItem;
    } catch (error) {
      // Memory fallback
    }
  }
  return memoryTrustBadges.find((b) => b.id === id) || null;
}

/**
 * Create a new trust badge
 */
export async function createTrustBadge(input: CreateTrustBadgeInput): Promise<TrustBadgeItem> {
  const id = `tb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: TrustBadgeItem = {
    id,
    tenantId: null,
    icon: input.icon.trim(),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    location: input.location || "all",
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  if (db) {
    try {
      await db.insert(trustBadges).values(record as NewTrustBadgeRecord);
      invalidateTrustBadgesCache();
      triggerCrossWorkerInvalidation();
      return record;
    } catch (error) {
      // Memory fallback
    }
  }

  memoryTrustBadges.push(record);
  invalidateTrustBadgesCache();
  triggerCrossWorkerInvalidation();
  return record;
}

/**
 * Update a trust badge
 */
export async function updateTrustBadge(
  id: string,
  input: UpdateTrustBadgeInput
): Promise<TrustBadgeItem | null> {
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
      if (input.location !== undefined) updates.location = input.location;
      if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db.update(trustBadges).set(updates).where(eq(trustBadges.id, id));
      const updated = await getTrustBadgeById(id);
      if (updated) {
        invalidateTrustBadgesCache();
        triggerCrossWorkerInvalidation();
        return updated;
      }
    } catch (error) {
      // Memory fallback
    }
  }

  const idx = memoryTrustBadges.findIndex((b) => b.id === id);
  if (idx >= 0) {
    memoryTrustBadges[idx] = {
      ...memoryTrustBadges[idx],
      ...(input.icon !== undefined && { icon: input.icon.trim() }),
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: now,
    };
    invalidateTrustBadgesCache();
    triggerCrossWorkerInvalidation();
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
      invalidateTrustBadgesCache();
      triggerCrossWorkerInvalidation();
      return true;
    } catch (error) {
      // Memory fallback
    }
  }

  const idx = memoryTrustBadges.findIndex((b) => b.id === id);
  if (idx >= 0) {
    memoryTrustBadges.splice(idx, 1);
    invalidateTrustBadgesCache();
    triggerCrossWorkerInvalidation();
    return true;
  }
  return false;
}

/**
 * Reorder trust badges
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
      triggerCrossWorkerInvalidation();
      return true;
    } catch (error) {
      // Memory fallback
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
  triggerCrossWorkerInvalidation();
  return true;
}

/**
 * List active payment icons (for footer, checkout, etc.)
 */
export const listPaymentIcons = cache(
  async (options?: boolean | { isActiveOnly?: boolean; limit?: number }): Promise<PaymentIconItem[]> => {
    const isActiveOnly = typeof options === "boolean" ? options : (options?.isActiveOnly ?? true);
    const queryLimit = Math.min(
      typeof options === "object" && options?.limit ? options.limit : 50,
      100
    );

    if (
      isActiveOnly &&
      cachedPaymentIcons &&
      Date.now() - lastPaymentIconsFetchTime < TRUST_CACHE_TTL_MS
    ) {
      return cachedPaymentIcons.slice(0, queryLimit);
    }

    const db = getDb();
    if (db) {
      try {
        const rows = isActiveOnly
          ? await db
              .select(PAYMENT_ICONS_COLUMNS)
              .from(paymentIcons)
              .where(eq(paymentIcons.isActive, true))
              .orderBy(asc(paymentIcons.sortOrder), asc(paymentIcons.createdAt))
              .limit(queryLimit)
          : await db
              .select(PAYMENT_ICONS_COLUMNS)
              .from(paymentIcons)
              .orderBy(asc(paymentIcons.sortOrder), asc(paymentIcons.createdAt))
              .limit(queryLimit);

        if (rows.length > 0) {
          if (isActiveOnly) {
            cachedPaymentIcons = rows as PaymentIconItem[];
            lastPaymentIconsFetchTime = Date.now();
          }
          return rows as PaymentIconItem[];
        }
      } catch (error) {
        // Memory fallback
      }
    }

    return memoryPaymentIcons
      .filter((p) => (isActiveOnly ? p.isActive : true))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, queryLimit);
  }
);

/**
 * Get payment icon by ID
 */
export async function getPaymentIconById(id: string): Promise<PaymentIconItem | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select(PAYMENT_ICONS_COLUMNS)
        .from(paymentIcons)
        .where(eq(paymentIcons.id, id))
        .limit(1);
      if (rows.length > 0) return rows[0] as PaymentIconItem;
    } catch (error) {
      // Memory fallback
    }
  }
  return memoryPaymentIcons.find((p) => p.id === id) || null;
}

/**
 * Create a new payment icon
 */
export async function createPaymentIcon(input: CreatePaymentIconInput): Promise<PaymentIconItem> {
  const id = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: PaymentIconItem = {
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
      await db.insert(paymentIcons).values(record as NewPaymentIconRecord);
      invalidateTrustBadgesCache();
      triggerCrossWorkerInvalidation();
      return record;
    } catch (error) {
      // Memory fallback
    }
  }

  memoryPaymentIcons.push(record);
  invalidateTrustBadgesCache();
  triggerCrossWorkerInvalidation();
  return record;
}

/**
 * Update payment icon
 */
export async function updatePaymentIcon(
  id: string,
  input: UpdatePaymentIconInput
): Promise<PaymentIconItem | null> {
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
        triggerCrossWorkerInvalidation();
        return updated;
      }
    } catch (error) {
      // Memory fallback
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
    triggerCrossWorkerInvalidation();
    return memoryPaymentIcons[idx];
  }

  return null;
}

/**
 * Toggle payment icon active status
 */
export async function togglePaymentIcon(id: string, isActive: boolean): Promise<PaymentIconItem | null> {
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
      triggerCrossWorkerInvalidation();
      return true;
    } catch (error) {
      // Memory fallback
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
  triggerCrossWorkerInvalidation();
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
      triggerCrossWorkerInvalidation();
      return true;
    } catch (error) {
      // Memory fallback
    }
  }

  const idx = memoryPaymentIcons.findIndex((p) => p.id === id);
  if (idx >= 0) {
    memoryPaymentIcons.splice(idx, 1);
    invalidateTrustBadgesCache();
    triggerCrossWorkerInvalidation();
    return true;
  }
  return false;
}

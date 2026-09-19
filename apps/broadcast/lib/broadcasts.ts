import React from "react";
import { getDb } from "@/lib/db";
import { broadcasts, broadcastViews, type BroadcastRecord } from "@/lib/db/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { getAppSettings } from "@/lib/apps/installed";
import { sendStorefrontInvalidation } from "@/lib/storefront-invalidation";
import {
  DEFAULT_BROADCAST_SETTINGS,
  type BroadcastAppSettings,
  type CreateBroadcastInput,
  type BroadcastAdminItem,
  type BroadcastStorefrontData,
} from "../shared/types";

export const VISITOR_COOKIE_NAME = "broadcast_visitor_id";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// 20-second in-memory micro-cache for active broadcasts
interface CacheEntry {
  data: BroadcastStorefrontData | null;
  expiresAt: number;
}

const activeBroadcastCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 20 * 1000;

export function invalidateBroadcastCache(): void {
  activeBroadcastCache.clear();
}

/**
 * Retrieve Broadcast App Settings
 */
export const getBroadcastAppSettings = React.cache(
  async (): Promise<BroadcastAppSettings> => {
    try {
      const saved = await getAppSettings<BroadcastAppSettings>("broadcast");
      return {
        ...DEFAULT_BROADCAST_SETTINGS,
        ...saved,
      };
    } catch {
      return DEFAULT_BROADCAST_SETTINGS;
    }
  }
);

/**
 * Get active broadcast suitable for the current visitor.
 * Date-bounded, LIMIT enforced, explicit columns, 20s micro-cache.
 */
export const getActiveBroadcastForVisitor = React.cache(
  async (
    visitorId: string,
    customerId?: string | null
  ): Promise<BroadcastStorefrontData | null> => {
    const settings = await getBroadcastAppSettings();
    if (!settings.enablePopup) {
      return null;
    }

    const cacheKey = `active:${visitorId}:${customerId || "guest"}`;
    const cached = activeBroadcastCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const db = getDb();
    const now = new Date().toISOString();

    if (!db) {
      return null;
    }

    try {
      // Find candidate active broadcasts (bounded by LIMIT and status = sent)
      const limit = Math.max(1, Math.min(settings.maxActiveBroadcasts || 1, 5));
      const candidates = await db
        .select({
          id: broadcasts.id,
          title: broadcasts.title,
          message: broadcasts.message,
          imageUrl: broadcasts.imageUrl,
          linkUrl: broadcasts.linkUrl,
          buttonText: broadcasts.buttonText,
          type: broadcasts.type,
          target: broadcasts.target,
          status: broadcasts.status,
          scheduledFor: broadcasts.scheduledFor,
          createdAt: broadcasts.createdAt,
        })
        .from(broadcasts)
        .where(eq(broadcasts.status, "sent"))
        .orderBy(desc(broadcasts.createdAt))
        .limit(limit);

      for (const b of candidates) {
        // Auto-expiry: Check schedule if present
        if (b.scheduledFor && b.scheduledFor > now) {
          continue;
        }

        // Target audience filtering
        if (b.target === "registered" && !customerId) {
          continue;
        }
        if (b.target === "guest" && customerId) {
          continue;
        }

        // Check if visitor has dismissed or viewed this broadcast
        if (settings.showOncePerCustomer) {
          const viewRows = await db
            .select({
              id: broadcastViews.id,
              isDismissed: broadcastViews.isDismissed,
            })
            .from(broadcastViews)
            .where(
              and(
                eq(broadcastViews.broadcastId, b.id),
                eq(broadcastViews.visitorId, visitorId)
              )
            )
            .limit(1);

          if (viewRows.length > 0 && viewRows[0].isDismissed) {
            continue;
          }
        }

        const result: BroadcastStorefrontData = {
          id: b.id,
          title: b.title,
          message: b.message,
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl,
          buttonText: b.buttonText,
          type: b.type as any,
          target: b.target as any,
          createdAt: b.createdAt,
        };

        activeBroadcastCache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return result;
      }

      activeBroadcastCache.set(cacheKey, {
        data: null,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return null;
    } catch {
      return null;
    }
  }
);

/**
 * Record a broadcast view
 */
export async function recordBroadcastView(
  broadcastId: string,
  visitorId: string,
  customerId?: string | null
): Promise<{ success: boolean }> {
  const db = getDb();
  const now = new Date().toISOString();

  if (!db) return { success: false };

  try {
    const existing = await db
      .select({ id: broadcastViews.id, customerId: broadcastViews.customerId })
      .from(broadcastViews)
      .where(
        and(
          eq(broadcastViews.broadcastId, broadcastId),
          eq(broadcastViews.visitorId, visitorId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      if (customerId && !existing[0].customerId) {
        await db
          .update(broadcastViews)
          .set({ customerId })
          .where(eq(broadcastViews.id, existing[0].id));
      }
      return { success: true };
    }

    await db.insert(broadcastViews).values({
      id: crypto.randomUUID(),
      broadcastId,
      customerId: customerId || null,
      visitorId,
      isDismissed: false,
      viewedAt: now,
      clickedAt: null,
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Mark broadcast as dismissed for a visitor
 */
export async function dismissBroadcast(
  broadcastId: string,
  visitorId: string,
  customerId?: string | null
): Promise<{ success: boolean }> {
  const db = getDb();
  const now = new Date().toISOString();

  if (!db) return { success: false };

  try {
    const existing = await db
      .select({ id: broadcastViews.id, customerId: broadcastViews.customerId })
      .from(broadcastViews)
      .where(
        and(
          eq(broadcastViews.broadcastId, broadcastId),
          eq(broadcastViews.visitorId, visitorId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(broadcastViews)
        .set({ isDismissed: true, customerId: customerId || existing[0].customerId })
        .where(eq(broadcastViews.id, existing[0].id));
    } else {
      await db.insert(broadcastViews).values({
        id: crypto.randomUUID(),
        broadcastId,
        customerId: customerId || null,
        visitorId,
        isDismissed: true,
        viewedAt: now,
        clickedAt: null,
      });
    }

    invalidateBroadcastCache();
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Track button or link click for CTR analytics
 */
export async function recordBroadcastClick(
  broadcastId: string,
  visitorId: string
): Promise<{ success: boolean }> {
  const db = getDb();
  const now = new Date().toISOString();

  if (!db) return { success: false };

  try {
    await db
      .update(broadcastViews)
      .set({ clickedAt: now })
      .where(
        and(
          eq(broadcastViews.broadcastId, broadcastId),
          eq(broadcastViews.visitorId, visitorId)
        )
      );
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * List all broadcasts with SQL aggregation for admin dashboard
 */
export async function listAdminBroadcasts(): Promise<BroadcastAdminItem[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const allBroadcasts = await db
      .select({
        id: broadcasts.id,
        tenantId: broadcasts.tenantId,
        title: broadcasts.title,
        message: broadcasts.message,
        imageUrl: broadcasts.imageUrl,
        linkUrl: broadcasts.linkUrl,
        buttonText: broadcasts.buttonText,
        type: broadcasts.type,
        target: broadcasts.target,
        status: broadcasts.status,
        sentAt: broadcasts.sentAt,
        scheduledFor: broadcasts.scheduledFor,
        createdAt: broadcasts.createdAt,
        createdBy: broadcasts.createdBy,
      })
      .from(broadcasts)
      .orderBy(desc(broadcasts.createdAt))
      .limit(50);

    const broadcastIds = allBroadcasts.map((b) => b.id);
    const statsMap = new Map<string, { totalViews: number; totalDismissed: number; totalClicks: number }>();

    if (broadcastIds.length > 0) {
      const aggregatedViews = await db
        .select({
          broadcastId: broadcastViews.broadcastId,
          totalViews: sql<number>`count(*)`,
          totalDismissed: sql<number>`sum(case when ${broadcastViews.isDismissed} then 1 else 0 end)`,
          totalClicks: sql<number>`sum(case when ${broadcastViews.clickedAt} is not null then 1 else 0 end)`,
        })
        .from(broadcastViews)
        .where(inArray(broadcastViews.broadcastId, broadcastIds))
        .groupBy(broadcastViews.broadcastId);

      for (const row of aggregatedViews) {
        statsMap.set(row.broadcastId, {
          totalViews: Number(row.totalViews || 0),
          totalDismissed: Number(row.totalDismissed || 0),
          totalClicks: Number(row.totalClicks || 0),
        });
      }
    }

    return allBroadcasts.map((b) => {
      const st = statsMap.get(b.id) || { totalViews: 0, totalDismissed: 0, totalClicks: 0 };
      const viewRate = st.totalViews > 0 ? Math.round((st.totalDismissed / st.totalViews) * 100) : 0;
      const ctr = st.totalViews > 0 ? Math.round((st.totalClicks / st.totalViews) * 100) : 0;

      return {
        ...b,
        updatedAt: b.createdAt,
        type: b.type as any,
        target: b.target as any,
        status: b.status as any,
        stats: {
          totalViews: st.totalViews,
          totalDismissed: st.totalDismissed,
          viewRate,
          totalClicks: st.totalClicks,
          ctr,
        },
      };
    });
  } catch {
    return [];
  }
}

/**
 * Create a new broadcast notification
 */
export async function createAdminBroadcast(
  input: CreateBroadcastInput,
  createdBy = "Store Admin"
): Promise<BroadcastRecord> {
  const db = getDb();
  if (!db) {
    throw new Error("Database connection unavailable.");
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const record: BroadcastRecord = {
    id,
    tenantId: "default",
    title: input.title.trim(),
    message: input.message.trim(),
    imageUrl: input.imageUrl?.trim() || null,
    linkUrl: input.linkUrl?.trim() || null,
    buttonText: input.buttonText?.trim() || null,
    type: input.type || "info",
    target: input.target || "all",
    status: "sent",
    sentAt: now,
    scheduledFor: input.scheduledFor || null,
    createdAt: now,
    createdBy,
  };

  await db.insert(broadcasts).values(record);

  invalidateBroadcastCache();
  sendStorefrontInvalidation(["broadcast", "broadcasts"]).catch(() => {});

  return record;
}

/**
 * Update an existing broadcast notification
 */
export async function updateAdminBroadcast(
  id: string,
  input: Partial<CreateBroadcastInput> & { status?: string }
): Promise<BroadcastRecord | null> {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable.");

  const updateFields: Record<string, any> = {};
  if (input.title !== undefined) updateFields.title = input.title.trim();
  if (input.message !== undefined) updateFields.message = input.message.trim();
  if (input.imageUrl !== undefined) updateFields.imageUrl = input.imageUrl?.trim() || null;
  if (input.linkUrl !== undefined) updateFields.linkUrl = input.linkUrl?.trim() || null;
  if (input.buttonText !== undefined) updateFields.buttonText = input.buttonText?.trim() || null;
  if (input.type !== undefined) updateFields.type = input.type;
  if (input.target !== undefined) updateFields.target = input.target;
  if (input.status !== undefined) updateFields.status = input.status;
  if (input.scheduledFor !== undefined) updateFields.scheduledFor = input.scheduledFor || null;

  const rows = await db
    .update(broadcasts)
    .set(updateFields)
    .where(eq(broadcasts.id, id))
    .returning();

  if (rows.length === 0) return null;

  invalidateBroadcastCache();
  sendStorefrontInvalidation(["broadcast", "broadcasts"]).catch(() => {});

  return rows[0];
}

/**
 * Delete a broadcast
 */
export async function deleteAdminBroadcast(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  await db.delete(broadcastViews).where(eq(broadcastViews.broadcastId, id));
  const res = await db.delete(broadcasts).where(eq(broadcasts.id, id)).returning({ id: broadcasts.id });

  invalidateBroadcastCache();
  sendStorefrontInvalidation(["broadcast", "broadcasts"]).catch(() => {});

  return res.length > 0;
}

/**
 * Get single broadcast detail with stats
 */
export async function getAdminBroadcastDetail(id: string): Promise<BroadcastAdminItem | null> {
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select({
      id: broadcasts.id,
      tenantId: broadcasts.tenantId,
      title: broadcasts.title,
      message: broadcasts.message,
      imageUrl: broadcasts.imageUrl,
      linkUrl: broadcasts.linkUrl,
      buttonText: broadcasts.buttonText,
      type: broadcasts.type,
      target: broadcasts.target,
      status: broadcasts.status,
      sentAt: broadcasts.sentAt,
      scheduledFor: broadcasts.scheduledFor,
      createdAt: broadcasts.createdAt,
      createdBy: broadcasts.createdBy,
    })
    .from(broadcasts)
    .where(eq(broadcasts.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  const b = rows[0];

  const views = await db
    .select({
      isDismissed: broadcastViews.isDismissed,
      clickedAt: broadcastViews.clickedAt,
    })
    .from(broadcastViews)
    .where(eq(broadcastViews.broadcastId, id));

  const totalViews = views.length;
  const totalDismissed = views.filter((v) => v.isDismissed).length;
  const totalClicks = views.filter((v) => v.clickedAt !== null).length;
  const viewRate = totalViews > 0 ? Math.round((totalDismissed / totalViews) * 100) : 0;
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return {
    ...b,
    updatedAt: b.createdAt,
    type: b.type as any,
    target: b.target as any,
    status: b.status as any,
    stats: {
      totalViews,
      totalDismissed,
      viewRate,
      totalClicks,
      ctr,
    },
  };
}

/**
 * Overview metrics for broadcasts
 */
export async function getAdminBroadcastOverviewStats(): Promise<{
  totalSent: number;
  totalViews: number;
  totalDismissed: number;
  totalClicks: number;
  averageCtr: number;
}> {
  const list = await listAdminBroadcasts();
  const totalSent = list.length;
  const totalViews = list.reduce((acc, b) => acc + b.stats.totalViews, 0);
  const totalDismissed = list.reduce((acc, b) => acc + b.stats.totalDismissed, 0);
  const totalClicks = list.reduce((acc, b) => acc + b.stats.totalClicks, 0);
  const averageCtr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return {
    totalSent,
    totalViews,
    totalDismissed,
    totalClicks,
    averageCtr,
  };
}

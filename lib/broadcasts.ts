import { getDb } from "./db";
import { broadcasts, broadcastViews, type BroadcastRecord } from "./db/schema";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

export const VISITOR_COOKIE_NAME = "broadcast_visitor_id";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type BroadcastType = "info" | "promotion" | "announcement" | "warning";
export type BroadcastTarget = "all" | "registered" | "guest";
export type BroadcastStatus = "sent" | "draft" | "scheduled" | "archived";

export interface CreateBroadcastInput {
  title: string;
  message: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  type?: BroadcastType;
  target?: BroadcastTarget;
  scheduledFor?: string | null;
}

export interface BroadcastStats {
  totalViews: number;
  totalDismissed: number;
  viewRate: number; // percentage of views that were dismissed or interact
  totalClicks: number;
  ctr: number; // click through rate %
}

export interface BroadcastAdminItem extends BroadcastRecord {
  stats: BroadcastStats;
}

// In-memory fallback for environments without D1 binding
const memoryBroadcasts: BroadcastRecord[] = [];
const memoryViews: Array<{
  id: string;
  broadcastId: string;
  customerId: string | null;
  visitorId: string;
  isDismissed: boolean;
  viewedAt: string;
  clickedAt: string | null;
}> = [];

/**
 * Get active broadcast suitable for the current visitor
 */
export async function getActiveBroadcastForVisitor(
  visitorId: string,
  customerId?: string | null
): Promise<BroadcastRecord | null> {
  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    try {
      // Find candidate broadcasts
      const candidates = await db
        .select()
        .from(broadcasts)
        .where(
          and(
            eq(broadcasts.status, "sent")
          )
        )
        .orderBy(desc(broadcasts.createdAt))
        .limit(10);

      for (const b of candidates) {
        // Check schedule if present
        if (b.scheduledFor && b.scheduledFor > now) {
          continue;
        }

        // Check target audience
        if (b.target === "registered" && !customerId) {
          continue; // Only for logged-in customers
        }
        if (b.target === "guest" && customerId) {
          continue; // Only for guest visitors
        }

        // Check if visitor has dismissed this broadcast
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
          // Previously dismissed by this visitor with "Don't show again"
          continue;
        }

        return b;
      }
      return null;
    } catch (err) {
      console.error("[getActiveBroadcastForVisitor] D1 error:", err);
    }
  }

  // Fallback in-memory
  for (const b of memoryBroadcasts) {
    if (b.status !== "sent") continue;
    if (b.scheduledFor && b.scheduledFor > now) continue;
    if (b.target === "registered" && !customerId) continue;
    if (b.target === "guest" && customerId) continue;

    const existing = memoryViews.find(
      (v) => v.broadcastId === b.id && v.visitorId === visitorId
    );
    if (existing && existing.isDismissed) continue;
    return b;
  }

  return null;
}

/**
 * Record a broadcast view for a visitor
 */
export async function recordBroadcastView(
  broadcastId: string,
  visitorId: string,
  customerId?: string | null
): Promise<{ success: boolean }> {
  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    try {
      const existing = await db
        .select()
        .from(broadcastViews)
        .where(
          and(
            eq(broadcastViews.broadcastId, broadcastId),
            eq(broadcastViews.visitorId, visitorId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update customerId if now known
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
    } catch (err) {
      console.error("[recordBroadcastView] D1 error:", err);
    }
  }

  const existingMem = memoryViews.find(
    (v) => v.broadcastId === broadcastId && v.visitorId === visitorId
  );
  if (!existingMem) {
    memoryViews.push({
      id: crypto.randomUUID(),
      broadcastId,
      customerId: customerId || null,
      visitorId,
      isDismissed: false,
      viewedAt: now,
      clickedAt: null,
    });
  } else if (customerId && !existingMem.customerId) {
    existingMem.customerId = customerId;
  }

  return { success: true };
}

/**
 * Mark broadcast as dismissed for a visitor ("Don't show again")
 */
export async function dismissBroadcast(
  broadcastId: string,
  visitorId: string,
  customerId?: string | null
): Promise<{ success: boolean }> {
  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    try {
      const existing = await db
        .select()
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

      return { success: true };
    } catch (err) {
      console.error("[dismissBroadcast] D1 error:", err);
    }
  }

  const mem = memoryViews.find(
    (v) => v.broadcastId === broadcastId && v.visitorId === visitorId
  );
  if (mem) {
    mem.isDismissed = true;
    if (customerId) mem.customerId = customerId;
  } else {
    memoryViews.push({
      id: crypto.randomUUID(),
      broadcastId,
      customerId: customerId || null,
      visitorId,
      isDismissed: true,
      viewedAt: now,
      clickedAt: null,
    });
  }

  return { success: true };
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

  if (db) {
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
    } catch (err) {
      console.error("[recordBroadcastClick] D1 error:", err);
    }
  }

  const mem = memoryViews.find(
    (v) => v.broadcastId === broadcastId && v.visitorId === visitorId
  );
  if (mem) {
    mem.clickedAt = now;
  }

  return { success: true };
}

/**
 * List all broadcasts with stats for admin dashboard
 */
export async function listAdminBroadcasts(): Promise<BroadcastAdminItem[]> {
  const db = getDb();

  if (db) {
    try {
      const allBroadcasts = await db
        .select()
        .from(broadcasts)
        .orderBy(desc(broadcasts.createdAt));

      const allViews = await db
        .select({
          broadcastId: broadcastViews.broadcastId,
          isDismissed: broadcastViews.isDismissed,
          clickedAt: broadcastViews.clickedAt,
        })
        .from(broadcastViews);

      // Group views by broadcastId
      const viewsMap = new Map<
        string,
        { views: number; dismissed: number; clicks: number }
      >();

      for (const v of allViews) {
        const curr = viewsMap.get(v.broadcastId) || { views: 0, dismissed: 0, clicks: 0 };
        curr.views += 1;
        if (v.isDismissed) curr.dismissed += 1;
        if (v.clickedAt) curr.clicks += 1;
        viewsMap.set(v.broadcastId, curr);
      }

      return allBroadcasts.map((b) => {
        const st = viewsMap.get(b.id) || { views: 0, dismissed: 0, clicks: 0 };
        const viewRate = st.views > 0 ? Math.round((st.dismissed / st.views) * 100) : 0;
        const ctr = st.views > 0 ? Math.round((st.clicks / st.views) * 100) : 0;

        return {
          ...b,
          stats: {
            totalViews: st.views,
            totalDismissed: st.dismissed,
            viewRate,
            totalClicks: st.clicks,
            ctr,
          },
        };
      });
    } catch (err) {
      console.error("[listAdminBroadcasts] D1 error:", err);
    }
  }

  // Memory fallback
  return memoryBroadcasts.map((b) => {
    const bViews = memoryViews.filter((v) => v.broadcastId === b.id);
    const totalViews = bViews.length;
    const totalDismissed = bViews.filter((v) => v.isDismissed).length;
    const totalClicks = bViews.filter((v) => v.clickedAt !== null).length;
    const viewRate = totalViews > 0 ? Math.round((totalDismissed / totalViews) * 100) : 0;
    const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

    return {
      ...b,
      stats: {
        totalViews,
        totalDismissed,
        viewRate,
        totalClicks,
        ctr,
      },
    };
  });
}

/**
 * Create a new broadcast notification
 */
export async function createAdminBroadcast(
  input: CreateBroadcastInput,
  createdBy = "Store Admin"
): Promise<BroadcastRecord> {
  const db = getDb();
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

  if (db) {
    await db.insert(broadcasts).values(record);
    return record;
  }

  memoryBroadcasts.unshift(record);
  return record;
}

/**
 * Get single broadcast detail with stats
 */
export async function getAdminBroadcastDetail(id: string): Promise<BroadcastAdminItem | null> {
  const db = getDb();

  if (db) {
    const rows = await db.select().from(broadcasts).where(eq(broadcasts.id, id)).limit(1);
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
      stats: {
        totalViews,
        totalDismissed,
        viewRate,
        totalClicks,
        ctr,
      },
    };
  }

  const mem = memoryBroadcasts.find((b) => b.id === id);
  if (!mem) return null;

  const views = memoryViews.filter((v) => v.broadcastId === id);
  const totalViews = views.length;
  const totalDismissed = views.filter((v) => v.isDismissed).length;
  const totalClicks = views.filter((v) => v.clickedAt !== null).length;
  const viewRate = totalViews > 0 ? Math.round((totalDismissed / totalViews) * 100) : 0;
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return {
    ...mem,
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
 * Delete a broadcast
 */
export async function deleteAdminBroadcast(id: string): Promise<boolean> {
  const db = getDb();

  if (db) {
    await db.delete(broadcastViews).where(eq(broadcastViews.broadcastId, id));
    await db.delete(broadcasts).where(eq(broadcasts.id, id));
    return true;
  }

  const idx = memoryBroadcasts.findIndex((b) => b.id === id);
  if (idx !== -1) {
    memoryBroadcasts.splice(idx, 1);
    for (let i = memoryViews.length - 1; i >= 0; i--) {
      if (memoryViews[i].broadcastId === id) {
        memoryViews.splice(i, 1);
      }
    }
    return true;
  }
  return false;
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

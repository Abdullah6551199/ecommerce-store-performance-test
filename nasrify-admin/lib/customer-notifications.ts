import { getDb, notifications, type NotificationRecord } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * ==============================================================================
 * Customer In-App Notifications Service
 * ==============================================================================
 */

export interface CreateNotificationInput {
  customerId: string;
  type:
    | "order_status"
    | "review_approved"
    | "coupon"
    | "welcome"
    | "promotion"
    | "stock_back"
    | "custom";
  title: string;
  message: string;
  link?: string | null;
}

// In-memory fallback
const memoryNotifications: NotificationRecord[] = [];

/**
 * Create a new notification for a customer
 */
export async function createCustomerNotification(
  input: CreateNotificationInput
): Promise<NotificationRecord> {
  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const newRecord: NotificationRecord = {
    id,
    customerId: input.customerId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link || null,
    isRead: false,
    createdAt,
  };

  if (db) {
    try {
      await db.insert(notifications).values({
        id,
        customerId: input.customerId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        isRead: false,
        createdAt,
      });
      return newRecord;
    } catch (err) {
      console.warn("[Notifications] Failed to insert notification in D1:", err);
    }
  }

  memoryNotifications.unshift(newRecord);
  return newRecord;
}

/**
 * Get paginated notifications for a customer with optional filter
 */
export async function getCustomerNotifications(
  customerId: string,
  options?: {
    page?: number;
    limit?: number;
    filter?: "all" | "unread" | "read";
  }
): Promise<{
  notifications: NotificationRecord[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}> {
  const db = getDb();
  const page = Math.max(1, options?.page || 1);
  const limit = Math.max(1, Math.min(100, options?.limit || 20));
  const offset = (page - 1) * limit;
  const filter = options?.filter || "all";

  if (db) {
    try {
      // Build conditions
      const conditions = [eq(notifications.customerId, customerId)];
      if (filter === "unread") {
        conditions.push(eq(notifications.isRead, false));
      } else if (filter === "read") {
        conditions.push(eq(notifications.isRead, true));
      }

      // Count total for this filter
      const countRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...conditions));
      const total = Number(countRes[0]?.count || 0);

      // Count unread total
      const unreadRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.customerId, customerId),
            eq(notifications.isRead, false)
          )
        );
      const unreadCount = Number(unreadRes[0]?.count || 0);

      // Fetch notifications
      const rows = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        notifications: rows,
        total,
        unreadCount,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    } catch (err) {
      console.warn("[Notifications] Query notifications failed in D1:", err);
    }
  }

  // Fallback
  const userNotifs = memoryNotifications.filter((n) => n.customerId === customerId);
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  let filtered = userNotifs;
  if (filter === "unread") {
    filtered = userNotifs.filter((n) => !n.isRead);
  } else if (filter === "read") {
    filtered = userNotifs.filter((n) => n.isRead);
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    notifications: paginated,
    total,
    unreadCount,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Get unread notification count for badge display
 */
export async function getUnreadNotificationCount(customerId: string): Promise<number> {
  const db = getDb();
  if (db) {
    try {
      const res = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.customerId, customerId),
            eq(notifications.isRead, false)
          )
        );
      return Number(res[0]?.count || 0);
    } catch (err) {
      console.warn("[Notifications] Failed to count unread in D1:", err);
    }
  }

  return memoryNotifications.filter((n) => n.customerId === customerId && !n.isRead).length;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  customerId: string,
  notificationId: string
): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.customerId, customerId)
          )
        );
      return true;
    } catch (err) {
      console.warn("[Notifications] Failed to mark read in D1:", err);
      return false;
    }
  }

  const found = memoryNotifications.find(
    (n) => n.id === notificationId && n.customerId === customerId
  );
  if (found) {
    found.isRead = true;
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read for a customer
 */
export async function markAllNotificationsRead(customerId: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.customerId, customerId),
            eq(notifications.isRead, false)
          )
        );
      return true;
    } catch (err) {
      console.warn("[Notifications] Failed to mark all read in D1:", err);
      return false;
    }
  }

  for (const n of memoryNotifications) {
    if (n.customerId === customerId) {
      n.isRead = true;
    }
  }
  return true;
}

/**
 * Delete a single notification
 */
export async function deleteNotification(
  customerId: string,
  notificationId: string
): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.customerId, customerId)
          )
        );
      return true;
    } catch (err) {
      console.warn("[Notifications] Failed to delete notification in D1:", err);
      return false;
    }
  }

  const idx = memoryNotifications.findIndex(
    (n) => n.id === notificationId && n.customerId === customerId
  );
  if (idx !== -1) {
    memoryNotifications.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Delete all read notifications for a customer
 */
export async function clearReadNotifications(customerId: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.customerId, customerId),
            eq(notifications.isRead, true)
          )
        );
      return true;
    } catch (err) {
      console.warn("[Notifications] Failed to clear read in D1:", err);
      return false;
    }
  }

  for (let i = memoryNotifications.length - 1; i >= 0; i--) {
    if (memoryNotifications[i].customerId === customerId && memoryNotifications[i].isRead) {
      memoryNotifications.splice(i, 1);
    }
  }
  return true;
}

import React from "react";
import { eq, or, like, and } from "drizzle-orm";
import { getDb, orders, orderItems } from "@/lib/db";
import { getAppSettings } from "@/lib/apps/installed";
import { sendStorefrontInvalidation } from "@/lib/storefront-invalidation";
import { createCustomerNotification } from "@/lib/customer-notifications";
import {
  DEFAULT_ORDER_TRACKING_SETTINGS,
  type OrderTrackingAppSettings,
  type TrackedOrder,
  type TrackedOrderItem,
} from "../shared/types";

// 20-second in-memory micro-cache for high-traffic order tracking lookups
interface CacheEntry {
  data: TrackedOrder | null;
  expiresAt: number;
}

const trackingCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 20 * 1000;

export function invalidateTrackingCache(orderIdOrCode?: string): void {
  if (orderIdOrCode) {
    const clean = orderIdOrCode.trim().toLowerCase().replace(/^#/, "").replace(/^apx-/i, "");
    for (const key of trackingCache.keys()) {
      if (key.includes(clean)) {
        trackingCache.delete(key);
      }
    }
  } else {
    trackingCache.clear();
  }
}

/**
 * Retrieve Order Tracking App Settings
 */
export const getOrderTrackingSettings = React.cache(
  async (): Promise<OrderTrackingAppSettings> => {
    try {
      const saved = await getAppSettings<OrderTrackingAppSettings>("order-tracking");
      return {
        ...DEFAULT_ORDER_TRACKING_SETTINGS,
        ...saved,
      };
    } catch {
      return DEFAULT_ORDER_TRACKING_SETTINGS;
    }
  }
);

/**
 * Public order tracking lookup by order ID, prefix, tracking number, and optional email/phone.
 * Date-bounded, LIMIT enforced, explicit columns (no SELECT *), 20s micro-cache.
 */
export const trackOrder = React.cache(
  async (identifier: string, contact?: string): Promise<TrackedOrder | null> => {
    if (!identifier || typeof identifier !== "string") return null;
    const cleanId = identifier.trim().replace(/^#/, "").replace(/^APX-/i, "");
    if (!cleanId) return null;

    const cacheKey = `track:${cleanId.toLowerCase()}:${(contact || "").trim().toLowerCase()}`;
    const cached = trackingCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const db = getDb();
    if (!db) {
      return null;
    }

    try {
      // 1. Find the order with explicit projection
      let orderRows = await db
        .select({
          id: orders.id,
          status: orders.status,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          courierName: orders.courierName,
          trackingNumber: orders.trackingNumber,
          estimatedDelivery: orders.estimatedDelivery,
          statusNotes: orders.statusNotes,
          customerName: orders.customerName,
          phone: orders.phone,
          email: orders.email,
          address: orders.address,
          city: orders.city,
          subtotal: orders.subtotal,
          shipping: orders.shipping,
          discountAmount: orders.discountAmount,
          discountCode: orders.discountCode,
          total: orders.total,
          paymentMethod: orders.paymentMethod,
          customerId: orders.customerId,
        })
        .from(orders)
        .where(eq(orders.id, cleanId))
        .limit(1);

      if (orderRows.length === 0) {
        // Match by prefix or courier tracking number
        orderRows = await db
          .select({
            id: orders.id,
            status: orders.status,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
            courierName: orders.courierName,
            trackingNumber: orders.trackingNumber,
            estimatedDelivery: orders.estimatedDelivery,
            statusNotes: orders.statusNotes,
            customerName: orders.customerName,
            phone: orders.phone,
            email: orders.email,
            address: orders.address,
            city: orders.city,
            subtotal: orders.subtotal,
            shipping: orders.shipping,
            discountAmount: orders.discountAmount,
            discountCode: orders.discountCode,
            total: orders.total,
            paymentMethod: orders.paymentMethod,
            customerId: orders.customerId,
          })
          .from(orders)
          .where(
            or(
              like(orders.id, `${cleanId}%`),
              like(orders.id, `%${cleanId}%`),
              eq(orders.trackingNumber, cleanId)
            )
          )
          .limit(1);
      }

      if (orderRows.length === 0) {
        trackingCache.set(cacheKey, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
        return null;
      }

      const targetOrder = orderRows[0];

      // Optional security verification if contact was provided
      if (contact && contact.trim()) {
        const cleanContact = contact.trim().toLowerCase();
        const phoneMatch = targetOrder.phone && targetOrder.phone.toLowerCase().includes(cleanContact);
        const emailMatch = targetOrder.email && targetOrder.email.toLowerCase() === cleanContact;
        if (!phoneMatch && !emailMatch) {
          trackingCache.set(cacheKey, { data: null, expiresAt: Date.now() + CACHE_TTL_MS });
          return null;
        }
      }

      // 2. Fetch order items with explicit projection
      const itemsRows = await db
        .select({
          id: orderItems.id,
          productName: orderItems.productName,
          variantName: orderItems.variantName,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          lineTotal: orderItems.lineTotal,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, targetOrder.id))
        .limit(50);

      const result: TrackedOrder = {
        ...targetOrder,
        items: itemsRows,
      };

      trackingCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    } catch {
      return null;
    }
  }
);

/**
 * Update fulfillment status and tracking metadata with non-blocking customer notifications
 * and cross-worker cache invalidation.
 */
export async function updateOrderTrackingStatus(
  orderId: string,
  newStatus: string,
  trackingDetails?: {
    courierName?: string | null;
    trackingNumber?: string | null;
    estimatedDelivery?: string | null;
    statusNotes?: string | null;
  },
  options?: {
    sendNotification?: boolean;
  }
): Promise<TrackedOrder> {
  const db = getDb();
  if (!db) {
    throw new Error("Database connection unavailable.");
  }

  const now = new Date().toISOString();
  const updateFields: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
  };

  if (trackingDetails) {
    if (trackingDetails.courierName !== undefined) updateFields.courierName = trackingDetails.courierName;
    if (trackingDetails.trackingNumber !== undefined) updateFields.trackingNumber = trackingDetails.trackingNumber;
    if (trackingDetails.estimatedDelivery !== undefined) updateFields.estimatedDelivery = trackingDetails.estimatedDelivery;
    if (trackingDetails.statusNotes !== undefined) updateFields.statusNotes = trackingDetails.statusNotes;
  }

  const updatedRows = await db
    .update(orders)
    .set(updateFields)
    .where(eq(orders.id, orderId))
    .returning({
      id: orders.id,
      status: orders.status,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      courierName: orders.courierName,
      trackingNumber: orders.trackingNumber,
      estimatedDelivery: orders.estimatedDelivery,
      statusNotes: orders.statusNotes,
      customerName: orders.customerName,
      phone: orders.phone,
      email: orders.email,
      address: orders.address,
      city: orders.city,
      subtotal: orders.subtotal,
      shipping: orders.shipping,
      discountAmount: orders.discountAmount,
      discountCode: orders.discountCode,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      customerId: orders.customerId,
    });

  if (updatedRows.length === 0) {
    throw new Error(`Order ${orderId} not found.`);
  }

  const updatedOrder = updatedRows[0];

  // Invalidate local micro-cache
  invalidateTrackingCache(orderId);
  if (updatedOrder.trackingNumber) {
    invalidateTrackingCache(updatedOrder.trackingNumber);
  }

  // Cross-worker cache invalidation (non-blocking)
  sendStorefrontInvalidation(["order-tracking", `order_${orderId}`, "orders"]).catch(() => {});

  // Send customer notification if enabled (non-blocking)
  const shouldNotify = options?.sendNotification ?? true;
  if (shouldNotify && updatedOrder.customerId) {
    const orderShortId = updatedOrder.id.slice(0, 8).toUpperCase();
    const title = `Order #${orderShortId} Status: ${newStatus.replace(/_/g, " ").toUpperCase()}`;
    let message = `Your order status has been updated to ${newStatus.replace(/_/g, " ")}.`;

    if (newStatus === "shipped" && updatedOrder.trackingNumber) {
      message = `Your order has shipped via ${updatedOrder.courierName || "courier"}. Tracking: ${updatedOrder.trackingNumber}`;
    }

    createCustomerNotification({
      customerId: updatedOrder.customerId,
      type: "order_status",
      title,
      message,
      link: `/account/orders/${orderId}`,
    }).catch(() => {});
  }

  return updatedOrder;
}

import { z } from "zod";
import { eq, desc, and, sql, like, or, inArray } from "drizzle-orm";
import {
  getDb,
  orders,
  orderItems,
  products,
  productVariants,
  carts,
  customers,
  type OrderRecord,
  type OrderItemRecord,
} from "./db";

export type { OrderRecord, OrderItemRecord };
import { getCartWithItems, clearCart, getOrCreateCart, memoryCarts, type CartSummary } from "./cart";
import { memoryProducts } from "./products";
import { validateCoupon, recordCouponUsage } from "./coupons";
import { createCustomerNotification } from "./customer-notifications";
import { detectTaxRate, calculateTax, getTaxSettings } from "./tax";
import { calculateShipping } from "./shipping";

// Validation Schemas
export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .regex(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number format"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(5, "Delivery address must be at least 5 characters"),
  city: z.string().trim().min(2, "City is required"),
  country: z.string().trim().optional().default("PK"),
  state: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional(),
  couponCode: z.string().trim().optional().or(z.literal("")),
  paymentMethod: z.literal("cod").default("cod"),
  customerId: z.string().trim().optional().nullable(),
  items: z.array(orderItemInputSchema).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  courierName: z.string().trim().optional().nullable(),
  trackingNumber: z.string().trim().optional().nullable(),
  estimatedDelivery: z.string().trim().optional().nullable(),
  statusNotes: z.string().trim().optional().nullable(),
});

export interface OrderWithItems extends OrderRecord {
  items: OrderItemRecord[];
}

// In-memory fallback stores for local Next.js dev server without D1 binding
const memoryOrders: OrderRecord[] = [];
const memoryOrderItems: OrderItemRecord[] = [];

/**
 * Creates an order directly from the current client cart or guest cart.
 * Strictly performs server-side price recalculation and stock validation against D1.
 * Client-submitted prices are completely ignored; D1 is the single source of truth.
 */
export async function createOrderFromCart(
  input: CreateOrderInput,
  cartSessionId?: string,
  userId?: string
): Promise<OrderWithItems> {
  // Validate schema
  const validated = createOrderSchema.parse(input);

  // 1. Authoritatively resolve items to process: from client payload if provided, otherwise from D1 cart
  let rawItems: {
    productId: string;
    variantId: string | null;
    quantity: number;
  }[] = [];
  let legacyCartIdToClear: string | null = null;

  if (validated.items && validated.items.length > 0) {
    // Consolidate duplicate item entries if any
    const consolidatedMap = new Map<string, { productId: string; variantId: string | null; quantity: number }>();
    for (const it of validated.items) {
      const key = `${it.productId}_${it.variantId || "default"}`;
      const existing = consolidatedMap.get(key);
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        consolidatedMap.set(key, {
          productId: it.productId,
          variantId: it.variantId || null,
          quantity: it.quantity,
        });
      }
    }
    rawItems = Array.from(consolidatedMap.values());
  } else {
    // Legacy server-cart resolution fallback
    let cartSummary: CartSummary | null = null;
    if (cartSessionId || userId) {
      const cart = await getOrCreateCart(cartSessionId, userId);
      cartSummary = await getCartWithItems(cart.id);
      legacyCartIdToClear = cart.id;
    } else {
      cartSummary = await getCartWithItems("");
    }
    if (cartSummary && cartSummary.items.length > 0) {
      rawItems = cartSummary.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      }));
    }
  }

  if (rawItems.length === 0) {
    throw new Error("Your cart is empty. Please add items before checking out.");
  }

  const db = getDb();
  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();

  // 2. Server-side price recalculation and stock validation against D1
  let calculatedSubtotal = 0;
  const verifiedItems: {
    id: string;
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];

  // Batch fetch products and variants to eliminate N+1 queries
  let prodMap = new Map<string, any>();
  let varMap = new Map<string, any>();

  const productIds = Array.from(new Set(rawItems.map((i) => i.productId)));
  const variantIds = Array.from(
    new Set(rawItems.map((i) => i.variantId).filter((v): v is string => Boolean(v)))
  );

  if (db) {
    const [prodRows, varRows] = await Promise.all([
      db.select().from(products).where(inArray(products.id, productIds)),
      variantIds.length > 0
        ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds))
        : Promise.resolve([]),
    ]);

    prodMap = new Map(prodRows.map((p) => [p.id, p]));
    varMap = new Map(varRows.map((v) => [v.id, v]));
  } else {
    for (const pid of productIds) {
      const p = memoryProducts.find((mp) => mp.id === pid);
      if (p) prodMap.set(pid, p);
    }
  }

  for (const item of rawItems) {
    const prod = prodMap.get(item.productId);
    if (!prod) {
      throw new Error(`Product is no longer available.`);
    }

    if (prod.status !== "published" || prod.stockStatus === "out_of_stock") {
      throw new Error(`Product "${prod.name}" is currently unavailable for purchase.`);
    }

    let authoritativeUnitPrice = Number(prod.salePrice ?? prod.price);
    let productName = prod.name;
    let variantName: string | null = null;

    if (item.variantId) {
      const variant = varMap.get(item.variantId);
      if (!variant || variant.productId !== item.productId) {
        throw new Error(`Selected variant for "${prod.name}" is no longer available.`);
      }

      // Check stock
      if (prod.trackInventory && variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Available stock: ${variant.stock}`
        );
      }

      authoritativeUnitPrice = Number(variant.salePrice ?? variant.price);
      if (variant.options) {
        try {
          const opts = typeof variant.options === "string" ? JSON.parse(variant.options) : variant.options;
          variantName = Object.values(opts).join(" / ");
        } catch {
          variantName = null;
        }
      }
    } else {
      // Base product stock check
      if (prod.trackInventory && prod.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Available stock: ${prod.stockQuantity}`
        );
      }
      authoritativeUnitPrice = Number(prod.salePrice ?? prod.price);
    }

    const lineTotal = Math.round(authoritativeUnitPrice * item.quantity * 100) / 100;
    calculatedSubtotal += lineTotal;

    verifiedItems.push({
      id: crypto.randomUUID(),
      productId: item.productId,
      variantId: item.variantId,
      productName,
      variantName,
      quantity: item.quantity,
      unitPrice: authoritativeUnitPrice,
      lineTotal,
    });
  }

  calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
  
  // Authoritative Shipping Calculation via Shipping Zones
  const destCountry = validated.country || "PK";
  const destState = validated.state || null;
  const destCity = validated.city || null;

  const shippingResult = await calculateShipping(destCountry, destState, calculatedSubtotal);
  let shipping = shippingResult.shippingCost;

  // Authoritative Coupon Validation
  let discountAmount = 0;
  let appliedDiscountCode: string | null = null;
  let appliedDiscountType: string | null = null;
  let verifiedCouponId: string | null = null;

  if (validated.couponCode) {
    const couponValidation = await validateCoupon({
      code: validated.couponCode,
      cartItems: rawItems.map((i) => {
        const prod = prodMap.get(i.productId);
        return {
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice: prod ? Number(prod.salePrice ?? prod.price) : 0,
          categoryId: prod?.categoryId || null,
        };
      }),
      subtotal: calculatedSubtotal,
      customerEmail: validated.email || null,
    });

    if (!couponValidation.valid) {
      throw new Error(`Coupon error: ${couponValidation.message}`);
    }

    if (couponValidation.coupon) {
      verifiedCouponId = couponValidation.coupon.id;
      appliedDiscountCode = couponValidation.coupon.code;
      appliedDiscountType = couponValidation.coupon.type;

      if (couponValidation.freeShipping) {
        shipping = 0;
      }
      discountAmount = couponValidation.discount;
    }
  }

  // Authoritative Tax Calculation via Tax Rates & Global Settings
  const taxSettingsData = await getTaxSettings();
  const taxRateObj = await detectTaxRate(destCountry, destState, destCity);

  let taxAmount = 0;
  let taxRateVal = 0;
  let taxLabelVal: string | null = null;
  let taxTypeVal: "inclusive" | "exclusive" = "exclusive";

  if (taxRateObj && taxSettingsData.isEnabled) {
    taxRateVal = taxRateObj.rate;
    taxLabelVal = taxRateObj.label;
    taxTypeVal = taxRateObj.taxType;

    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount) +
      (taxSettingsData.applyToShipping ? shipping : 0);

    const taxCalc = calculateTax(Math.max(0, taxableAmount), taxRateVal, taxTypeVal);
    taxAmount = taxCalc.taxAmount;
  }

  const total = Math.max(
    0,
    Math.round(
      (calculatedSubtotal - discountAmount + shipping + (taxTypeVal === "exclusive" ? taxAmount : 0)) * 100
    ) / 100
  );

  let resolvedCustomerId: string | null = validated.customerId || userId || null;
  if (!resolvedCustomerId && validated.email && db) {
    try {
      const match = await db
        .select({ id: customers.id })
        .from(customers)
        .where(sql`LOWER(${customers.email}) = ${validated.email.toLowerCase().trim()}`)
        .limit(1);
      if (match.length > 0) {
        resolvedCustomerId = match[0].id;
      }
    } catch {}
  }

  const orderRecord: OrderRecord = {
    id: orderId,
    customerId: resolvedCustomerId,
    customerName: validated.customerName,
    phone: validated.phone,
    email: validated.email || null,
    address: validated.address,
    city: validated.city,
    country: destCountry,
    state: destState,
    taxAmount,
    taxRate: taxRateVal,
    taxLabel: taxLabelVal,
    shippingZoneId: shippingResult.zone?.id || null,
    notes: validated.notes || null,
    subtotal: calculatedSubtotal,
    shipping,
    discountAmount,
    discountCode: appliedDiscountCode,
    discountType: appliedDiscountType,
    total,
    paymentMethod: "cod",
    status: "pending",
    hasReview: 0,
    courierName: null,
    trackingNumber: null,
    estimatedDelivery: null,
    statusNotes: null,
    createdAt: now,
    updatedAt: now,
  };

  const createdOrderItems: OrderItemRecord[] = verifiedItems.map((vi) => ({
    id: vi.id,
    orderId,
    productId: vi.productId,
    variantId: vi.variantId,
    productName: vi.productName,
    variantName: vi.variantName,
    quantity: vi.quantity,
    unitPrice: vi.unitPrice,
    lineTotal: vi.lineTotal,
    createdAt: now,
  }));

  if (db) {
    // 3. Insert order record
    await db.insert(orders).values(orderRecord);

    // 4. Insert order items
    for (const oi of createdOrderItems) {
      await db.insert(orderItems).values(oi);
    }

    // 5. Decrement inventory if trackInventory is active
    for (const item of verifiedItems) {
      try {
        if (item.variantId) {
          await db
            .update(productVariants)
            .set({
              stock: sql`MAX(0, ${productVariants.stock} - ${item.quantity})`,
            })
            .where(eq(productVariants.id, item.variantId));
        }

        await db
          .update(products)
          .set({
            stockQuantity: sql`MAX(0, ${products.stockQuantity} - ${item.quantity})`,
            updatedAt: now,
          })
          .where(eq(products.id, item.productId));
      } catch (stockErr) {
        console.warn("Error updating inventory for item:", item.productId, stockErr);
      }
    }

    // 6. Record coupon usage if coupon was applied
    if (verifiedCouponId) {
      try {
        await recordCouponUsage({
          couponId: verifiedCouponId,
          orderId,
          discountAmount,
          customerEmail: validated.email || null,
          customerId: userId || null,
        });
      } catch (couponErr) {
        console.warn("Failed to record coupon usage in D1:", couponErr);
      }
    }

    // 7. Clear legacy cart items if present
    if (legacyCartIdToClear) {
      try {
        await clearCart(legacyCartIdToClear);
        await db
          .update(carts)
          .set({ status: "converted", updatedAt: now })
          .where(eq(carts.id, legacyCartIdToClear));
      } catch {}
    }
  } else {
    // In-memory fallback
    memoryOrders.unshift(orderRecord);
    memoryOrderItems.push(...createdOrderItems);
    if (legacyCartIdToClear) {
      try {
        await clearCart(legacyCartIdToClear);
      } catch {}
    }
    for (const item of verifiedItems) {
      const p = memoryProducts.find((mp) => mp.id === item.productId);
      if (p && p.trackInventory) {
        p.stockQuantity = Math.max(0, p.stockQuantity - item.quantity);
      }
    }
  }

  // Send In-App Notification if customer is identified
  if (resolvedCustomerId) {
    try {
      await createCustomerNotification({
        customerId: resolvedCustomerId,
        type: "order_status",
        title: `Order #${orderId.slice(0, 8).toUpperCase()} Confirmed`,
        message: `Thank you for your order! Total: Rs. ${total.toFixed(2)}. We will notify you when it ships.`,
        link: `/account/orders/${orderId}`,
      });
    } catch (notifErr) {
      console.warn("[Orders] Could not send order confirmation notification:", notifErr);
    }
  }

  return {
    ...orderRecord,
    items: createdOrderItems,
  };
}

/**
 * Get an order by ID (with items) for storefront confirmation and order tracking
 * Resiliently handles full UUID, short 8-character ID prefix (e.g. #APX-XXXX), or tracking number
 */
export async function getStorefrontOrder(orderIdOrCode: string): Promise<OrderWithItems | null> {
  if (!orderIdOrCode || typeof orderIdOrCode !== "string") return null;
  const clean = orderIdOrCode.trim().replace(/^#/, "").replace(/^APX-/i, "");
  if (!clean) return null;

  const db = getDb();
  if (db) {
    // 1. Try exact match by ID
    let orderRows = await db.select().from(orders).where(eq(orders.id, clean)).limit(1);

    // 2. If not found, try matching by prefix or tracking number
    if (orderRows.length === 0) {
      orderRows = await db
        .select()
        .from(orders)
        .where(
          or(
            like(orders.id, `${clean}%`),
            like(orders.id, `%${clean}%`),
            eq(orders.trackingNumber, clean)
          )
        )
        .limit(1);
    }

    if (orderRows.length === 0) return null;

    const targetOrder = orderRows[0];
    const itemsRows = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, targetOrder.id));

    return {
      ...targetOrder,
      items: itemsRows,
    };
  }

  // Memory fallback
  const found = memoryOrders.find(
    (o) =>
      o.id.toLowerCase() === clean.toLowerCase() ||
      o.id.toLowerCase().startsWith(clean.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase() === clean.toLowerCase())
  );
  if (!found) return null;
  const items = memoryOrderItems.filter((oi) => oi.orderId === found.id);
  return {
    ...found,
    items,
  };
}

/**
 * List all orders for the Admin panel with filtering and search
 */
export async function getAllAdminOrders(options?: {
  status?: string;
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  orders: (OrderRecord & { itemCount: number })[];
  totalCount: number;
}> {
  const db = getDb();
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  const statusFilter = options?.status && options.status !== "all" ? options.status : null;
  const sourceFilter = options?.source && options.source !== "all" ? options.source : null;
  const searchFilter = options?.search?.trim() ? options.search.trim().toLowerCase() : null;

  if (db) {
    const conditions = [];

    if (statusFilter) {
      conditions.push(eq(orders.status, statusFilter as OrderStatus));
    }

    if (sourceFilter) {
      conditions.push(eq(orders.source, sourceFilter));
    }

    if (searchFilter) {
      conditions.push(
        or(
          like(orders.id, `%${searchFilter}%`),
          like(orders.customerName, `%${searchFilter}%`),
          like(orders.phone, `%${searchFilter}%`),
          like(orders.city, `%${searchFilter}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause),
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    // Fetch item counts ONLY for the current page's orders (avoids full table scan)
    const orderIds = rows.map((r) => r.id);
    const itemCountsMap = new Map<string, number>();

    if (orderIds.length > 0) {
      const items = await db
        .select({
          orderId: orderItems.orderId,
          totalQty: sql<number>`sum(${orderItems.quantity})`,
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds))
        .groupBy(orderItems.orderId);

      for (const it of items) {
        itemCountsMap.set(it.orderId, Number(it.totalQty || 0));
      }
    }

    const enrichedOrders = rows.map((order) => ({
      ...order,
      itemCount: itemCountsMap.get(order.id) || 1,
    }));

    return {
      orders: enrichedOrders,
      totalCount,
    };
  }

  // Memory fallback
  let filtered = [...memoryOrders];
  if (statusFilter) {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }
  if (sourceFilter) {
    filtered = filtered.filter((o) => (o as any).source === sourceFilter);
  }
  if (searchFilter) {
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(searchFilter) ||
        o.customerName.toLowerCase().includes(searchFilter) ||
        o.phone.toLowerCase().includes(searchFilter) ||
        o.city.toLowerCase().includes(searchFilter)
    );
  }

  const totalCount = filtered.length;
  const paginated = filtered.slice(offset, offset + limit).map((order) => {
    const items = memoryOrderItems.filter((i) => i.orderId === order.id);
    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
    return {
      ...order,
      itemCount: itemCount || 1,
    };
  });

  return {
    orders: paginated,
    totalCount,
  };
}

/**
 * Get detailed order for Admin review
 */
export async function getAdminOrderById(orderId: string): Promise<OrderWithItems | null> {
  return getStorefrontOrder(orderId);
}

/**
 * Helper to trigger in-app customer notifications when order status changes
 */
export async function onOrderStatusChange(
  orderId: string,
  newStatus: OrderStatus,
  details?: { courierName?: string | null; trackingNumber?: string | null }
): Promise<void> {
  const db = getDb();
  let customerId: string | null = null;
  let orderShortId = orderId.slice(0, 8).toUpperCase();

  if (db) {
    try {
      const found = await db
        .select({ customerId: orders.customerId, id: orders.id })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);
      if (found.length > 0) {
        customerId = found[0].customerId;
        orderShortId = found[0].id.slice(0, 8).toUpperCase();
      }
    } catch (err) {
      console.warn("[Orders] Failed to query customer for order status notification:", err);
    }
  } else {
    const memOrder = memoryOrders.find((o) => o.id === orderId);
    if (memOrder) {
      customerId = memOrder.customerId;
    }
  }

  if (!customerId) return;

  const statusDisplayMap: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  };

  const statusTitle = `Your order #${orderShortId} is now ${statusDisplayMap[newStatus] || newStatus}`;
  let statusMessage = `Your order status has been updated to ${statusDisplayMap[newStatus] || newStatus}.`;

  switch (newStatus) {
    case "confirmed":
      statusMessage = "Your order has been confirmed and is being prepared.";
      break;
    case "processing":
      statusMessage = "We're preparing your order for shipment.";
      break;
    case "shipped":
      statusMessage = details?.trackingNumber
        ? `Good news! Your order has been shipped via ${details.courierName || "courier"} (Tracking #${details.trackingNumber}).`
        : "Good news! Your order has been shipped.";
      break;
    case "out_for_delivery":
      statusMessage = "Your order is out for delivery. Please be available.";
      break;
    case "delivered":
      statusMessage = "Your order has been delivered. Enjoy!";
      break;
    case "cancelled":
      statusMessage = "Your order has been cancelled.";
      break;
    case "returned":
      statusMessage = "Your order has been marked as returned.";
      break;
  }

  try {
    await createCustomerNotification({
      customerId,
      type: "order_status",
      title: statusTitle,
      message: statusMessage,
      link: `/account/orders/${orderId}`,
    });
  } catch (err) {
    console.warn(`[Orders] Failed to send order status notification for ${orderId}:`, err);
  }
}

/**
 * Update an order's fulfillment status and optional tracking metadata
 */
export async function updateAdminOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  trackingDetails?: {
    courierName?: string | null;
    trackingNumber?: string | null;
    estimatedDelivery?: string | null;
    statusNotes?: string | null;
  }
): Promise<OrderRecord> {
  const db = getDb();
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

  if (db) {
    const updated = await db
      .update(orders)
      .set(updateFields)
      .where(eq(orders.id, orderId))
      .returning();

    if (updated.length === 0) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    const updatedOrder = updated[0];
    await onOrderStatusChange(orderId, newStatus, {
      courierName: updatedOrder.courierName,
      trackingNumber: updatedOrder.trackingNumber,
    });

    return updatedOrder;
  }

  const idx = memoryOrders.findIndex((o) => o.id === orderId);
  if (idx === -1) {
    throw new Error(`Order with ID ${orderId} not found.`);
  }

  memoryOrders[idx] = {
    ...memoryOrders[idx],
    ...updateFields,
  };

  await onOrderStatusChange(orderId, newStatus, {
    courierName: memoryOrders[idx].courierName,
    trackingNumber: memoryOrders[idx].trackingNumber,
  });

  return memoryOrders[idx];
}

/**
 * Bulk update fulfillment status for multiple orders
 */
export async function updateBulkAdminOrderStatus(
  orderIds: string[],
  newStatus: OrderStatus
): Promise<number> {
  if (!orderIds || orderIds.length === 0) return 0;
  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    const res = await db
      .update(orders)
      .set({
        status: newStatus,
        updatedAt: now,
      })
      .where(inArray(orders.id, orderIds))
      .returning({ id: orders.id });

    for (const r of res) {
      await onOrderStatusChange(r.id, newStatus).catch(() => {});
    }

    return res.length;
  }

  let count = 0;
  for (let i = 0; i < memoryOrders.length; i++) {
    if (orderIds.includes(memoryOrders[i].id)) {
      memoryOrders[i] = {
        ...memoryOrders[i],
        status: newStatus,
        updatedAt: now,
      };
      await onOrderStatusChange(memoryOrders[i].id, newStatus).catch(() => {});
      count++;
    }
  }
  return count;
}

// Re-export Order Tracking app helpers
export {
  trackOrder,
  updateOrderTrackingStatus,
  getOrderTrackingSettings,
  invalidateTrackingCache,
} from "@/apps/order-tracking/lib/order-tracking";
export type {
  TrackedOrder,
  TrackedOrderItem,
  OrderTrackingAppSettings,
} from "@/apps/order-tracking/shared/types";


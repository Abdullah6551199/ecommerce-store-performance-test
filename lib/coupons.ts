import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {
  getDb,
  coupons,
  couponUsages,
  orders,
  products,
  type CouponRecord,
  type NewCouponRecord,
  type CouponUsageRecord,
} from "./db";

export type { CouponRecord, NewCouponRecord, CouponUsageRecord };

export interface CartItemValidationInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice?: number;
  categoryId?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  discountType: string;
  message: string;
  coupon: CouponRecord | null;
  freeShipping?: boolean;
}

// Fallback in-memory coupons for local dev / testing
export const memoryCoupons: CouponRecord[] = [
  {
    id: "coup_save10",
    tenantId: null,
    code: "SAVE10",
    description: "10% off your entire order",
    type: "percentage",
    value: 10,
    minOrderValue: 0,
    maxDiscount: null,
    applyTo: "all",
    applyToId: null,
    buyQuantity: null,
    getQuantity: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: false,
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coup_flat20",
    tenantId: null,
    code: "FLAT20",
    description: "$20 off orders over $50",
    type: "fixed",
    value: 20,
    minOrderValue: 50,
    maxDiscount: null,
    applyTo: "all",
    applyToId: null,
    buyQuantity: null,
    getQuantity: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: false,
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coup_freeship",
    tenantId: null,
    code: "FREESHIP",
    description: "Free express shipping on orders over $30",
    type: "free_shipping",
    value: 0,
    minOrderValue: 30,
    maxDiscount: null,
    applyTo: "all",
    applyToId: null,
    buyQuantity: null,
    getQuantity: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: false,
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coup_spend100",
    tenantId: null,
    code: "SPEND100",
    description: "Spend $100+ and receive 15% off",
    type: "min_order",
    value: 15,
    minOrderValue: 100,
    maxDiscount: 50,
    applyTo: "all",
    applyToId: null,
    buyQuantity: null,
    getQuantity: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: true,
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coup_welcome10",
    tenantId: null,
    code: "WELCOME10",
    description: "10% off for first-time shoppers",
    type: "first_order",
    value: 10,
    minOrderValue: 0,
    maxDiscount: 30,
    applyTo: "all",
    applyToId: null,
    buyQuantity: null,
    getQuantity: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: true,
    isVisible: true,
    isAutoApply: false,
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coup_buy2get1",
    tenantId: null,
    code: "BUY2GET1",
    description: "Buy 2 items, get 1 free",
    type: "buy_x_get_y",
    value: 1,
    minOrderValue: null,
    maxDiscount: null,
    applyTo: "all",
    applyToId: null,
    buyQuantity: 2,
    getQuantity: 1,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: false,
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coup_shoes15",
    tenantId: null,
    code: "SHOES15",
    description: "15% off all Footwear products",
    type: "category",
    value: 15,
    minOrderValue: null,
    maxDiscount: null,
    applyTo: "category",
    applyToId: "cat_footwear",
    buyQuantity: null,
    getQuantity: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: false,
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "coup_apex20",
    tenantId: null,
    code: "APEX20",
    description: "$20 off Apex series gear",
    type: "product",
    value: 20,
    minOrderValue: null,
    maxDiscount: null,
    applyTo: "product",
    applyToId: null,
    buyQuantity: null,
    getQuantity: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: null,
    endDate: null,
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: false,
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const memoryUsages: CouponUsageRecord[] = [];

/**
 * Fetch a coupon by its unique code (case-insensitive)
 */
export async function getCouponByCode(code: string): Promise<CouponRecord | null> {
  const normalized = code.trim().toUpperCase();
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(coupons)
      .where(sql`UPPER(${coupons.code}) = ${normalized}`)
      .limit(1);
    return rows[0] || null;
  }
  return memoryCoupons.find((c) => c.code.toUpperCase() === normalized) || null;
}

/**
 * Fetch all visible active coupons for the storefront
 */
export async function getAvailableCoupons(): Promise<CouponRecord[]> {
  const db = getDb();
  const now = new Date().toISOString();
  if (db) {
    const rows = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.isActive, true),
          eq(coupons.isVisible, true),
          sql`(${coupons.startDate} IS NULL OR ${coupons.startDate} <= ${now})`,
          sql`(${coupons.endDate} IS NULL OR ${coupons.endDate} >= ${now})`
        )
      )
      .orderBy(desc(coupons.isFeatured), desc(coupons.createdAt));
    return rows;
  }
  return memoryCoupons.filter((c) => c.isActive && c.isVisible);
}

/**
 * Calculate the discount amount for a validated coupon given items and subtotal
 */
export async function calculateCouponDiscount(
  coupon: CouponRecord,
  cartItems: CartItemValidationInput[],
  subtotal: number
): Promise<{ discount: number; freeShipping: boolean; message: string }> {
  let discount = 0;
  let freeShipping = false;

  const db = getDb();

  // Load product & category mappings if needed for targeted discounts
  let productCategoryMap = new Map<string, string | null>();
  let productObjMap = new Map<string, any>();

  const productIds = Array.from(new Set(cartItems.map((i) => i.productId)));
  if (productIds.length > 0) {
    if (db) {
      const prodRows = await db
        .select({ id: products.id, categoryId: products.categoryId, name: products.name, price: products.price, salePrice: products.salePrice })
        .from(products)
        .where(inArray(products.id, productIds));
      prodRows.forEach((p) => {
        productCategoryMap.set(p.id, p.categoryId);
        productObjMap.set(p.id, p);
      });
    }
  }

  switch (coupon.type) {
    case "percentage": {
      discount = Math.round((subtotal * (coupon.value / 100)) * 100) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      break;
    }

    case "fixed": {
      discount = Math.min(coupon.value, subtotal);
      break;
    }

    case "free_shipping": {
      freeShipping = true;
      discount = 0; // Handled as free shipping at checkout
      break;
    }

    case "buy_x_get_y": {
      // e.g. Buy 2 Get 1 Free (buyQuantity = 2, getQuantity = 1)
      const buyQty = coupon.buyQuantity || 2;
      const getQty = coupon.getQuantity || 1;
      const groupSize = buyQty + getQty;

      // Expand items into single units with unit price
      const individualUnits: number[] = [];
      cartItems.forEach((item) => {
        const prod = productObjMap.get(item.productId);
        const unitPrice = item.unitPrice ?? (prod ? Number(prod.salePrice ?? prod.price) : 0);
        for (let q = 0; q < item.quantity; q++) {
          individualUnits.push(unitPrice);
        }
      });

      // Sort lowest to highest unit price (cheapest items discounted)
      individualUnits.sort((a, b) => a - b);
      const freeItemCount = Math.floor(individualUnits.length / groupSize) * getQty;

      for (let i = 0; i < freeItemCount && i < individualUnits.length; i++) {
        discount += individualUnits[i];
      }
      discount = Math.round(discount * 100) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      break;
    }

    case "category": {
      // Percentage or fixed off items in the targeted category
      let eligibleSubtotal = 0;
      cartItems.forEach((item) => {
        const catId = item.categoryId || productCategoryMap.get(item.productId);
        const prod = productObjMap.get(item.productId);
        const unitPrice = item.unitPrice ?? (prod ? Number(prod.salePrice ?? prod.price) : 0);
        if (!coupon.applyToId || catId === coupon.applyToId) {
          eligibleSubtotal += unitPrice * item.quantity;
        }
      });

      if (eligibleSubtotal > 0) {
        discount = Math.round((eligibleSubtotal * (coupon.value / 100)) * 100) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }
      break;
    }

    case "product": {
      // Percentage or fixed off specific product
      let eligibleSubtotal = 0;
      cartItems.forEach((item) => {
        const prod = productObjMap.get(item.productId);
        const unitPrice = item.unitPrice ?? (prod ? Number(prod.salePrice ?? prod.price) : 0);
        // If applyToId is set, match productId. If not set, check product name/brand or any item
        if (!coupon.applyToId || item.productId === coupon.applyToId) {
          eligibleSubtotal += unitPrice * item.quantity;
        }
      });

      if (eligibleSubtotal > 0) {
        if (coupon.value > 0 && coupon.value < 100 && coupon.value % 5 === 0 && !coupon.maxDiscount) {
          // If value looks like a dollar amount or fixed discount
          discount = Math.min(coupon.value, eligibleSubtotal);
        } else {
          discount = Math.round((eligibleSubtotal * (coupon.value / 100)) * 100) / 100;
        }
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }
      break;
    }

    case "min_order": {
      discount = Math.round((subtotal * (coupon.value / 100)) * 100) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      break;
    }

    case "first_order": {
      discount = Math.round((subtotal * (coupon.value / 100)) * 100) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      break;
    }

    default: {
      discount = Math.round((subtotal * (coupon.value / 100)) * 100) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }
  }

  discount = Math.min(discount, subtotal);
  discount = Math.max(0, Math.round(discount * 100) / 100);

  return {
    discount,
    freeShipping,
    message: freeShipping
      ? `Free shipping applied with code ${coupon.code}`
      : `Saved $${discount.toFixed(2)} with code ${coupon.code}`,
  };
}

/**
 * Server-side authoritative validation for a coupon code
 */
export async function validateCoupon({
  code,
  cartItems = [],
  subtotal,
  customerEmail,
}: {
  code: string;
  cartItems?: CartItemValidationInput[];
  subtotal: number;
  customerEmail?: string | null;
}): Promise<CouponValidationResult> {
  const coupon = await getCouponByCode(code);

  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      discountType: "none",
      message: `Coupon code "${code.toUpperCase()}" does not exist.`,
      coupon: null,
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      discount: 0,
      discountType: coupon.type,
      message: `Coupon "${coupon.code}" is currently disabled.`,
      coupon,
    };
  }

  const now = new Date();
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return {
      valid: false,
      discount: 0,
      discountType: coupon.type,
      message: `Coupon "${coupon.code}" is not yet active.`,
      coupon,
    };
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return {
      valid: false,
      discount: 0,
      discountType: coupon.type,
      message: `Coupon "${coupon.code}" expired on ${new Date(coupon.endDate).toLocaleDateString()}.`,
      coupon,
    };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      discount: 0,
      discountType: coupon.type,
      message: `Coupon "${coupon.code}" has reached its maximum total usage limit.`,
      coupon,
    };
  }

  // Minimum order value check
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    const diff = (coupon.minOrderValue - subtotal).toFixed(2);
    return {
      valid: false,
      discount: 0,
      discountType: coupon.type,
      message: `Add $${diff} more to your cart to use code "${coupon.code}" (Min order: $${coupon.minOrderValue.toFixed(2)}).`,
      coupon,
    };
  }

  const db = getDb();

  // Check per customer limit
  if (customerEmail && coupon.perCustomerLimit) {
    const normalizedEmail = customerEmail.trim().toLowerCase();
    if (db) {
      const usageRows = await db
        .select()
        .from(couponUsages)
        .where(
          and(
            eq(couponUsages.couponId, coupon.id),
            sql`LOWER(${couponUsages.customerEmail}) = ${normalizedEmail}`
          )
        );
      if (usageRows.length >= coupon.perCustomerLimit) {
        return {
          valid: false,
          discount: 0,
          discountType: coupon.type,
          message: `You have already used coupon "${coupon.code}" the maximum allowed times.`,
          coupon,
        };
      }
    } else {
      const used = memoryUsages.filter(
        (u) => u.couponId === coupon.id && u.customerEmail?.toLowerCase() === normalizedEmail
      );
      if (used.length >= coupon.perCustomerLimit) {
        return {
          valid: false,
          discount: 0,
          discountType: coupon.type,
          message: `You have already used coupon "${coupon.code}" the maximum allowed times.`,
          coupon,
        };
      }
    }
  }

  // Check first order only
  if (coupon.firstOrderOnly && customerEmail) {
    const normalizedEmail = customerEmail.trim().toLowerCase();
    if (db) {
      const existingOrders = await db
        .select({ id: orders.id })
        .from(orders)
        .where(sql`LOWER(${orders.email}) = ${normalizedEmail}`)
        .limit(1);
      if (existingOrders.length > 0) {
        return {
          valid: false,
          discount: 0,
          discountType: coupon.type,
          message: `Coupon "${coupon.code}" is valid only for first-time orders.`,
          coupon,
        };
      }
    }
  }

  // Check buy_x_get_y item count requirement
  if (coupon.type === "buy_x_get_y") {
    const buyQty = coupon.buyQuantity || 2;
    const getQty = coupon.getQuantity || 1;
    const totalQty = cartItems.reduce((acc, it) => acc + it.quantity, 0);
    if (totalQty < buyQty + getQty) {
      return {
        valid: false,
        discount: 0,
        discountType: coupon.type,
        message: `Buy at least ${buyQty + getQty} items to activate "${coupon.code}" (Buy ${buyQty}, Get ${getQty} Free).`,
        coupon,
      };
    }
  }

  // Check targeting
  if (coupon.applyTo === "category" && coupon.applyToId) {
    let hasTarget = false;
    if (db) {
      const productIds = cartItems.map((i) => i.productId);
      if (productIds.length > 0) {
        const matched = await db
          .select({ id: products.id })
          .from(products)
          .where(and(inArray(products.id, productIds), eq(products.categoryId, coupon.applyToId)));
        hasTarget = matched.length > 0;
      }
    } else {
      hasTarget = cartItems.some((i) => i.categoryId === coupon.applyToId);
    }
    if (!hasTarget) {
      return {
        valid: false,
        discount: 0,
        discountType: coupon.type,
        message: `Coupon "${coupon.code}" is only applicable to products in the specified category.`,
        coupon,
      };
    }
  }

  if (coupon.applyTo === "product" && coupon.applyToId) {
    const hasTarget = cartItems.some((i) => i.productId === coupon.applyToId);
    if (!hasTarget) {
      return {
        valid: false,
        discount: 0,
        discountType: coupon.type,
        message: `Coupon "${coupon.code}" applies only to a specific product not found in your cart.`,
        coupon,
      };
    }
  }

  // Calculate discount
  const { discount, freeShipping, message } = await calculateCouponDiscount(
    coupon,
    cartItems,
    subtotal
  );

  return {
    valid: true,
    discount,
    discountType: coupon.type,
    message,
    coupon,
    freeShipping,
  };
}

/**
 * Find the best auto-applicable or best overall coupon for the cart
 */
export async function findBestCoupon(
  cartItems: CartItemValidationInput[],
  subtotal: number,
  customerEmail?: string | null
): Promise<{ bestCoupon: CouponRecord | null; discount: number; suggestion: string | null }> {
  const available = await getAvailableCoupons();
  let bestCoupon: CouponRecord | null = null;
  let maxDiscount = 0;
  let bestSuggestion: string | null = null;

  for (const c of available) {
    const res = await validateCoupon({
      code: c.code,
      cartItems,
      subtotal,
      customerEmail,
    });

    if (res.valid) {
      // Prioritize auto-apply if configured, or greatest discount
      if (res.discount > maxDiscount || (!bestCoupon && c.isAutoApply)) {
        maxDiscount = res.discount;
        bestCoupon = c;
      }
    } else if (c.minOrderValue && subtotal < c.minOrderValue) {
      // Check for Smart Suggestion
      const remaining = c.minOrderValue - subtotal;
      if (remaining > 0 && remaining <= 50) {
        let potentialSave = 0;
        if (c.type === "fixed") potentialSave = c.value;
        else if (c.type === "percentage" || c.type === "min_order") {
          potentialSave = Math.round(c.minOrderValue * (c.value / 100));
        }
        if (!bestSuggestion && potentialSave > 0) {
          bestSuggestion = `Add $${remaining.toFixed(2)} more to save $${potentialSave.toFixed(2)} with code ${c.code}`;
        }
      }
    }
  }

  return {
    bestCoupon,
    discount: maxDiscount,
    suggestion: bestSuggestion,
  };
}

/**
 * Record a coupon usage upon successful order placement
 */
export async function recordCouponUsage({
  couponId,
  orderId,
  discountAmount,
  customerEmail,
  customerId,
}: {
  couponId: string;
  orderId: string;
  discountAmount: number;
  customerEmail?: string | null;
  customerId?: string | null;
}): Promise<void> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  if (db) {
    await db.insert(couponUsages).values({
      id,
      couponId,
      orderId,
      customerEmail: customerEmail || null,
      customerId: customerId || null,
      discountAmount,
      usedAt: now,
    });

    await db
      .update(coupons)
      .set({
        usedCount: sql`${coupons.usedCount} + 1`,
        updatedAt: now,
      })
      .where(eq(coupons.id, couponId));
  } else {
    memoryUsages.push({
      id,
      couponId,
      orderId,
      customerEmail: customerEmail || null,
      customerId: customerId || null,
      discountAmount,
      usedAt: now,
    });
    const coup = memoryCoupons.find((c) => c.id === couponId);
    if (coup) coup.usedCount += 1;
  }
}

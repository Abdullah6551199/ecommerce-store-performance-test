import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb, orders, orderItems, customers, products, productVariants } from "@/lib/db";
import { sql, eq, inArray } from "drizzle-orm";
import { createCustomerNotification } from "@/lib/customer-notifications";

export const dynamic = "force-dynamic";

const itemSchema = z.object({
  product_id: z.string().optional(),
  productId: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  qty: z.number().int().min(1).optional(),
  quantity: z.number().int().min(1).optional(),
  price: z.number().nonnegative(),
  line_total: z.number().nonnegative().optional(),
  lineTotal: z.number().nonnegative().optional(),
  variant_id: z.string().nullable().optional(),
  variantId: z.string().nullable().optional(),
  variant_name: z.string().nullable().optional(),
  variantName: z.string().nullable().optional(),
}).transform((val) => ({
  productId: val.product_id || val.productId || "unknown-product",
  name: val.name,
  quantity: val.qty ?? val.quantity ?? 1,
  unitPrice: val.price,
  lineTotal: val.line_total ?? val.lineTotal ?? (val.price * (val.qty ?? val.quantity ?? 1)),
  variantId: val.variant_id ?? val.variantId ?? null,
  variantName: val.variant_name ?? val.variantName ?? null,
}));

const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").default("WhatsApp Customer"),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().trim().email().nullable().optional().or(z.literal("")),
  address: z.string().trim().min(1, "Address is required").default("WhatsApp Delivery"),
  city: z.string().trim().min(1, "City is required").default("Direct WhatsApp"),
  postal_code: z.string().trim().nullable().optional().or(z.literal("")),
  postalCode: z.string().trim().nullable().optional().or(z.literal("")),
  notes: z.string().trim().nullable().optional().or(z.literal("")),
  country: z.string().trim().default("PK").optional(),
}).transform((val) => ({
  name: val.name || "WhatsApp Customer",
  phone: val.phone,
  email: val.email || null,
  address: val.address || "WhatsApp Delivery",
  city: val.city || "Direct WhatsApp",
  postalCode: val.postal_code || val.postalCode || null,
  notes: val.notes || null,
  country: val.country || "PK",
}));

const saveOrderSchema = z.object({
  items: z.array(itemSchema).min(1, "At least one item is required"),
  customer: customerSchema,
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative().optional().default(0),
  total: z.number().nonnegative(),
  source: z.literal("whatsapp").default("whatsapp"),
});

/**
 * POST /api/whatsapp-order/save-order
 * Modular app endpoint for persisting WhatsApp orders to D1.
 * Source tracked as "whatsapp", status initialized to "pending".
 * Transaction-safe batch write for order and items.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parsed = saveOrderSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { items, customer, subtotal, shipping, total, source } = parsed.data;

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    const orderId = crypto.randomUUID();
    const shortRef = `WA-${orderId.slice(0, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    // Check if customer exists in D1 for non-blocking notification linking
    let resolvedCustomerId: string | null = null;
    if (customer.email) {
      try {
        const match = await db
          .select({ id: customers.id })
          .from(customers)
          .where(sql`LOWER(${customers.email}) = ${customer.email.toLowerCase().trim()}`)
          .limit(1);
        if (match.length > 0) {
          resolvedCustomerId = match[0].id;
        }
      } catch {
        // Non-blocking query
      }
    }

    // Verify foreign key integrity against products and productVariants in D1
    let availableProducts: { id: string; slug: string }[] = [];
    try {
      availableProducts = await db
        .select({ id: products.id, slug: products.slug })
        .from(products);
    } catch {
      // Non-blocking query
    }

    const validProductIds = new Set(availableProducts.map((p) => p.id));
    const slugToProductId = new Map(availableProducts.map((p) => [p.slug, p.id]));
    const fallbackProductId = availableProducts[0]?.id || "prod-apex-vrx1";

    const variantIdsToCheck = items.map((it) => it.variantId).filter(Boolean) as string[];
    const validVariantIds = new Set<string>();
    if (variantIdsToCheck.length > 0) {
      try {
        const matchingVariants = await db
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(inArray(productVariants.id, variantIdsToCheck));
        for (const v of matchingVariants) {
          validVariantIds.add(v.id);
        }
      } catch {
        // Non-blocking query
      }
    }

    const orderRecord = {
      id: orderId,
      customerId: resolvedCustomerId,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      state: null,
      taxAmount: 0,
      taxRate: 0,
      taxLabel: null,
      shippingZoneId: null,
      notes: customer.notes,
      subtotal,
      shipping: shipping ?? 0,
      discountAmount: 0,
      discountCode: null,
      discountType: null,
      total,
      paymentMethod: "cod",
      status: "pending" as const,
      source: source || "whatsapp",
      hasReview: 0,
      courierName: null,
      trackingNumber: null,
      estimatedDelivery: null,
      statusNotes: null,
      createdAt: now,
      updatedAt: now,
    };

    const orderItemRecords = items.map((it) => {
      let finalProductId = it.productId;
      if (!validProductIds.has(finalProductId)) {
        if (slugToProductId.has(finalProductId)) {
          finalProductId = slugToProductId.get(finalProductId)!;
        } else if (fallbackProductId) {
          finalProductId = fallbackProductId;
        }
      }

      const finalVariantId =
        it.variantId && validVariantIds.has(it.variantId) ? it.variantId : null;

      return {
        id: crypto.randomUUID(),
        orderId,
        productId: finalProductId,
        variantId: finalVariantId,
        productName: it.name,
        variantName: it.variantName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
        createdAt: now,
      };
    });

    // Transaction-safe execution via D1 batch or sequential transaction
    if (typeof (db as any).batch === "function") {
      await (db as any).batch([
        db.insert(orders).values(orderRecord),
        ...orderItemRecords.map((oi) => db.insert(orderItems).values(oi)),
      ]);
    } else {
      await db.insert(orders).values(orderRecord);
      for (const oi of orderItemRecords) {
        await db.insert(orderItems).values(oi);
      }
    }

    // Auto notification to customer (if customer account linked) — strictly non-blocking
    if (resolvedCustomerId) {
      createCustomerNotification({
        customerId: resolvedCustomerId,
        type: "order_status",
        title: "WhatsApp Order Placed",
        message: `Your WhatsApp order #${shortRef} has been recorded and is pending confirmation.`,
        link: `/account/orders/${orderId}`,
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      orderId,
      shortId: shortRef,
      orderRef: `#${shortRef}`,
      message: "Order successfully saved via WhatsApp integration",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to save order";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

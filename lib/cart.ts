import { eq, and, sql, desc } from "drizzle-orm";
import { getDb, carts, cartItems, products, productImages, productVariants, type CartRecord, type CartItemRecord } from "./db";
import { normalizeImageUrl } from "./utils";

export const CART_COOKIE_NAME = "cart_session_id";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface CartItemDetail {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  sku: string;
  imageUrl: string;
  variantOptions: Record<string, string> | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stockQuantity: number;
  stockStatus: string;
}

export interface CartSummary {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemDetail[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  total: number;
}

// In-memory fallback for local dev/testing without D1
interface MemoryCart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: "active" | "converted" | "abandoned";
  createdAt: string;
  updatedAt: string;
}

interface MemoryCartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

const memoryCarts: MemoryCart[] = [];
const memoryCartItems: MemoryCartItem[] = [];

/**
 * Generate a random UUID string (compatible with all runtime environments)
 */
export function generateCartId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "cart-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Get or create an active cart for a user or guest session
 */
export async function getOrCreateCart(
  sessionId?: string | null,
  userId?: string | null
): Promise<CartRecord> {
  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    let existingCart: CartRecord | undefined;

    if (userId) {
      const found = await db
        .select()
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
        .limit(1);
      existingCart = found[0];
    } else if (sessionId) {
      const found = await db
        .select()
        .from(carts)
        .where(and(eq(carts.sessionId, sessionId), eq(carts.status, "active")))
        .limit(1);
      existingCart = found[0];
    }

    if (existingCart) {
      return existingCart;
    }

    // Create new active cart
    const newId = generateCartId();
    await db.insert(carts).values({
      id: newId,
      userId: userId || null,
      sessionId: sessionId || null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db.select().from(carts).where(eq(carts.id, newId));
    return created;
  }

  // Memory fallback
  let existing = memoryCarts.find(
    (c) =>
      c.status === "active" &&
      ((userId && c.userId === userId) || (sessionId && c.sessionId === sessionId))
  );

  if (existing) {
    return existing as CartRecord;
  }

  const newCart: MemoryCart = {
    id: generateCartId(),
    userId: userId || null,
    sessionId: sessionId || null,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  memoryCarts.push(newCart);
  return newCart as CartRecord;
}

/**
 * Retrieve a cart along with all item details and server-calculated totals
 */
export async function getCartWithItems(cartId: string): Promise<CartSummary> {
  const db = getDb();
  const freeShippingThreshold = 100;

  if (db) {
    const [cart] = await db.select().from(carts).where(eq(carts.id, cartId));
    if (!cart) {
      return {
        id: cartId,
        userId: null,
        sessionId: null,
        items: [],
        itemCount: 0,
        subtotal: 0,
        shipping: 0,
        freeShippingThreshold,
        freeShippingRemaining: freeShippingThreshold,
        total: 0,
      };
    }

    // Fetch cart items
    const rawItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId))
      .orderBy(desc(cartItems.createdAt));

    const items: CartItemDetail[] = [];

    for (const item of rawItems) {
      // Fetch product info
      const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
      if (!prod) continue;

      // Fetch variant info if applicable
      let variantOptions: Record<string, string> | null = null;
      let variantSku: string = prod.sku || "";
      let variantImage: string | null = null;

      if (item.variantId) {
        const [variant] = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, item.variantId));
        if (variant) {
          variantOptions = variant.options || null;
          if (variant.sku) variantSku = variant.sku;
          if (variant.imageUrl) variantImage = variant.imageUrl;
        }
      }

      // Fetch main image if no variant image
      let finalImage = variantImage;
      if (!finalImage) {
        const [mainImg] = await db
          .select()
          .from(productImages)
          .where(and(eq(productImages.productId, item.productId), eq(productImages.isMain, true)))
          .limit(1);
        finalImage = mainImg?.imageUrl || "/file.svg";
      }

      const lineTotal = Math.round(item.unitPrice * item.quantity * 100) / 100;

      items.push({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        variantId: item.variantId,
        productName: prod.name,
        productSlug: prod.slug,
        sku: variantSku,
        imageUrl: normalizeImageUrl(finalImage),
        variantOptions,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
        stockQuantity: prod.stockQuantity,
        stockStatus: prod.stockStatus,
      });
    }

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
    const shipping = subtotal > 0 && subtotal < freeShippingThreshold ? 10 : 0;
    const freeShippingRemaining = Math.max(0, Math.round((freeShippingThreshold - subtotal) * 100) / 100);
    const total = Math.round((subtotal + shipping) * 100) / 100;

    return {
      id: cart.id,
      userId: cart.userId,
      sessionId: cart.sessionId,
      items,
      itemCount,
      subtotal,
      shipping,
      freeShippingThreshold,
      freeShippingRemaining,
      total,
    };
  }

  // Fallback memory calculation
  const cart = memoryCarts.find((c) => c.id === cartId);
  const rawItems = memoryCartItems.filter((i) => i.cartId === cartId);

  const items: CartItemDetail[] = rawItems.map((item) => ({
    id: item.id,
    cartId: item.cartId,
    productId: item.productId,
    variantId: item.variantId,
    productName: "Simulated Product",
    productSlug: "simulated-product",
    sku: "SIM-SKU",
    imageUrl: "/file.svg",
    variantOptions: null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: Math.round(item.unitPrice * item.quantity * 100) / 100,
    stockQuantity: 10,
    stockStatus: "in_stock",
  }));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
  const shipping = subtotal > 0 && subtotal < freeShippingThreshold ? 10 : 0;
  const freeShippingRemaining = Math.max(0, Math.round((freeShippingThreshold - subtotal) * 100) / 100);
  const total = Math.round((subtotal + shipping) * 100) / 100;

  return {
    id: cart?.id || cartId,
    userId: cart?.userId || null,
    sessionId: cart?.sessionId || null,
    items,
    itemCount,
    subtotal,
    shipping,
    freeShippingThreshold,
    freeShippingRemaining,
    total,
  };
}

/**
 * Add an item to the cart with server-side price verification
 */
export async function addItemToCart(
  cartId: string,
  productId: string,
  variantId: string | null | undefined,
  quantity = 1
): Promise<CartItemRecord> {
  if (quantity <= 0) {
    throw new Error("Quantity must be at least 1.");
  }

  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    // 1. Verify product exists
    const [prod] = await db.select().from(products).where(eq(products.id, productId));
    if (!prod) {
      throw new Error(`Product with ID '${productId}' not found.`);
    }

    // 2. Determine price strictly from server
    let unitPrice = prod.salePrice && prod.salePrice > 0 ? prod.salePrice : prod.price;

    if (variantId) {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)));
      if (!variant) {
        throw new Error(`Variant with ID '${variantId}' not found for this product.`);
      }
      if (variant.salePrice && variant.salePrice > 0) {
        unitPrice = variant.salePrice;
      } else if (variant.price && variant.price > 0) {
        unitPrice = variant.price;
      }
    }

    // 3. Check if existing item in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId),
          variantId ? eq(cartItems.variantId, variantId) : sql`${cartItems.variantId} IS NULL`
        )
      )
      .limit(1);

    if (existing && existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      await db
        .update(cartItems)
        .set({
          quantity: newQty,
          unitPrice,
          updatedAt: now,
        })
        .where(eq(cartItems.id, existing[0].id));

      const [updated] = await db.select().from(cartItems).where(eq(cartItems.id, existing[0].id));
      return updated;
    }

    // Insert new item
    const newItemId = generateCartId();
    await db.insert(cartItems).values({
      id: newItemId,
      cartId,
      productId,
      variantId: variantId || null,
      quantity,
      unitPrice,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db.select().from(cartItems).where(eq(cartItems.id, newItemId));
    return created;
  }

  // Memory fallback
  const existing = memoryCartItems.find(
    (i) => i.cartId === cartId && i.productId === productId && i.variantId === (variantId || null)
  );

  if (existing) {
    existing.quantity += quantity;
    existing.updatedAt = now;
    return existing as CartItemRecord;
  }

  const newItem: MemoryCartItem = {
    id: generateCartId(),
    cartId,
    productId,
    variantId: variantId || null,
    quantity,
    unitPrice: 99.0,
    createdAt: now,
    updatedAt: now,
  };
  memoryCartItems.push(newItem);
  return newItem as CartItemRecord;
}

/**
 * Update the quantity of a cart item
 */
export async function updateCartItemQuantity(
  cartId: string,
  cartItemId: string,
  quantity: number
): Promise<boolean> {
  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    if (quantity <= 0) {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));
      return true;
    }

    await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: now,
      })
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));
    return true;
  }

  // Memory fallback
  const index = memoryCartItems.findIndex((i) => i.id === cartItemId && i.cartId === cartId);
  if (index !== -1) {
    if (quantity <= 0) {
      memoryCartItems.splice(index, 1);
    } else {
      memoryCartItems[index].quantity = quantity;
      memoryCartItems[index].updatedAt = now;
    }
    return true;
  }
  return false;
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(cartId: string, cartItemId: string): Promise<boolean> {
  const db = getDb();

  if (db) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));
    return true;
  }

  // Memory fallback
  const index = memoryCartItems.findIndex((i) => i.id === cartItemId && i.cartId === cartId);
  if (index !== -1) {
    memoryCartItems.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Clear all items from a cart
 */
export async function clearCart(cartId: string): Promise<boolean> {
  const db = getDb();

  if (db) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    return true;
  }

  for (let i = memoryCartItems.length - 1; i >= 0; i--) {
    if (memoryCartItems[i].cartId === cartId) {
      memoryCartItems.splice(i, 1);
    }
  }
  return true;
}

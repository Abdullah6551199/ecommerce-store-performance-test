import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateCart,
  addItemToCart,
  getCartWithItems,
  CART_COOKIE_NAME,
  CART_COOKIE_MAX_AGE,
  generateCartId,
} from "@/lib/cart";

import { z } from "zod";

export const dynamic = "force-dynamic";

const addToCartSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
  variantId: z.string().trim().nullable().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
});

/**
 * POST /api/cart/add
 * Adds an item to the cart with server-side price calculation.
 * Body: { productId: string, variantId?: string | null, quantity?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = addToCartSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid input data",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { productId, variantId, quantity } = parseResult.data;

    let sessionId = req.cookies.get(CART_COOKIE_NAME)?.value;
    let isNewSession = false;

    if (!sessionId) {
      sessionId = generateCartId();
      isNewSession = true;
    }

    const cart = await getOrCreateCart(sessionId);
    await addItemToCart(cart.id, productId, variantId || null, quantity);

    const updatedCart = await getCartWithItems(cart.id);

    const response = NextResponse.json({
      success: true,
      message: "Item added to cart successfully.",
      data: updatedCart,
    });

    if (isNewSession) {
      response.cookies.set(CART_COOKIE_NAME, sessionId, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: CART_COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch (error) {
    console.error("[POST /api/cart/add] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to add item to cart." },
      { status: 400 }
    );
  }
}

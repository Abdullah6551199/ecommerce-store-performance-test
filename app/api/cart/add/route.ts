import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateCart,
  addItemToCart,
  getCartWithItems,
  CART_COOKIE_NAME,
  CART_COOKIE_MAX_AGE,
  generateCartId,
} from "@/lib/cart";

export const dynamic = "force-dynamic";

/**
 * POST /api/cart/add
 * Adds an item to the cart with server-side price calculation.
 * Body: { productId: string, variantId?: string | null, quantity?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      productId?: string;
      variantId?: string | null;
      quantity?: number;
    };
    const { productId, variantId, quantity = 1 } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid 'productId' is required." },
        { status: 400 }
      );
    }

    const parsedQty = Math.max(1, Number(quantity) || 1);

    let sessionId = req.cookies.get(CART_COOKIE_NAME)?.value;
    let isNewSession = false;

    if (!sessionId) {
      sessionId = generateCartId();
      isNewSession = true;
    }

    const cart = await getOrCreateCart(sessionId);
    await addItemToCart(cart.id, productId, variantId || null, parsedQty);

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

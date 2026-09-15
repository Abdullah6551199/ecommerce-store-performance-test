import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCart, getCartWithItems, CART_COOKIE_NAME, CART_COOKIE_MAX_AGE, generateCartId } from "@/lib/cart";

export const dynamic = "force-dynamic";

/**
 * GET /api/cart
 * Returns the current shopping cart with all items, quantities, and totals.
 * Uses guest session cookie (or authenticated user).
 */
export async function GET(req: NextRequest) {
  try {
    let sessionId = req.cookies.get(CART_COOKIE_NAME)?.value;
    let isNewSession = false;

    if (!sessionId) {
      sessionId = generateCartId();
      isNewSession = true;
    }

    const cart = await getOrCreateCart(sessionId);
    const cartSummary = await getCartWithItems(cart.id);

    const response = NextResponse.json({
      success: true,
      data: cartSummary,
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
    console.error("[GET /api/cart] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve shopping cart." },
      { status: 500 }
    );
  }
}

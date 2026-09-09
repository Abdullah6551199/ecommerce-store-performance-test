import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateCart,
  removeCartItem,
  getCartWithItems,
  CART_COOKIE_NAME,
} from "@/lib/cart";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/cart/remove
 * Removes an item from the cart.
 * Body or query param: { cartItemId: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(CART_COOKIE_NAME)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "No active cart session found." },
        { status: 404 }
      );
    }

    let cartItemId: string | null = null;

    // Check query params first
    const { searchParams } = new URL(req.url);
    cartItemId = searchParams.get("cartItemId");

    // Check JSON body fallback
    if (!cartItemId) {
      const body = (await req.json().catch(() => ({}))) as { cartItemId?: string };
      cartItemId = body.cartItemId || null;
    }

    if (!cartItemId || typeof cartItemId !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid 'cartItemId' is required." },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(sessionId);
    await removeCartItem(cart.id, cartItemId);

    const updatedCart = await getCartWithItems(cart.id);

    return NextResponse.json({
      success: true,
      message: "Item removed from cart.",
      data: updatedCart,
    });
  } catch (error) {
    console.error("[DELETE /api/cart/remove] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to remove item from cart." },
      { status: 400 }
    );
  }
}

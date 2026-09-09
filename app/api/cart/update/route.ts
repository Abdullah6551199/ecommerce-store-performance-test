import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateCart,
  updateCartItemQuantity,
  getCartWithItems,
  CART_COOKIE_NAME,
} from "@/lib/cart";

export const dynamic = "force-dynamic";

/**
 * PUT /api/cart/update
 * Updates quantity for an existing cart item (or deletes if quantity <= 0).
 * Body: { cartItemId: string, quantity: number }
 */
export async function PUT(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(CART_COOKIE_NAME)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "No active cart session found." },
        { status: 404 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      cartItemId?: string;
      quantity?: number;
    };
    const { cartItemId, quantity } = body;

    if (!cartItemId || typeof cartItemId !== "string") {
      return NextResponse.json(
        { success: false, error: "'cartItemId' is required." },
        { status: 400 }
      );
    }

    if (quantity === undefined || isNaN(Number(quantity))) {
      return NextResponse.json(
        { success: false, error: "A numeric 'quantity' is required." },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(sessionId);
    await updateCartItemQuantity(cart.id, cartItemId, Number(quantity));

    const updatedCart = await getCartWithItems(cart.id);

    return NextResponse.json({
      success: true,
      message: "Cart item updated successfully.",
      data: updatedCart,
    });
  } catch (error) {
    console.error("[PUT /api/cart/update] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update cart item." },
      { status: 400 }
    );
  }
}

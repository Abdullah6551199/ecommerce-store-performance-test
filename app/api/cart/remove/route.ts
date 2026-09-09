import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getOrCreateCart,
  removeCartItem,
  getCartWithItems,
  CART_COOKIE_NAME,
} from "@/lib/cart";

export const dynamic = "force-dynamic";

const removeCartSchema = z.object({
  cartItemId: z.string().trim().min(1, "A valid 'cartItemId' is required."),
  cartSessionId: z.string().trim().optional(),
});

/**
 * DELETE /api/cart/remove
 * Removes an item from the cart.
 * Body or query param: { cartItemId: string, cartSessionId?: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const parseResult = removeCartSchema.safeParse({
      cartItemId: searchParams.get("cartItemId") || body.cartItemId,
      cartSessionId: searchParams.get("cartSessionId") || body.cartSessionId,
    });

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

    const { cartItemId, cartSessionId: bodySessionId } = parseResult.data;
    const cookieStore = await cookies();
    const sessionId =
      bodySessionId ||
      cookieStore.get(CART_COOKIE_NAME)?.value ||
      req.cookies.get(CART_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "No active cart session found." },
        { status: 404 }
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

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getOrCreateCart,
  updateCartItemQuantity,
  getCartWithItems,
  CART_COOKIE_NAME,
} from "@/lib/cart";

export const dynamic = "force-dynamic";

const updateCartSchema = z.object({
  cartItemId: z.string().trim().min(1, "Cart item ID is required"),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or greater"),
  cartSessionId: z.string().trim().optional(),
});

/**
 * PUT /api/cart/update
 * Updates quantity for an existing cart item (or deletes if quantity <= 0).
 * Body: { cartItemId: string, quantity: number, cartSessionId?: string }
 */
export async function PUT(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = updateCartSchema.safeParse(rawBody);

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

    const { cartItemId, quantity, cartSessionId: bodySessionId } = parseResult.data;
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
    await updateCartItemQuantity(cart.id, cartItemId, quantity);

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

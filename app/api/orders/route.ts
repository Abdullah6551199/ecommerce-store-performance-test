import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrderFromCart, createOrderSchema } from "@/lib/orders";
import { CART_COOKIE_NAME, CART_COOKIE_MAX_AGE, generateCartId } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const cookieStore = await cookies();

    // Resiliently resolve cart session ID across cookie stores, request headers, and payload
    const cartSessionId =
      (typeof body.cartSessionId === "string" && body.cartSessionId.trim()) ||
      cookieStore.get(CART_COOKIE_NAME)?.value ||
      req.cookies.get(CART_COOKIE_NAME)?.value ||
      req.headers.get("x-cart-session") ||
      undefined;

    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: `${issue.path.join(".")}: ${issue.message}`,
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const order = await createOrderFromCart(validationResult.data, cartSessionId);

    // Initialize fresh session cookie for subsequent shopping
    const freshSessionId = generateCartId();
    const response = NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        order,
      },
      message: "Order placed successfully! Cash on delivery selected.",
    });

    response.cookies.set(CART_COOKIE_NAME, freshSessionId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CART_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Order placement error:", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}


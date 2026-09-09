import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrderFromCart, createOrderSchema } from "@/lib/orders";
import { CART_COOKIE_NAME } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const cartSessionId = cookieStore.get(CART_COOKIE_NAME)?.value;

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

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        order,
      },
      message: "Order placed successfully! Cash on delivery selected.",
    });
  } catch (error) {
    console.error("Order placement error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to place order",
      },
      { status: 400 }
    );
  }
}

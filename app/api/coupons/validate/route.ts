import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/lib/coupons";

export const dynamic = "force-dynamic";

const validateRequestSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  cartItems: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().optional(),
        categoryId: z.string().nullable().optional(),
      })
    )
    .optional()
    .default([]),
  subtotal: z.coerce.number().min(0, "Subtotal must be non-negative"),
  customerEmail: z.string().trim().email().nullable().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = validateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          valid: false,
          discount: 0,
          discountType: "none",
          message: parsed.error.issues[0]?.message || "Invalid coupon request",
          coupon: null,
        },
        { status: 400 }
      );
    }

    const { code, cartItems, subtotal, customerEmail } = parsed.data;

    const result = await validateCoupon({
      code,
      cartItems,
      subtotal,
      customerEmail: customerEmail || null,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json(
      {
        valid: false,
        discount: 0,
        discountType: "none",
        message: error instanceof Error ? error.message : "Validation error",
        coupon: null,
      },
      { status: 500 }
    );
  }
}

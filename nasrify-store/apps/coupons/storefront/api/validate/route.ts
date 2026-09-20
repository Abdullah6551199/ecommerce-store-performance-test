import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon, checkValidationRateLimit } from "@/apps/coupons/lib/coupons";

export const dynamic = "force-dynamic";

const validateRequestSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required").max(50, "Invalid coupon code"),
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
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "client";
    if (!checkValidationRateLimit(ip)) {
      return NextResponse.json(
        {
          valid: false,
          discount: 0,
          discountType: "none",
          message: "Too many coupon attempts. Please try again in a minute.",
          coupon: null,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
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
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        discount: 0,
        discountType: "none",
        message: error?.message || "Validation error",
        coupon: null,
      },
      { status: 500 }
    );
  }
}

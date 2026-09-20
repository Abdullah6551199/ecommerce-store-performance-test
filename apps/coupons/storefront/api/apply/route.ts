import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon, checkValidationRateLimit } from "@/apps/coupons/lib/coupons";

export const dynamic = "force-dynamic";

const applyRequestSchema = z.object({
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
          success: false,
          error: "Too many coupon attempts. Please wait a moment.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = applyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid coupon request",
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

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      coupon: result.coupon,
      discount: result.discount,
      discountType: result.discountType,
      freeShipping: result.freeShipping || false,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to apply coupon",
      },
      { status: 500 }
    );
  }
}

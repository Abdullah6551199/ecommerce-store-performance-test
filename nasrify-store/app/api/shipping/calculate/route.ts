import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateShipping } from "@/lib/shipping";
import { getVisitorLocation } from "@/lib/tax";

export const dynamic = "force-dynamic";

const calculateShippingSchema = z.object({
  country: z.string().trim().optional(),
  state: z.string().trim().nullable().optional(),
  orderSubtotal: z.coerce.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validated = calculateShippingSchema.parse(body);

    const visitorLoc = getVisitorLocation(req);
    const country = validated.country || visitorLoc.country || "PK";
    const state = validated.state || visitorLoc.region || null;

    const result = await calculateShipping(country, state, validated.orderSubtotal);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);
    const msg = error instanceof z.ZodError ? error.issues[0]?.message : "Failed to calculate shipping";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { detectTaxRate, calculateTax, getTaxSettings, getVisitorLocation, type TaxType } from "@/lib/tax";

export const dynamic = "force-dynamic";

const calculateTaxSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be >= 0"),
  country: z.string().trim().optional(),
  state: z.string().trim().nullable().optional(),
  city: z.string().trim().nullable().optional(),
  shippingCost: z.coerce.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validated = calculateTaxSchema.parse(body);

    const visitorLoc = getVisitorLocation(req);
    const country = (validated.country || visitorLoc.country || "PK").toUpperCase();
    const state = validated.state || visitorLoc.region || null;
    const city = validated.city || visitorLoc.city || null;

    const settings = await getTaxSettings();
    if (!settings.isEnabled) {
      return NextResponse.json({
        success: true,
        isEnabled: false,
        taxAmount: 0,
        netAmount: validated.amount,
        rate: 0,
        label: "Tax",
        taxType: "exclusive",
        appliedToShipping: false,
      });
    }

    const rateObj = await detectTaxRate(country, state, city);
    if (!rateObj || rateObj.rate <= 0) {
      return NextResponse.json({
        success: true,
        isEnabled: true,
        taxAmount: 0,
        netAmount: validated.amount,
        rate: 0,
        label: rateObj?.label || settings.defaultLabel || "Tax",
        taxType: rateObj?.taxType || settings.defaultTaxType || "exclusive",
        appliedToShipping: Boolean(settings.applyToShipping),
      });
    }

    const applyToShipping = Boolean(settings.applyToShipping);
    const taxableBase = validated.amount + (applyToShipping ? validated.shippingCost : 0);

    const calc = calculateTax(taxableBase, rateObj.rate, rateObj.taxType);

    return NextResponse.json({
      success: true,
      isEnabled: true,
      taxAmount: calc.taxAmount,
      netAmount: calc.netAmount,
      rate: rateObj.rate,
      label: rateObj.label,
      taxType: rateObj.taxType,
      appliedToShipping: applyToShipping,
      country,
      state,
      city,
    });
  } catch (error) {
    console.error("Tax calculation error:", error);
    const msg = error instanceof z.ZodError ? error.issues[0]?.message : "Failed to calculate tax";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

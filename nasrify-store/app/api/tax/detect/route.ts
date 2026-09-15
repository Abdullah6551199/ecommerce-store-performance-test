import { NextRequest, NextResponse } from "next/server";
import { getVisitorLocation, detectTaxRate, getTaxSettings } from "@/lib/tax";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorLoc = getVisitorLocation(req);

    // Prefer query parameter if passed, otherwise use Cloudflare request.cf / header detection
    const country =
      searchParams.get("country")?.trim().toUpperCase() ||
      visitorLoc.country ||
      "PK";

    const state =
      searchParams.get("state")?.trim().toUpperCase() ||
      visitorLoc.region ||
      null;

    const city =
      searchParams.get("city")?.trim() ||
      visitorLoc.city ||
      null;

    const settings = await getTaxSettings();
    const rateObj = await detectTaxRate(country, state, city);

    return NextResponse.json({
      success: true,
      detectedLocation: {
        country: visitorLoc.country,
        region: visitorLoc.region,
        city: visitorLoc.city,
      },
      resolvedLocation: {
        country,
        state,
        city,
      },
      isTaxEnabled: settings.isEnabled,
      taxRate: rateObj,
      applyToShipping: settings.applyToShipping,
    });
  } catch (error) {
    console.error("Tax detection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to detect tax rate" },
      { status: 500 }
    );
  }
}

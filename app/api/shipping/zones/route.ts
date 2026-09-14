import { NextRequest, NextResponse } from "next/server";
import { getActiveShippingZones } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const zones = await getActiveShippingZones();
    return NextResponse.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    console.error("Failed to fetch public shipping zones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shipping zones" },
      { status: 500 }
    );
  }
}

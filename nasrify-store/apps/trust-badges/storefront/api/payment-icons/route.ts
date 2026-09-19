import { NextRequest, NextResponse } from "next/server";
import { listPaymentIcons } from "@/apps/trust-badges/lib/trust-badges";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment-icons (delegated from app)
 * Public endpoint with 20s micro-cache
 */
export async function GET(_req: NextRequest) {
  try {
    const icons = await listPaymentIcons(true);

    return NextResponse.json(
      { success: true, data: icons },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch payment icons",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getProductRatingSummary } from "@/lib/reviews";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]/rating
 * Returns average rating, total review count, and star breakdown
 */
export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: productId } = await context.params;
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const summary = await getProductRatingSummary(productId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("[GET /api/products/[id]/rating] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve rating summary." },
      { status: 500 }
    );
  }
}

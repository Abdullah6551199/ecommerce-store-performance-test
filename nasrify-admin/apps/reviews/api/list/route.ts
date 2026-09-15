import { NextRequest, NextResponse } from "next/server";
import { getProductReviews, getProductRatingSummary } from "@/apps/reviews/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews/list (or apps/reviews/api/list)
 * Returns approved reviews for a product and its rating breakdown.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const sort = (searchParams.get("sort") as "recent" | "helpful" | "highest" | "lowest") || "recent";
    const ratingParam = searchParams.get("rating");
    const rating = ratingParam ? parseInt(ratingParam, 10) : undefined;
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    const [{ reviews, total }, summary] = await Promise.all([
      getProductReviews(productId, {
        status: "approved",
        rating,
        sort,
        limit,
        offset,
      }),
      getProductRatingSummary(productId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        total,
        summary,
      },
    });
  } catch (error) {
    console.error("[GET apps/reviews/api/list] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve reviews." },
      { status: 500 }
    );
  }
}

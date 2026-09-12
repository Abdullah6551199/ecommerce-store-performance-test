import { NextRequest, NextResponse } from "next/server";
import { getProductReviews, getProductRatingSummary, createReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]/reviews
 * Returns approved reviews for the product and rating summary
 */
export async function GET(
  req: NextRequest,
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

    const { searchParams } = new URL(req.url);
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
    console.error("[GET /api/products/[id]/reviews] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve reviews." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/reviews
 * Submits a new customer review (checks verified purchase, applies moderation rules)
 */
export async function POST(
  req: NextRequest,
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

    const body = (await req.json()) as any;
    const { customerName, customerEmail, rating, title, content, images } = body;

    if (!customerName || !customerEmail || !content || rating === undefined) {
      return NextResponse.json(
        { success: false, error: "Customer name, email, rating, and review text are required." },
        { status: 400 }
      );
    }

    const parsedRating = parseInt(String(rating), 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5 stars." },
        { status: 400 }
      );
    }

    const userIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const result = await createReview({
      productId,
      customerName,
      customerEmail,
      rating: parsedRating,
      title,
      content,
      images: Array.isArray(images) ? images : [],
      userIp,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: {
          review: result.review,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/products/[id]/reviews] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit review.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

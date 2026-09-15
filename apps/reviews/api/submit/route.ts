import { NextRequest, NextResponse } from "next/server";
import { createReview } from "@/apps/reviews/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/submit (or apps/reviews/api/submit)
 * Submits a new customer review (checks verified purchase, applies moderation rules)
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { productId, customerName, customerEmail, rating, title, content, images } = body;

    if (!productId || !customerName || !customerEmail || !content || rating === undefined) {
      return NextResponse.json(
        { success: false, error: "Product ID, customer name, email, rating, and review text are required." },
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
    console.error("[POST apps/reviews/api/submit] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit review.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

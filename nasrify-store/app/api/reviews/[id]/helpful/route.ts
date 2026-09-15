import { NextRequest, NextResponse } from "next/server";
import { voteReviewHelpful } from "@/lib/reviews";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/reviews/[id]/helpful
 * Casts a helpful or not-helpful vote on a review
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: reviewId } = await context.params;
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "Review ID is required." },
        { status: 400 }
      );
    }

    const body = (await req.json()) as any;
    const voteType = body?.voteType;

    if (voteType !== "helpful" && voteType !== "not_helpful") {
      return NextResponse.json(
        { success: false, error: "voteType must be 'helpful' or 'not_helpful'." },
        { status: 400 }
      );
    }

    const userIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const result = await voteReviewHelpful(reviewId, userIp, voteType);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[POST /api/reviews/[id]/helpful] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to record vote.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

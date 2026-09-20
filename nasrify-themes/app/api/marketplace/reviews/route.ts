import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  getListingReviews,
  createReview,
} from "@/lib/marketplace/reviews";
import { getAuthenticatedMarketplaceUser } from "@/lib/marketplace/auth";

export const dynamic = "force-dynamic";

const createReviewSchema = z.object({
  listingType: z.enum(["app", "theme"]).default("theme"),
  listingId: z.string().min(1, "listingId is required"),
  rating: z.number().int().min(1, "Rating must be 1 to 5").max(5, "Rating must be 1 to 5"),
  title: z.string().max(150, "Title must be at most 150 characters").optional().nullable(),
  body: z.string().max(1000, "Body must be at most 1000 characters").optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const type = (searchParams.get("type") as "app" | "theme") || "theme";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = 20; // STRICT: LIMIT 20 per page
    const offset = (page - 1) * limit;

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "listingId query parameter is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const currentUser = await getAuthenticatedMarketplaceUser(req);
    const reviews = await getListingReviews(db, type, listingId, limit, offset, currentUser?.id);

    return NextResponse.json({
      success: true,
      reviews,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedMarketplaceUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to submit a review" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = createReviewSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid review data" },
        { status: 400 }
      );
    }

    const { listingType, listingId, rating, title, body: reviewBody } = parseResult.data;
    const db = getDb();

    const result = await createReview(db, {
      listingType,
      listingId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      rating,
      title: title || null,
      body: reviewBody || null,
    });

    if (!result.success) {
      const isDuplicate = result.error?.toLowerCase().includes("already submitted");
      return NextResponse.json(
        { success: false, error: result.error },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    return NextResponse.json(
      { success: true, reviewId: result.reviewId },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

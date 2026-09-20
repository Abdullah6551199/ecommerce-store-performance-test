import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  updateOwnReview,
  deleteOwnReview,
} from "@/lib/marketplace/reviews";
import { getAuthenticatedMarketplaceUser } from "@/lib/marketplace/auth";

export const dynamic = "force-dynamic";

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(150).optional().nullable(),
  body: z.string().max(1000).optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedMarketplaceUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = updateReviewSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await updateOwnReview(db, id, user.id, parseResult.data);

    if (!result.success) {
      const isAuth = result.error?.includes("authorized");
      const isNotFound = result.error?.includes("not found");
      return NextResponse.json(
        { success: false, error: result.error },
        { status: isNotFound ? 404 : isAuth ? 403 : 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedMarketplaceUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getDb();
    const result = await deleteOwnReview(db, id, user.id, user.isTeam);

    if (!result.success) {
      const isAuth = result.error?.includes("authorized");
      const isNotFound = result.error?.includes("not found");
      return NextResponse.json(
        { success: false, error: result.error },
        { status: isNotFound ? 404 : isAuth ? 403 : 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}

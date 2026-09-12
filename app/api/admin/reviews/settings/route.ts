import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getReviewSettings, updateReviewSettings } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reviews/settings
 * Retrieve current review settings
 */
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const settings = await getReviewSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("[GET /api/admin/reviews/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review settings." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/reviews/settings
 * Update review settings
 */
export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as any;
    const { autoApprove, requireVerifiedPurchase, allowImages, maxImages } = body;

    const updated = await updateReviewSettings({
      autoApprove: autoApprove !== undefined ? Boolean(autoApprove) : undefined,
      requireVerifiedPurchase:
        requireVerifiedPurchase !== undefined ? Boolean(requireVerifiedPurchase) : undefined,
      allowImages: allowImages !== undefined ? Boolean(allowImages) : undefined,
      maxImages: maxImages !== undefined ? parseInt(String(maxImages), 10) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/reviews/settings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review settings." },
      { status: 500 }
    );
  }
}

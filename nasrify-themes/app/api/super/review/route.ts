import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { reviewThemeListing } from "@/lib/themes/marketplace";

export const dynamic = "force-dynamic";

function isSuperAdminUser(email: string): boolean {
  const allowed = (
    process.env.SUPER_ADMIN_EMAILS || "admin@apexstore.com,admin@example.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return allowed.includes(email.toLowerCase());
}

const reviewSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  action: z.enum(["approve", "reject", "delist"]),
  rejectionReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdminUser(admin.email) && admin.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Nasrify Team access required" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = reviewSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid review payload" },
        { status: 400 }
      );
    }

    const { listingId, action, rejectionReason } = parseResult.data;

    const ok = await reviewThemeListing({
      listingId,
      action,
      reviewerEmail: admin.email,
      rejectionReason,
    });

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to update theme status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Theme successfully ${
        action === "approve" ? "approved & published live" : action === "reject" ? "rejected" : "delisted"
      }`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to review theme" },
      { status: 500 }
    );
  }
}

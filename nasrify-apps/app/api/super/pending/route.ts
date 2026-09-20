import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getPendingListings } from "@/lib/marketplace/listings";

export const dynamic = "force-dynamic";

function isSuperAdminUser(email: string): boolean {
  const allowed = (
    process.env.SUPER_ADMIN_EMAILS || "admin@apexstore.com,admin@example.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return allowed.includes(email.toLowerCase());
}

export async function GET(_req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdminUser(admin.email)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Nasrify Team access required" },
        { status: 403 }
      );
    }

    const pending = await getPendingListings();
    return NextResponse.json({
      success: true,
      pending,
      count: pending.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch pending listings" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getPendingThemes } from "@/lib/themes/marketplace";

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

    if (!isSuperAdminUser(admin.email) && admin.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Admin access required" },
        { status: 403 }
      );
    }

    const pending = await getPendingThemes();
    return NextResponse.json({
      success: true,
      pending,
      count: pending.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch pending themes" },
      { status: 500 }
    );
  }
}

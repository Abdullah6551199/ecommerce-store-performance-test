import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDeveloperListings } from "@/lib/marketplace/listings";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const apps = await getDeveloperListings(admin.email);
    return NextResponse.json({
      success: true,
      apps,
      count: apps.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch developer apps" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDeveloperThemes } from "@/lib/themes/marketplace";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const themes = await getDeveloperThemes(admin.email);
    return NextResponse.json({
      success: true,
      themes,
      count: themes.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch developer themes" },
      { status: 500 }
    );
  }
}

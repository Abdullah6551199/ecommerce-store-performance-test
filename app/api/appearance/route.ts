import { NextResponse } from "next/server";
import { getThemeSettings } from "@/lib/theme";

export const dynamic = "force-dynamic";

/**
 * GET /api/appearance
 * Public endpoint returning current store theme, styling tokens, and branding assets.
 */
export async function GET() {
  try {
    const theme = await getThemeSettings();
    return NextResponse.json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error("[GET /api/appearance] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load appearance settings." },
      { status: 500 }
    );
  }
}

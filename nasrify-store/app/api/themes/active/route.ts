import { NextResponse } from "next/server";
import { getActiveTheme } from "@/lib/themes/loader";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const theme = await getActiveTheme();
    return NextResponse.json(
      { success: true, theme },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load active theme" },
      { status: 500 }
    );
  }
}

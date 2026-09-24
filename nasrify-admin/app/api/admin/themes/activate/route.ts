import { NextRequest, NextResponse } from "next/server";
import { activateTheme } from "@/lib/themes/themes-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { themeId, performedBy } = body as {
      themeId?: string;
      performedBy?: string;
    };

    if (!themeId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: themeId" },
        { status: 400 }
      );
    }

    const result = await activateTheme(themeId, performedBy || "admin");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to activate theme" },
      { status: 500 }
    );
  }
}

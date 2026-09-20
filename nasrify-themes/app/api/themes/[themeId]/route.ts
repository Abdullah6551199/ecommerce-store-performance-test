import { NextRequest, NextResponse } from "next/server";
import { getThemeByThemeId } from "@/lib/themes/marketplace";
import { getThemeVersions } from "@/lib/themes/versions";
import { getThemeInstallCount } from "@/lib/themes/installs";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ themeId: string }>;
}

/**
 * GET /api/themes/[themeId]
 * Returns theme details, version history, and active install count.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { themeId } = await params;
    if (!themeId) {
      return NextResponse.json({ success: false, error: "Missing theme ID" }, { status: 400 });
    }

    const theme = await getThemeByThemeId(themeId);
    if (!theme) {
      return NextResponse.json({ success: false, error: "Theme not found" }, { status: 404 });
    }

    const [versions, installCount] = await Promise.all([
      getThemeVersions(theme.id),
      getThemeInstallCount(theme.id),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...theme,
          versions,
          installCount,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=20, s-maxage=20, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve theme" },
      { status: 500 }
    );
  }
}

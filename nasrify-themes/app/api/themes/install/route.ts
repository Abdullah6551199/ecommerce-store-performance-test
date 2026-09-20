import { NextRequest, NextResponse } from "next/server";
import { getThemeByThemeId } from "@/lib/themes/marketplace";
import { recordThemeInstall } from "@/lib/themes/installs";

export const dynamic = "force-dynamic";

/**
 * GET /api/themes/install
 * Query params:
 *   - themeId (required): theme identifier
 *   - storeId (optional): store identifier (defaults to "default-store")
 * Records install record in D1 and redirects to the admin worker theme installation flow.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const themeId = searchParams.get("themeId");
    const storeId = searchParams.get("storeId") || "default-store";

    if (!themeId) {
      return NextResponse.json({ success: false, error: "Missing themeId parameter" }, { status: 400 });
    }

    const theme = await getThemeByThemeId(themeId);
    if (theme) {
      await recordThemeInstall({ listingId: theme.id, storeId });
    }

    const adminBaseUrl =
      process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
    const redirectUrl = `${adminBaseUrl}/admin/themes?install=${encodeURIComponent(themeId)}`;

    return NextResponse.redirect(redirectUrl, 302);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process theme installation" },
      { status: 500 }
    );
  }
}

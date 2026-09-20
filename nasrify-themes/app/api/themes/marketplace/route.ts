import { NextRequest, NextResponse } from "next/server";
import { getApprovedThemeListings } from "@/lib/themes/marketplace";

export const dynamic = "force-dynamic";

/**
 * GET /api/themes/marketplace
 * Returns approved themes with micro-cache.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const sort = (searchParams.get("sort") as "newest" | "name" | "price_asc" | "price_desc") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const themes = await getApprovedThemeListings({
      search,
      category,
      sort,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        data: themes,
        meta: {
          count: themes.length,
          limit,
          offset,
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
      { success: false, error: error.message || "Failed to retrieve themes." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getApprovedListings } from "@/lib/marketplace/listings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const sort = (searchParams.get("sort") as any) || "newest";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const apps = await getApprovedListings({
      search,
      category,
      sort,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        apps,
        count: apps.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch marketplace apps" },
      { status: 500 }
    );
  }
}

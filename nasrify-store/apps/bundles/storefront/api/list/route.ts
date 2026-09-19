import { NextRequest, NextResponse } from "next/server";
import { listBundles } from "@/apps/bundles/lib/bundles";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const search = searchParams.get("search")?.trim();
    const isFeaturedParam = searchParams.get("isFeatured");
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === "true" : undefined;

    const bundles = await listBundles({
      status: "active",
      limit,
      offset,
      search: search || undefined,
      isFeatured,
      sortBy: "sortOrder",
      sortOrder: "asc",
    });

    return NextResponse.json(
      { success: true, bundles, count: bundles.length },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/apps/bundles/list] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

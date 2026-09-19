import { NextRequest, NextResponse } from "next/server";
import { listBundles } from "@/lib/bundles";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const isFeaturedParam = searchParams.get("isFeatured");
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === "true" : undefined;
    const sortBy = (searchParams.get("sortBy") || "sortOrder") as "name" | "price" | "discount" | "createdAt" | "sortOrder";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    const bundles = await listBundles({
      status: "active",
      search: search || undefined,
      isFeatured,
      sortBy,
      sortOrder,
      limit,
      offset,
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
    console.error("GET /api/bundles error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

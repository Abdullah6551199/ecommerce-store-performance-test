import { NextResponse } from "next/server";
import { getActiveCategories, buildCategoryTree } from "@/lib/categories";

export const dynamic = "force-dynamic";

/**
 * GET /api/categories
 * Public endpoint: Returns all active categories formatted with nested hierarchy.
 */
export async function GET() {
  try {
    const activeItems = await getActiveCategories();
    const tree = buildCategoryTree(activeItems);

    return NextResponse.json(
      {
        success: true,
        data: {
          categories: activeItems,
          tree,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/categories] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

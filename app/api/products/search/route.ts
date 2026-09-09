import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/search?q=...
 * Public search endpoint: queries published products by keyword across name, sku, brand, tags, and category.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit")) || 20;

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        query: "",
        count: 0,
      });
    }

    const results = await searchProducts(query, {
      limit,
      publishedOnly: true,
    });

    return NextResponse.json({
      success: true,
      data: results,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error("[GET /api/products/search] Error:", error);
    return NextResponse.json(
      { success: false, error: "Search query failed." },
      { status: 500 }
    );
  }
}

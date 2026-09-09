import { NextRequest, NextResponse } from "next/server";
import { searchProductsAdvanced, type AdvancedSearchParams } from "@/lib/products";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/search
 * Public search endpoint supporting text search, facets, filtering, and sorting:
 * - q: text search query
 * - minPrice, maxPrice: price range numbers
 * - category: category slug or id
 * - brand: brand name
 * - tags: comma-separated list of tags
 * - inStock: boolean ("true" / "false")
 * - sort: "price_asc" | "price_desc" | "newest" | "popular"
 * - limit: number (default 40)
 * - offset: number (default 0)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const minPriceRaw = searchParams.get("minPrice");
    const maxPriceRaw = searchParams.get("maxPrice");
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const tagsRaw = searchParams.get("tags");
    const inStockRaw = searchParams.get("inStock");
    const sortRaw = searchParams.get("sort");
    const limitRaw = searchParams.get("limit");
    const offsetRaw = searchParams.get("offset");

    const minPrice = minPriceRaw && !isNaN(Number(minPriceRaw)) ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw && !isNaN(Number(maxPriceRaw)) ? Number(maxPriceRaw) : undefined;
    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;
    const inStock = inStockRaw === "true" || inStockRaw === "1";
    const sort =
      sortRaw === "price_asc" || sortRaw === "price_desc" || sortRaw === "newest" || sortRaw === "popular"
        ? sortRaw
        : undefined;

    const limit = limitRaw && !isNaN(Number(limitRaw)) ? Number(limitRaw) : 40;
    const offset = offsetRaw && !isNaN(Number(offsetRaw)) ? Number(offsetRaw) : 0;

    const params: AdvancedSearchParams = {
      query,
      minPrice,
      maxPrice,
      category,
      brand,
      tags,
      inStock,
      sort,
      limit,
      offset,
      publishedOnly: true,
    };

    const result = await searchProductsAdvanced(params);

    return NextResponse.json({
      success: true,
      data: result.products,
      total: result.total,
      count: result.products.length,
      facets: result.facets,
      query,
      filters: {
        minPrice,
        maxPrice,
        category,
        brand,
        tags: tags || [],
        inStock,
        sort: sort || "newest",
      },
    });
  } catch (error) {
    console.error("[GET /api/products/search] Error:", error);
    return NextResponse.json(
      { success: false, error: "Search query failed." },
      { status: 500 }
    );
  }
}


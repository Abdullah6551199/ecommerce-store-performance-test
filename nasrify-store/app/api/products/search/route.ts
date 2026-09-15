import { NextRequest, NextResponse } from "next/server";
import { searchProductsAdvanced, type AdvancedSearchParams } from "@/lib/products";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/search
 * Public search endpoint supporting text search, facets, filtering, and sorting.
 * Cached at Cloudflare edge for 60s with stale-while-revalidate.
 */
export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

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

    const pageRaw = searchParams.get("page");
    const limit = limitRaw && !isNaN(Number(limitRaw)) ? Number(limitRaw) : 12;
    const page = pageRaw && !isNaN(Number(pageRaw)) ? Math.max(1, Number(pageRaw)) : 1;
    const offset = offsetRaw && !isNaN(Number(offsetRaw)) ? Number(offsetRaw) : (page - 1) * limit;

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

    const res = NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "Cloudflare-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "CF-Cache-Status": "MISS",
        },
      }
    );

    putEdgeCache(req, res, 60, 600);

    return res;
  } catch (error) {
    console.error("[GET /api/products/search] Error:", error);
    return NextResponse.json(
      { success: false, error: "Search query failed." },
      { status: 500 }
    );
  }
}


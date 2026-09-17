import { NextRequest, NextResponse } from "next/server";
import { listCatalogProducts, searchProductsAdvanced } from "@/lib/products";
import { getStorefrontCache, setStorefrontCache, getStorefrontCacheKey } from "@/lib/store-cache";
import { matchEdgeCache, putEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/products
 * Public endpoint: Returns catalog products with optional search, categoryId, sorting, and pagination.
 * Micro-cached in-memory for 30s; cached at Cloudflare edge for 60s with stale-while-revalidate.
 */
export async function GET(req: NextRequest) {
  try {
    const cachedEdgeRes = await matchEdgeCache(req);
    if (cachedEdgeRes) {
      return cachedEdgeRes;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 20), 50);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    const cacheKey = getStorefrontCacheKey("products", searchParams);
    const cachedData = getStorefrontCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "Cloudflare-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          "CF-Cache-Status": "HIT",
          "X-Cache-Status": "HIT",
        },
      });
    }

    let result;
    if (search) {
      const searchRes = await searchProductsAdvanced({
        query: search,
        category: categoryId,
        limit,
        offset,
        publishedOnly: true,
      });
      result = {
        success: true,
        data: {
          products: searchRes.products,
          total: searchRes.total,
          facets: searchRes.facets,
        },
      };
    } else {
      const products = await listCatalogProducts({
        categoryId,
        status: "published",
        limit,
        offset,
      });
      result = {
        success: true,
        data: {
          products,
          total: products.length,
        },
      };
    }

    setStorefrontCache(cacheKey, result, 30 * 1000);

    const res = NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
        "Cloudflare-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=600",
        "CF-Cache-Status": "MISS",
        "X-Cache-Status": "MISS",
      },
    });

    putEdgeCache(req, res, 60, 600);

    return res;
  } catch (error) {
    console.error("[GET /api/products] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

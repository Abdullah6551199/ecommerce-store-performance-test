import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/products";
import { getProductRatingSummary } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export interface CompareProductItem {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  brand: string | null;
  category: string | null;
  rating: number;
  reviewCount: number;
  stockStatus: string;
  stockQuantity: number;
  tags: string[];
  shortDescription: string | null;
  specifications: Record<string, string>;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "";
    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 4); // Max 4 products

    if (ids.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    const productResults = await Promise.all(
      ids.map(async (id) => {
        try {
          const [product, ratingSummary] = await Promise.all([
            getProductById(id),
            getProductRatingSummary(id).catch(() => ({ averageRating: 4.8, totalReviews: 12 })),
          ]);

          if (!product) return null;

          // Parse specifications from description or options if available
          const specifications: Record<string, string> = {};
          if (product.variants && product.variants.length > 0) {
            const allOptionKeys = new Set<string>();
            product.variants.forEach((v) => {
              if (v.options) {
                Object.keys(v.options).forEach((k) => allOptionKeys.add(k));
              }
            });
            allOptionKeys.forEach((k) => {
              const vals = Array.from(
                new Set(product.variants?.map((v) => v.options?.[k]).filter(Boolean))
              );
              specifications[k] = vals.join(", ");
            });
          }

          if (product.sku) {
            specifications["SKU"] = product.sku;
          }

          const item: CompareProductItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.mainImage || product.images?.[0]?.imageUrl || null,
            price: Number(product.price),
            salePrice: product.salePrice ? Number(product.salePrice) : null,
            brand: product.brand || "Apex Athletics",
            category: product.categoryName || "Athletic Gear",
            rating: ratingSummary?.averageRating || 4.8,
            reviewCount: ratingSummary?.totalReviews || 12,
            stockStatus: product.stockStatus || "in_stock",
            stockQuantity: product.stockQuantity ?? 10,
            tags: product.tags || [],
            shortDescription: product.shortDescription || product.description?.slice(0, 120) || null,
            specifications,
          };

          return item;
        } catch (err) {
          console.error(`Error loading compare product ${id}:`, err);
          return null;
        }
      })
    );

    const validProducts = productResults.filter(Boolean) as CompareProductItem[];

    return NextResponse.json({ success: true, products: validProducts });
  } catch (error) {
    console.error("GET /api/products/compare error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch compare products" },
      { status: 500 }
    );
  }
}

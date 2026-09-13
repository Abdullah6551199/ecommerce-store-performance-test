import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/products";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/batch?ids=id1,id2,id3,id4
 * Fetches batch products for recently viewed items, recommendations, etc.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ products: [] });
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (ids.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const prods = await getProductsByIds(ids);
    return NextResponse.json({ products: prods });
  } catch (error) {
    console.error("[GET /api/products/batch] Error:", error);
    return NextResponse.json({ products: [], error: "Failed to fetch batch products" }, { status: 500 });
  }
}

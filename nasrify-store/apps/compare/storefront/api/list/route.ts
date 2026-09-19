import { NextRequest, NextResponse } from "next/server";
import { getCompareProducts } from "@/apps/compare/lib/compare";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "";
    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    const products = await getCompareProducts(ids, 6);

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          "Cache-Control": "public, max-age=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/apps/compare/list] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch compare products" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { isDigitalProduct } from "@/apps/digital-products/lib/digital-products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, isDigital: false }, { status: 400 });
    }

    const digital = await isDigitalProduct(productId);

    return NextResponse.json(
      {
        success: true,
        productId,
        isDigital: digital,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=20, s-maxage=20, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json({ success: false, isDigital: false }, { status: 500 });
  }
}

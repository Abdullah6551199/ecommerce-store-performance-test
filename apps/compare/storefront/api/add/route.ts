import { NextRequest, NextResponse } from "next/server";
import { getCompareProduct } from "@/apps/compare/lib/compare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    const productId = body?.productId;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid productId" },
        { status: 400 }
      );
    }

    const product = await getCompareProduct(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product verified and ready to compare",
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process compare add request" },
      { status: 500 }
    );
  }
}

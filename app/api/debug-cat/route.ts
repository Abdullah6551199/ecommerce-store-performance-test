import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug, getCategoryWithHierarchy } from "@/lib/categories";
import { getProductsByCategoryPaginated } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const slug = "footwear";
    const step1 = await getCategoryBySlug(slug);
    const step2 = await getCategoryWithHierarchy(slug);
    const step3 = await getProductsByCategoryPaginated(step1?.id || "cat-footwear", 1, 12);

    return NextResponse.json({
      success: true,
      step1,
      step2,
      step3,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

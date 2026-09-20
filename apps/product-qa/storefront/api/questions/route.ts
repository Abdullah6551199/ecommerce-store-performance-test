import { NextRequest, NextResponse } from "next/server";
import { getProductQuestions } from "@/apps/product-qa/lib/questions";
import { isAppEnabled } from "@/lib/apps/installed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isEnabled = await isAppEnabled("product-qa").catch(() => true);
    if (!isEnabled) {
      return NextResponse.json(
        { success: true, data: { questions: [], total: 0 }, disabled: true },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'productId' parameter" },
        { status: 400 }
      );
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const customerEmail = searchParams.get("customerEmail") || null;

    const result = await getProductQuestions(productId, page, limit, customerEmail);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch product questions" },
      { status: 500 }
    );
  }
}

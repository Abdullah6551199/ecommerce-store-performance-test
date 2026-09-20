import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getQuestionsForAdmin } from "@/apps/product-qa/lib/questions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "all") as any;
    const productId = searchParams.get("productId") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    let hasAnswers: boolean | "all" = "all";
    if (searchParams.get("hasAnswers") === "true") hasAnswers = true;
    if (searchParams.get("hasAnswers") === "false") hasAnswers = false;

    const data = await getQuestionsForAdmin(
      { status, productId, search, hasAnswers },
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: {
        questions: data.questions,
        total: data.total,
        page,
        limit,
      },
      questions: data.questions,
      total: data.total,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

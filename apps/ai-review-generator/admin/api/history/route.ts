import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getGenerationHistory, getAIStats } from "@/apps/ai-review-generator/lib/inserts";

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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const [history, stats] = await Promise.all([
      getGenerationHistory(page, limit),
      getAIStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: history.items,
        total: history.total,
        page,
        limit,
        stats,
      },
    });
  } catch (err: any) {
    console.error("[history/route] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch generation history." },
      { status: 500 }
    );
  }
}

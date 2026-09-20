import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteGenerationBatch } from "@/apps/ai-review-generator/lib/inserts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const batchId = body.batchId?.toString().trim();

    if (!batchId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'batchId'" },
        { status: 400 }
      );
    }

    const res = await deleteGenerationBatch(batchId);

    return NextResponse.json({
      success: res.success,
      message: `Batch ${batchId} deleted successfully.`,
    });
  } catch (err: any) {
    console.error("[delete-batch/route] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete batch." },
      { status: 500 }
    );
  }
}

export const DELETE = POST;

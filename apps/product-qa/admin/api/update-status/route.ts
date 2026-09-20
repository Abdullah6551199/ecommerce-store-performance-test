import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { updateQuestionStatus, pinQuestion } from "@/apps/product-qa/lib/questions";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  status: z.enum(["pending", "published", "hidden"]).optional(),
  isPinned: z.boolean().optional(),
});

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
    const parseResult = updateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid update payload" },
        { status: 400 }
      );
    }

    const { id, status, isPinned } = parseResult.data;

    if (status) {
      await updateQuestionStatus(id, status);
    }

    if (isPinned !== undefined) {
      await pinQuestion(id, isPinned);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update question status" },
      { status: 500 }
    );
  }
}

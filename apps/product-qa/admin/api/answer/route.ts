import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { createAnswer, updateAnswer, deleteAnswer } from "@/apps/product-qa/lib/answers";

export const dynamic = "force-dynamic";

const answerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: z.string().trim().min(2, "Answer must be at least 2 characters").max(1500, "Answer cannot exceed 1500 characters"),
  authorName: z.string().trim().optional(),
  isAccepted: z.boolean().optional(),
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
    const parseResult = answerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid answer payload" },
        { status: 400 }
      );
    }

    const answer = await createAnswer({
      questionId: parseResult.data.questionId,
      authorType: "admin",
      authorName: parseResult.data.authorName || "Store Support",
      authorId: admin.id || null,
      answer: parseResult.data.answer,
    });

    if (parseResult.data.isAccepted) {
      await updateAnswer(answer.id, { isAccepted: true });
      answer.isAccepted = true;
    }

    return NextResponse.json({ success: true, data: answer }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to post answer" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Answer ID is required" }, { status: 400 });
    }

    const ok = await deleteAnswer(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete answer" },
      { status: 500 }
    );
  }
}

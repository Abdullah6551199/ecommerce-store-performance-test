import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteQuestion } from "@/apps/product-qa/lib/questions";

export const dynamic = "force-dynamic";

const deleteSchema = z.object({
  id: z.string().optional(),
  ids: z.array(z.string()).optional(),
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
    const parseResult = deleteSchema.safeParse(body);

    if (!parseResult.success || (!parseResult.data.id && (!parseResult.data.ids || parseResult.data.ids.length === 0))) {
      return NextResponse.json(
        { success: false, error: "Must provide question 'id' or list of 'ids' to delete." },
        { status: 400 }
      );
    }

    const { id, ids } = parseResult.data;
    const targetIds = ids && ids.length > 0 ? ids : id ? [id] : [];

    for (const qId of targetIds) {
      await deleteQuestion(qId);
    }

    return NextResponse.json({ success: true, count: targetIds.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete question(s)" },
      { status: 500 }
    );
  }
}

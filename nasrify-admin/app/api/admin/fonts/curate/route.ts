import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toggleCurateFont } from "@/lib/fonts/font-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CurateSchema = z.object({
  fontId: z.string(),
  isCurated: z.union([z.boolean(), z.number()]).transform((val) => Boolean(val)),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = (await req.json().catch(() => ({}))) as any;
    const parsed = CurateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await toggleCurateFont(parsed.data.fontId, parsed.data.isCurated);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update font curate status" },
      { status: 500 }
    );
  }
}

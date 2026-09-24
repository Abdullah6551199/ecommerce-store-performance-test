import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { publishThemeDraft } from "@/lib/themes/theme-editor-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PublishSchema = z.object({
  theme_json: z.record(z.string(), z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = (await req.json().catch(() => ({}))) as any;
    const normalizedBody = {
      theme_json: rawBody.theme_json || rawBody.themeJson,
    };

    const parsed = PublishSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid theme JSON payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await publishThemeDraft(
      parsed.data.theme_json,
      admin.email || "admin"
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to publish theme" },
      { status: 500 }
    );
  }
}

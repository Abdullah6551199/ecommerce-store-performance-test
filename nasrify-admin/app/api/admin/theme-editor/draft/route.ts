import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getThemeDraft, saveThemeDraft } from "@/lib/themes/theme-editor-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DraftSchema = z.object({
  themeId: z.string().optional(),
  page_type: z.string().optional(),
  theme_json: z.record(z.string(), z.any()),
});

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const pageType = req.nextUrl.searchParams.get("page") || "homepage";
    const draft = await getThemeDraft(pageType);
    return NextResponse.json({ success: true, ...draft });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load draft" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = (await req.json().catch(() => ({}))) as any;
    const pageType =
      rawBody.page_type ||
      rawBody.pageType ||
      req.nextUrl.searchParams.get("page") ||
      "homepage";

    const normalizedBody = {
      themeId: rawBody.themeId || "theme-default",
      page_type: pageType,
      theme_json: rawBody.theme_json || rawBody.themeJson,
    };

    const parsed = DraftSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid theme JSON payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await saveThemeDraft(
      parsed.data.themeId || "theme-default",
      parsed.data.theme_json,
      admin.email || "admin",
      pageType
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}

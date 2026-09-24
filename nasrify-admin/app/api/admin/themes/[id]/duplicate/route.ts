import { NextRequest, NextResponse } from "next/server";
import { duplicateTheme } from "@/lib/themes/themes-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = ((await req.json().catch(() => ({}))) || {}) as Record<string, any>;
    const performedBy = body.performedBy || "admin";

    const cloned = await duplicateTheme(id, performedBy);
    return NextResponse.json({ success: true, theme: cloned });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to duplicate theme" },
      { status: 500 }
    );
  }
}

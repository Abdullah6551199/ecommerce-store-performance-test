import { NextRequest, NextResponse } from "next/server";
import { listThemes } from "@/lib/themes/themes-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "all") as "all" | "builtin" | "custom";
    const result = await listThemes(filter);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list themes" },
      { status: 500 }
    );
  }
}

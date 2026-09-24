import { NextRequest, NextResponse } from "next/server";
import { getThemeById, deleteTheme } from "@/lib/themes/themes-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const theme = await getThemeById(id);
    if (!theme) {
      return NextResponse.json({ success: false, error: "Theme not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, theme });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load theme" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteTheme(id, "admin");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete theme" },
      { status: 400 }
    );
  }
}

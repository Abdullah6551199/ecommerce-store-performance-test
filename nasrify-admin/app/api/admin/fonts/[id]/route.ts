import { NextRequest, NextResponse } from "next/server";
import { getFontById, deleteFont } from "@/lib/fonts/font-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const font = await getFontById(id);

    if (!font) {
      return NextResponse.json({ success: false, error: "Font not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, font });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to get font" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteFont(id);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete font" },
      { status: 500 }
    );
  }
}

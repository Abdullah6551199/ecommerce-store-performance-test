import { NextRequest, NextResponse } from "next/server";
import { listFonts } from "@/lib/fonts/font-service";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const curatedOnly = searchParams.get("curated") === "1";
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100;

    const fontList = await listFonts({
      curatedOnly,
      category,
      search,
      limit,
    });

    return NextResponse.json({
      success: true,
      fonts: fontList,
      count: fontList.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list fonts" },
      { status: 500 }
    );
  }
}

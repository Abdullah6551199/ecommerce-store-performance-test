import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { resetPageToDefault } from "@/lib/cms";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const resetPage = await resetPageToDefault(id);
    if (!resetPage) {
      return NextResponse.json(
        { success: false, error: "Page not found or cannot be reset." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page restored to default template.",
      data: { page: resetPage },
    });
  } catch (error: any) {
    console.error("[POST /api/admin/pages/[id]/reset] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reset page." },
      { status: 500 }
    );
  }
}

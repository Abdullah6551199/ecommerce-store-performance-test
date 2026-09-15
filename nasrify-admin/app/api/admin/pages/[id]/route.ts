import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getPageById, updatePage, deletePage, resetPageToDefault } from "@/lib/cms";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
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
    const page = await getPageById(id);
    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { page } });
  } catch (error) {
    console.error("[GET /api/admin/pages/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
    const body = (await req.json()) as any;

    if (body.action === "reset_default") {
      const resetPage = await resetPageToDefault(id);
      return NextResponse.json({
        success: true,
        message: "Page restored to default template.",
        data: { page: resetPage },
      });
    }

    const updated = await updatePage(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Page not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page updated successfully.",
      data: { page: updated },
    });
  } catch (error: any) {
    console.error("[PUT /api/admin/pages/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update page." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
    const success = await deletePage(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Could not delete page." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/pages/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete page." },
      { status: 500 }
    );
  }
}

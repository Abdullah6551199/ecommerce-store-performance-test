import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { updateFaq, deleteFaq } from "@/lib/cms";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
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

    const updated = await updateFaq(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "FAQ not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "FAQ updated successfully.",
      data: { faq: updated },
    });
  } catch (error: any) {
    console.error("[PUT /api/admin/faqs/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update FAQ." },
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
    const success = await deleteFaq(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Could not delete FAQ." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "FAQ deleted successfully.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/faqs/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete FAQ." },
      { status: 500 }
    );
  }
}

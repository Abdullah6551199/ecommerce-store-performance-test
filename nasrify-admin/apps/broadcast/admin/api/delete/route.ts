import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteAdminBroadcast } from "@/apps/broadcast/lib/broadcasts";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = (await req.json().catch(() => ({}))) as any;
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Broadcast ID is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteAdminBroadcast(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Broadcast not found or could not be deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Broadcast deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete broadcast",
      },
      { status: 500 }
    );
  }
}

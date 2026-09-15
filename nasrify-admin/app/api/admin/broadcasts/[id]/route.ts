import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getAdminBroadcastDetail,
  deleteAdminBroadcast,
} from "@/lib/broadcasts";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const broadcast = await getAdminBroadcastDetail(id);
    if (!broadcast) {
      return NextResponse.json(
        { success: false, error: "Broadcast not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, broadcast });
  } catch (err) {
    console.error("[GET /api/admin/broadcasts/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch broadcast" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const deleted = await deleteAdminBroadcast(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Broadcast not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Broadcast deleted successfully",
    });
  } catch (err) {
    console.error("[DELETE /api/admin/broadcasts/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete broadcast" },
      { status: 500 }
    );
  }
}

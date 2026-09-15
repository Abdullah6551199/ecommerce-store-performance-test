import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { updateTrustBadge, deleteTrustBadge } from "@/lib/trust-badges";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await req.json()) as any;

    const updated = await updateTrustBadge(id, {
      icon: body.icon,
      title: body.title,
      description: body.description,
      location: body.location,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Trust badge not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/admin/trust-badges/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update trust badge" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteTrustBadge(id);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("DELETE /api/admin/trust-badges/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete trust badge" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { duplicateBundle } from "@/lib/bundles";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const duplicated = await duplicateBundle(id);

    if (!duplicated) {
      return NextResponse.json(
        { success: false, error: "Source bundle not found to duplicate" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, bundle: duplicated }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/bundles/[id]/duplicate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to duplicate bundle" },
      { status: 500 }
    );
  }
}

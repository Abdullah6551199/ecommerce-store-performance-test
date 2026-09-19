import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteBundle } from "@/apps/bundles/lib/bundles";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const body = (await req.json().catch(() => null)) as { id?: string } | null;
    const id = searchParams.get("id") || body?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing bundle id" },
        { status: 400 }
      );
    }

    const success = await deleteBundle(id);
    try {
      revalidatePath("/bundles");
    } catch {
      // Revalidation best-effort
    }

    return NextResponse.json({ success, message: "Bundle deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/apps/bundles/admin/delete] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { updateBundle } from "@/apps/bundles/lib/bundles";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const body = (await req.json().catch(() => null)) as ({ id?: string } & any) | null;
    const id = searchParams.get("id") || body?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing bundle id" },
        { status: 400 }
      );
    }

    const updated = await updateBundle(id, body || {});
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/bundles");
    } catch {
      // Revalidation best-effort
    }

    return NextResponse.json({ success: true, bundle: updated });
  } catch (error) {
    console.error("[PUT /api/apps/bundles/admin/update] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

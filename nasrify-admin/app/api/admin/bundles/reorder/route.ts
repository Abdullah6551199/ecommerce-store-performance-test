import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { reorderBundles } from "@/lib/bundles";

export const dynamic = "force-dynamic";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.coerce.number(),
    })
  ).min(1, "Items array must not be empty"),
});

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    await reorderBundles(parsed.data.items);
    return NextResponse.json({ success: true, message: "Bundles reordered successfully" });
  } catch (error) {
    console.error("PUT /api/admin/bundles/reorder error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder bundles" },
      { status: 500 }
    );
  }
}

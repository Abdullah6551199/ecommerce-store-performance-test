import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { updateDigitalProduct } from "@/apps/digital-products/lib/digital-products";

export const dynamic = "force-dynamic";

const updateDigitalProductSchema = z.object({
  id: z.string().min(1, "ID is required"),
  files: z
    .array(
      z.object({
        name: z.string().min(1),
        size: z.number().min(0),
        mime: z.string(),
        r2_key: z.string().min(1),
      })
    )
    .optional(),
  downloadLimit: z.number().int().min(1).max(100).optional(),
  expiryDays: z.number().int().min(1).max(365).optional(),
  licenseEnabled: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parse = updateDigitalProductSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { id, ...data } = parse.data;
    const ok = await updateDigitalProduct(id, data);

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to update digital product." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Digital product updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update digital product" },
      { status: 500 }
    );
  }
}

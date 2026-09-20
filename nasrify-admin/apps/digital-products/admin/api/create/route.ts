import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { createDigitalProduct } from "@/apps/digital-products/lib/digital-products";

export const dynamic = "force-dynamic";

const createDigitalProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  files: z
    .array(
      z.object({
        name: z.string().min(1),
        size: z.number().min(0),
        mime: z.string(),
        r2_key: z.string().min(1),
      })
    )
    .min(1, "At least one downloadable file is required"),
  downloadLimit: z.number().int().min(1).max(100).default(5),
  expiryDays: z.number().int().min(1).max(365).default(30),
  licenseEnabled: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parse = createDigitalProductSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const id = await createDigitalProduct(parse.data);
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Failed to create digital product mapping." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      message: "Digital product configured successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create digital product" },
      { status: 500 }
    );
  }
}

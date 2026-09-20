import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteDigitalProduct } from "@/apps/digital-products/lib/digital-products";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing 'id' parameter." }, { status: 400 });
    }

    const ok = await deleteDigitalProduct(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to delete digital product record." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Digital product detached successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete digital product" },
      { status: 500 }
    );
  }
}

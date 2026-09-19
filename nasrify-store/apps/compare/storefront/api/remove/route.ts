import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as any;
    const productId = body?.productId;

    return NextResponse.json({
      success: true,
      message: `Product ${productId || ""} removed from compare session`,
      productId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process compare remove request" },
      { status: 500 }
    );
  }
}

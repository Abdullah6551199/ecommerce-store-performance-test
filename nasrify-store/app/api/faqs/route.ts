import { NextRequest, NextResponse } from "next/server";
import { getActiveFaqs } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const faqs = await getActiveFaqs();
    return NextResponse.json({ success: true, data: { faqs } });
  } catch (error) {
    console.error("[GET /api/faqs] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs." },
      { status: 500 }
    );
  }
}

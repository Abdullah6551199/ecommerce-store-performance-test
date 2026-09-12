import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listAllFaqs, createFaq } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const faqs = await listAllFaqs();
    return NextResponse.json({ success: true, data: { faqs } });
  } catch (error) {
    console.error("[GET /api/admin/faqs] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as any;
    const { question, answer, category, sortOrder, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Question and Answer are required." },
        { status: 400 }
      );
    }

    const faq = await createFaq({
      question,
      answer,
      category,
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({ success: true, data: { faq } });
  } catch (error: any) {
    console.error("[POST /api/admin/faqs] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create FAQ." },
      { status: 500 }
    );
  }
}

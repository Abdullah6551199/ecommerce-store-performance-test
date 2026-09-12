import { NextRequest, NextResponse } from "next/server";
import { saveContactMessage } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { name, email, subject, message } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const saved = await saveContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! We have received your message and will respond promptly.",
      data: { id: saved.id },
    });
  } catch (error) {
    console.error("[POST /api/contact] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact message. Please try again later." },
      { status: 500 }
    );
  }
}

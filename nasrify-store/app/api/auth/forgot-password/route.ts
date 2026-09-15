import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = forgotSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Placeholder: Email delivery service integration point
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, password reset instructions have been dispatched.",
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

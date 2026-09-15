import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = resetSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid token or password" },
        { status: 400 }
      );
    }

    // Placeholder: Reset password logic
    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now log in.",
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

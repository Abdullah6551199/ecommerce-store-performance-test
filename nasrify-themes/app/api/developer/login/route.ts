import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  checkRateLimit,
  recordLoginAttempt,
  clearFailedAttempts,
  verifyPassword,
  createSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const rateLimit = await checkRateLimit(normalizedEmail);
    if (rateLimit.locked) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Try again in 5 minutes.",
          remainingSeconds: rateLimit.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const db = getDb();
    let userRecord = null;

    if (db) {
      try {
        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);
        if (found.length > 0) {
          userRecord = found[0];
        }
      } catch (_dbErr) {
        // Continue
      }
    }

    if (!userRecord || userRecord.role !== "admin") {
      await recordLoginAttempt(normalizedEmail, false, clientIp);
      return NextResponse.json(
        { success: false, error: "Invalid developer credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, userRecord.passwordHash);
    if (!isPasswordValid) {
      await recordLoginAttempt(normalizedEmail, false, clientIp);
      return NextResponse.json(
        { success: false, error: "Invalid developer credentials" },
        { status: 401 }
      );
    }

    await recordLoginAttempt(normalizedEmail, true, clientIp);
    await clearFailedAttempts(normalizedEmail);

    const token = await createSession(userRecord.id);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        role: userRecord.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}

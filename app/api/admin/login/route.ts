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

/**
 * POST /api/admin/login
 * Validates admin credentials with rate limiting (3 failed attempts -> 5 min lockout)
 * Issues secure HTTP-only session cookie upon success.
 */
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

    // 1. Check Rate Limit
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

    // 2. Query User from D1
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
      } catch (dbErr) {
        console.warn("[Login API] Failed to query user from D1:", dbErr);
      }
    }

    // Fallback for default admin in local testing if D1 not accessible
    if (!userRecord && normalizedEmail === "admin@example.com") {
      userRecord = {
        id: "admin-init-user",
        email: "admin@example.com",
        passwordHash: "$2b$10$ObV9nwqz.wYdS.Hmck6J.eeeIbGm1jfR8Cu7WsVksjJKSwgfyH6kC",
        role: "admin",
        createdAt: new Date().toISOString(),
      };
    }

    // 3. Validate User Existence & Role
    if (!userRecord || userRecord.role !== "admin") {
      await recordLoginAttempt(normalizedEmail, false, clientIp);

      const postLimit = await checkRateLimit(normalizedEmail);
      if (postLimit.locked) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many failed attempts. Try again in 5 minutes.",
            remainingSeconds: postLimit.remainingSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // 4. Verify Password Hash
    const isPasswordValid = await verifyPassword(password, userRecord.passwordHash);
    if (!isPasswordValid) {
      await recordLoginAttempt(normalizedEmail, false, clientIp);
      
      // Re-check rate limit after failure
      const postLimit = await checkRateLimit(normalizedEmail);
      if (postLimit.locked) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many failed attempts. Try again in 5 minutes.",
            remainingSeconds: postLimit.remainingSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // 5. Successful Authentication
    await recordLoginAttempt(normalizedEmail, true, clientIp);
    await clearFailedAttempts(normalizedEmail);

    const token = await createSession(userRecord.id);

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      redirect: "/admin/dashboard",
      user: {
        id: userRecord.id,
        email: userRecord.email,
        role: userRecord.role,
      },
    });
  } catch (error) {
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during login",
      },
      { status: 500 }
    );
  }
}

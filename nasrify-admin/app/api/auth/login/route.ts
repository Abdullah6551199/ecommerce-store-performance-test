import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  verifyCustomerPassword,
  checkCustomerLoginRateLimit,
  recordCustomerLoginAttempt,
  clearCustomerFailedAttempts,
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  updateCustomerLastLogin,
  linkPastOrdersToCustomer,
} from "@/lib/customer-auth";
import { getDb, customers } from "@/lib/db";
import { sql } from "drizzle-orm";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid login credentials" },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parseResult.data;

    // 1. Rate Limit Check: max 5 failed attempts per 15 minutes
    const rateCheck = await checkCustomerLoginRateLimit(email, ip);
    if (rateCheck.locked) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateCheck.remainingSeconds} seconds before trying again.`,
          remainingSeconds: rateCheck.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const db = getDb();
    let customerRecord = null;

    if (db) {
      try {
        const rows = await db
          .select()
          .from(customers)
          .where(sql`LOWER(${customers.email}) = ${email}`)
          .limit(1);

        if (rows.length > 0) {
          customerRecord = rows[0];
        }
      } catch (err) {
        console.warn("[Login] D1 query customer error:", err);
      }
    }

    if (!customerRecord) {
      await recordCustomerLoginAttempt(email, false, ip);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (customerRecord.status === "suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact customer support." },
        { status: 403 }
      );
    }

    // 2. Verify password with bcrypt
    const passwordValid = await verifyCustomerPassword(
      password,
      customerRecord.passwordHash
    );

    if (!passwordValid) {
      await recordCustomerLoginAttempt(email, false, ip);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Clear failed attempts & update last login
    await clearCustomerFailedAttempts(email);
    await updateCustomerLastLogin(customerRecord.id);

    // 4. Link past orders if any
    await linkPastOrdersToCustomer(customerRecord.id, email);

    // 5. Create Session & Set HttpOnly Cookie
    const { token, maxAgeSeconds } = await createCustomerSession(
      customerRecord.id,
      rememberMe
    );
    const cookieStore = await cookies();
    cookieStore.set({
      name: CUSTOMER_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeSeconds,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
      customer: {
        id: customerRecord.id,
        email: customerRecord.email,
        name: customerRecord.name,
        phone: customerRecord.phone,
        status: customerRecord.status,
        isVerified: customerRecord.isVerified,
        createdAt: customerRecord.createdAt,
      },
    });
  } catch (error) {
    console.error("[Login] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error during login" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  hashCustomerPassword,
  checkCustomerSignupRateLimit,
  recordCustomerSignupAttempt,
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  linkPastOrdersToCustomer,
  registerMemoryCustomer,
} from "@/lib/customer-auth";
import { createCustomerNotification } from "@/lib/customer-notifications";
import { getDb, customers, type CustomerRecord } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().optional().or(z.literal("")),
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

    // 1. Rate Limit Check: max 3 signups per hour per IP
    const rateCheck = await checkCustomerSignupRateLimit(ip);
    if (rateCheck.locked) {
      return NextResponse.json(
        {
          error: "Too many accounts created from this IP. Please try again later.",
          remainingSeconds: rateCheck.remainingSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = signupSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid registration data" },
        { status: 400 }
      );
    }

    const { name, email, password, phone, rememberMe } = parseResult.data;
    const db = getDb();

    // 2. Check email uniqueness
    if (db) {
      try {
        const existing = await db
          .select({ id: customers.id })
          .from(customers)
          .where(sql`LOWER(${customers.email}) = ${email}`)
          .limit(1);

        if (existing.length > 0) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
          );
        }
      } catch (err) {
        console.warn("[Signup] D1 check email error:", err);
      }
    }

    // 3. Hash password
    const passwordHash = await hashCustomerPassword(password);
    const customerId = crypto.randomUUID();
    const nowStr = new Date().toISOString();

    const newCustomer: CustomerRecord = {
      id: customerId,
      tenantId: null,
      email,
      passwordHash,
      name,
      phone: phone || null,
      status: "active",
      isVerified: false,
      lastLogin: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    // 4. Save Customer in D1
    if (db) {
      try {
        await db.insert(customers).values(newCustomer);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("UNIQUE") || errMsg.includes("constraint")) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
          );
        }
        console.error("[Signup] Failed to insert customer:", err);
        return NextResponse.json(
          { error: "Failed to create customer account" },
          { status: 500 }
        );
      }
    } else {
      registerMemoryCustomer(newCustomer);
    }

    // Record signup attempt for rate limiting
    await recordCustomerSignupAttempt(ip);

    // 5. Create Session & Set HttpOnly Cookie
    const { token, maxAgeSeconds } = await createCustomerSession(customerId, rememberMe);
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

    // 6. Link any past guest orders matching this email
    await linkPastOrdersToCustomer(customerId, email);

    // 7. Send In-App Welcome Notification
    await createCustomerNotification({
      customerId,
      type: "welcome",
      title: "Welcome to ApexStore!",
      message: "Your customer account has been created. Start browsing our collection or track your orders!",
      link: "/account",
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      customer: {
        id: customerId,
        email,
        name,
        phone: phone || null,
        isVerified: false,
        createdAt: nowStr,
      },
    });
  } catch (error) {
    console.error("[Signup] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { getDb, customers, customerSessions, users, sessions } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth";
import { checkIsSuperAdmin } from "@/lib/marketplace/auth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parse = loginSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parse.data;
    const normEmail = email.toLowerCase().trim();
    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const cookieStore = await cookies();

    // 1. Try customer login
    const foundCustomer = await db
      .select({
        id: customers.id,
        email: customers.email,
        name: customers.name,
        passwordHash: customers.passwordHash,
        status: customers.status,
      })
      .from(customers)
      .where(eq(customers.email, normEmail))
      .limit(1);

    if (foundCustomer.length > 0) {
      const cust = foundCustomer[0];
      const valid = await verifyPassword(password, cust.passwordHash);
      if (valid && cust.status === "active") {
        const token = crypto.randomUUID().replace(/-/g, "");
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await db.insert(customerSessions).values({
          id: crypto.randomUUID(),
          customerId: cust.id,
          token,
          expiresAt,
          createdAt: new Date().toISOString(),
        });

        cookieStore.set("customer_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });

        return NextResponse.json({
          success: true,
          user: {
            id: cust.id,
            email: cust.email,
            name: cust.name,
            role: "customer",
            isTeam: false,
          },
        });
      }
    }

    // 2. Try admin / team login
    const foundAdmin = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, normEmail))
      .limit(1);

    if (foundAdmin.length > 0) {
      const adm = foundAdmin[0];
      const valid = await verifyPassword(password, adm.passwordHash);
      if (valid && adm.role === "admin") {
        const token = crypto.randomUUID().replace(/-/g, "");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        await db.insert(sessions).values({
          id: crypto.randomUUID(),
          userId: adm.id,
          token,
          expiresAt,
          createdAt: new Date().toISOString(),
        });

        cookieStore.set("admin_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });

        const isTeam = checkIsSuperAdmin(adm.email) || adm.role === "admin";
        return NextResponse.json({
          success: true,
          user: {
            id: adm.id,
            email: adm.email,
            name: adm.email.split("@")[0],
            role: "admin",
            isTeam,
          },
        });
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Login failed" },
      { status: 500 }
    );
  }
}

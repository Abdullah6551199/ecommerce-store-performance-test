import { cookies } from "next/headers";
import { getDb, customers, customerSessions, users, sessions } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  isTeam: boolean;
}

export function checkIsSuperAdmin(email?: string): boolean {
  if (!email) return false;
  const superAdminList = (
    process.env.SUPER_ADMIN_EMAILS || "admin@apexstore.com,admin@example.com"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return superAdminList.includes(email.toLowerCase());
}

/**
 * Resolves current authenticated user from either customer_session or admin_session cookie
 * or Authorization Bearer header.
 */
export async function getAuthenticatedMarketplaceUser(
  req?: NextRequest
): Promise<AuthenticatedUser | null> {
  const db = getDb();
  if (!db) return null;

  let customerToken: string | undefined;
  let adminToken: string | undefined;

  if (req) {
    customerToken = req.cookies.get("customer_session")?.value;
    adminToken = req.cookies.get("admin_session")?.value;

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearer = authHeader.substring(7).trim();
      if (!customerToken) customerToken = bearer;
      if (!adminToken) adminToken = bearer;
    }
  }

  if (!customerToken && !adminToken) {
    try {
      const cookieStore = await cookies();
      customerToken = cookieStore.get("customer_session")?.value;
      adminToken = cookieStore.get("admin_session")?.value;
    } catch {
      // outside cookie store context
    }
  }

  // 1. Try customer session
  if (customerToken) {
    try {
      const results = await db
        .select({
          customerId: customers.id,
          email: customers.email,
          name: customers.name,
          status: customers.status,
        })
        .from(customerSessions)
        .innerJoin(customers, eq(customerSessions.customerId, customers.id))
        .where(
          and(
            eq(customerSessions.token, customerToken),
            sql`datetime(${customerSessions.expiresAt}) >= datetime('now')`
          )
        )
        .limit(1);

      if (results.length > 0 && results[0].status === "active") {
        return {
          id: results[0].customerId,
          email: results[0].email,
          name: results[0].name || results[0].email.split("@")[0],
          role: "customer",
          isTeam: false,
        };
      }
    } catch {
      // ignore
    }
  }

  // 2. Try admin session
  if (adminToken) {
    try {
      const results = await db
        .select({
          userId: users.id,
          email: users.email,
          role: users.role,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(
          and(
            eq(sessions.token, adminToken),
            sql`datetime(${sessions.expiresAt}) >= datetime('now')`
          )
        )
        .limit(1);

      if (results.length > 0) {
        const u = results[0];
        const isTeam = checkIsSuperAdmin(u.email) || u.role === "admin";
        return {
          id: u.userId,
          email: u.email,
          name: u.email.split("@")[0],
          role: "admin",
          isTeam,
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

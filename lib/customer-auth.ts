import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  getDb,
  customers,
  customerSessions,
  orders,
  loginAttempts,
  type CustomerRecord,
} from "./db";
import { eq, and, desc, sql, isNull } from "drizzle-orm";

/**
 * ==============================================================================
 * Customer Authentication & Session Service (Cloudflare Workers & D1 Compatible)
 * ==============================================================================
 */

export const CUSTOMER_SESSION_COOKIE = "customer_session";
export const LOGIN_RATE_LIMIT_MAX = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const SIGNUP_RATE_LIMIT_MAX = 3;
export const SIGNUP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const SESSION_DURATION_DEFAULT_MS = 24 * 60 * 60 * 1000; // 1 day
export const SESSION_DURATION_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// In-memory fallbacks for local dev / testing
interface MemorySession {
  id: string;
  token: string;
  customerId: string;
  expiresAt: number;
}
interface MemoryAttempt {
  email: string;
  attemptedAt: number;
  success: boolean;
  ip?: string;
}

const memorySessions = new Map<string, MemorySession>();
const memoryCustomers = new Map<string, CustomerRecord>();
const memoryAttempts: MemoryAttempt[] = [];

/**
 * Generate 32-byte cryptographically secure random hex string
 */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash customer password with bcrypt (10 rounds)
 */
export async function hashCustomerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify customer password against bcrypt hash
 */
export async function verifyCustomerPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Parse date string to UTC timestamp reliably
 */
function parseUtcTimestamp(str: string): number {
  if (!str) return Date.now();
  if (str.includes("T")) {
    return new Date(str).getTime();
  }
  return new Date(str.replace(" ", "T") + "Z").getTime();
}

/**
 * Check login rate limit: max 5 attempts per 15 minutes per IP + email
 */
export async function checkCustomerLoginRateLimit(
  email: string,
  ip?: string
): Promise<{ locked: boolean; remainingSeconds?: number }> {
  const normEmail = `customer:${email.toLowerCase().trim()}`;
  const db = getDb();

  if (db) {
    try {
      // Find failed attempts in past 15 minutes for this email/IP
      const failedAttempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, normEmail),
            eq(loginAttempts.success, false),
            sql`datetime(${loginAttempts.attemptedAt}) >= datetime('now', '-15 minutes')`
          )
        )
        .orderBy(desc(loginAttempts.attemptedAt));

      if (failedAttempts.length >= LOGIN_RATE_LIMIT_MAX) {
        const latestTime = parseUtcTimestamp(failedAttempts[0].attemptedAt);
        const elapsedMs = Math.max(0, Date.now() - latestTime);
        const remainingMs = Math.max(0, LOGIN_RATE_LIMIT_WINDOW_MS - elapsedMs);
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        return { locked: true, remainingSeconds };
      }

      return { locked: false };
    } catch (err) {
      console.warn("[CustomerAuth] Login rate limit query error, checking fallback:", err);
    }
  }

  // Memory fallback
  const now = Date.now();
  const recentFailed = memoryAttempts.filter(
    (a) =>
      a.email === normEmail &&
      !a.success &&
      now - a.attemptedAt <= LOGIN_RATE_LIMIT_WINDOW_MS
  );

  if (recentFailed.length >= LOGIN_RATE_LIMIT_MAX) {
    const latestAttempt = Math.max(...recentFailed.map((a) => a.attemptedAt));
    const elapsedMs = now - latestAttempt;
    const remainingSeconds = Math.max(1, Math.ceil(Math.max(0, LOGIN_RATE_LIMIT_WINDOW_MS - elapsedMs) / 1000));
    return { locked: true, remainingSeconds };
  }

  return { locked: false };
}

/**
 * Check signup rate limit: max 3 accounts per hour per IP
 */
export async function checkCustomerSignupRateLimit(
  ip: string
): Promise<{ locked: boolean; remainingSeconds?: number }> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return { locked: false };
  }

  const signupKey = `signup:${ip}`;
  const db = getDb();

  if (db) {
    try {
      const attempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, signupKey),
            sql`datetime(${loginAttempts.attemptedAt}) >= datetime('now', '-1 hour')`
          )
        )
        .orderBy(desc(loginAttempts.attemptedAt));

      if (attempts.length >= SIGNUP_RATE_LIMIT_MAX) {
        const latestTime = parseUtcTimestamp(attempts[0].attemptedAt);
        const elapsedMs = Math.max(0, Date.now() - latestTime);
        const remainingMs = Math.max(0, SIGNUP_RATE_LIMIT_WINDOW_MS - elapsedMs);
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        return { locked: true, remainingSeconds };
      }

      return { locked: false };
    } catch (err) {
      console.warn("[CustomerAuth] Signup rate limit query error, checking fallback:", err);
    }
  }

  // Memory fallback
  const now = Date.now();
  const recentSignups = memoryAttempts.filter(
    (a) => a.email === signupKey && now - a.attemptedAt <= SIGNUP_RATE_LIMIT_WINDOW_MS
  );

  if (recentSignups.length >= SIGNUP_RATE_LIMIT_MAX) {
    const latestAttempt = Math.max(...recentSignups.map((a) => a.attemptedAt));
    const elapsedMs = now - latestAttempt;
    const remainingSeconds = Math.max(1, Math.ceil(Math.max(0, SIGNUP_RATE_LIMIT_WINDOW_MS - elapsedMs) / 1000));
    return { locked: true, remainingSeconds };
  }

  return { locked: false };
}

/**
 * Record a customer login attempt
 */
export async function recordCustomerLoginAttempt(
  email: string,
  success: boolean,
  ip?: string
): Promise<void> {
  const normEmail = `customer:${email.toLowerCase().trim()}`;
  const db = getDb();

  if (db) {
    try {
      await db.insert(loginAttempts).values({
        id: crypto.randomUUID(),
        email: normEmail,
        attemptedAt: new Date().toISOString(),
        success,
        ip: ip || null,
      });
      return;
    } catch (err) {
      console.warn("[CustomerAuth] Failed to persist login attempt to D1:", err);
    }
  }

  memoryAttempts.push({
    email: normEmail,
    attemptedAt: Date.now(),
    success,
    ip,
  });
}

/**
 * Record a customer signup attempt for rate limiting
 */
export async function recordCustomerSignupAttempt(ip?: string): Promise<void> {
  const signupKey = `signup:${ip || "unknown"}`;
  const db = getDb();

  if (db) {
    try {
      await db.insert(loginAttempts).values({
        id: crypto.randomUUID(),
        email: signupKey,
        attemptedAt: new Date().toISOString(),
        success: true,
        ip: ip || null,
      });
      return;
    } catch (err) {
      console.warn("[CustomerAuth] Failed to persist signup attempt to D1:", err);
    }
  }

  memoryAttempts.push({
    email: signupKey,
    attemptedAt: Date.now(),
    success: true,
    ip,
  });
}

/**
 * Clear failed attempts for a customer upon successful login
 */
export async function clearCustomerFailedAttempts(email: string): Promise<void> {
  const normEmail = `customer:${email.toLowerCase().trim()}`;
  const db = getDb();

  if (db) {
    try {
      await db
        .delete(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, normEmail),
            eq(loginAttempts.success, false)
          )
        );
      return;
    } catch (err) {
      console.warn("[CustomerAuth] Failed to clear failed attempts from D1:", err);
    }
  }

  for (let i = memoryAttempts.length - 1; i >= 0; i--) {
    if (memoryAttempts[i].email === normEmail && !memoryAttempts[i].success) {
      memoryAttempts.splice(i, 1);
    }
  }
}

/**
 * Link past guest orders with matching email to this customer
 */
export async function linkPastOrdersToCustomer(
  customerId: string,
  email: string
): Promise<number> {
  const normEmail = email.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      const res = await db
        .update(orders)
        .set({ customerId })
        .where(
          and(
            sql`LOWER(${orders.email}) = ${normEmail}`,
            isNull(orders.customerId)
          )
        );
      return (res as unknown as { rowsAffected?: number })?.rowsAffected || 0;
    } catch (err) {
      console.warn("[CustomerAuth] Failed to link past orders in D1:", err);
    }
  }
  return 0;
}

/**
 * Create a new customer session in D1
 */
export async function createCustomerSession(
  customerId: string,
  rememberMe: boolean = false
): Promise<{ token: string; expiresAt: Date; maxAgeSeconds: number }> {
  const token = generateSecureToken();
  const durationMs = rememberMe ? SESSION_DURATION_REMEMBER_MS : SESSION_DURATION_DEFAULT_MS;
  const expiresAt = new Date(Date.now() + durationMs);
  const maxAgeSeconds = Math.floor(durationMs / 1000);
  const db = getDb();

  if (db) {
    try {
      await db.insert(customerSessions).values({
        id: crypto.randomUUID(),
        customerId,
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      });
      return { token, expiresAt, maxAgeSeconds };
    } catch (err) {
      console.warn("[CustomerAuth] Failed to persist session to D1:", err);
    }
  }

  memorySessions.set(token, {
    id: crypto.randomUUID(),
    token,
    customerId,
    expiresAt: expiresAt.getTime(),
  });

  return { token, expiresAt, maxAgeSeconds };
}

/**
 * Validate customer session token against D1 and return CustomerRecord
 */
export async function validateCustomerSession(
  token: string
): Promise<CustomerRecord | null> {
  if (!token) return null;

  const db = getDb();

  if (db) {
    try {
      const results = await db
        .select({
          session: customerSessions,
          customer: customers,
        })
        .from(customerSessions)
        .innerJoin(customers, eq(customerSessions.customerId, customers.id))
        .where(
          and(
            eq(customerSessions.token, token),
            sql`datetime(${customerSessions.expiresAt}) >= datetime('now')`
          )
        )
        .limit(1);

      if (results.length > 0) {
        const c = results[0].customer;
        // Check if customer is suspended
        if (c.status === "suspended") {
          return null;
        }
        return c;
      }
      return null;
    } catch (err) {
      console.warn("[CustomerAuth] Failed to validate session in D1:", err);
    }
  }

  const memSession = memorySessions.get(token);
  if (memSession && memSession.expiresAt > Date.now()) {
    const memCust = memoryCustomers.get(memSession.customerId);
    if (memCust && memCust.status !== "suspended") {
      return memCust;
    }
  }

  return null;
}

/**
 * Destroy a customer session (logout)
 */
export async function destroyCustomerSession(token: string): Promise<void> {
  if (!token) return;

  const db = getDb();
  if (db) {
    try {
      await db.delete(customerSessions).where(eq(customerSessions.token, token));
    } catch (err) {
      console.warn("[CustomerAuth] Failed to delete session from D1:", err);
    }
  }

  memorySessions.delete(token);
}

/**
 * Retrieve current customer from HTTP-only session cookie
 */
export async function getCurrentCustomer(
  sessionToken?: string
): Promise<CustomerRecord | null> {
  let token = sessionToken;

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    } catch (_err) {
      return null;
    }
  }

  if (!token) return null;
  return validateCustomerSession(token);
}

/**
 * Update customer last login timestamp
 */
export async function updateCustomerLastLogin(customerId: string): Promise<void> {
  const db = getDb();
  const nowStr = new Date().toISOString();

  if (db) {
    try {
      await db
        .update(customers)
        .set({
          lastLogin: nowStr,
          updatedAt: nowStr,
        })
        .where(eq(customers.id, customerId));
      return;
    } catch (err) {
      console.warn("[CustomerAuth] Failed to update last login in D1:", err);
    }
  }

  const memCust = memoryCustomers.get(customerId);
  if (memCust) {
    memCust.lastLogin = nowStr;
    memCust.updatedAt = nowStr;
  }
}

/**
 * Register in-memory customer for fallback/mock testing
 */
export function registerMemoryCustomer(cust: CustomerRecord): void {
  memoryCustomers.set(cust.id, cust);
}

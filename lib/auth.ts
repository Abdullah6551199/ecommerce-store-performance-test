import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb, users, loginAttempts, sessions, type UserRecord } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * ==============================================================================
 * Authentication & Rate Limiting Service (Cloudflare Workers & D1 Compatible)
 * ==============================================================================
 */

export const RATE_LIMIT_MAX_ATTEMPTS = 3;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory fallback for local dev when running outside Cloudflare worker runtime
interface MemoryAttempt {
  email: string;
  attemptedAt: number;
  success: boolean;
}
interface MemorySession {
  token: string;
  userId: string;
  expiresAt: number;
}
const memoryAttempts: MemoryAttempt[] = [];
const memorySessions = new Map<string, MemorySession>();

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
 * Securely hash a plaintext password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify plaintext password against stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Update password for an admin user
 */
export async function updateAdminPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
  const db = getDb();
  const newHash = await hashPassword(newPasswordPlain);

  if (db) {
    try {
      await db
        .update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, userId));
      return true;
    } catch (err) {
      console.error("[Auth] Failed to update password in D1:", err);
      return false;
    }
  }
  return true;
}

/**
 * Check if the email is currently rate-limited (3 failed attempts within 5 minutes)
 */
export async function checkRateLimit(
  email: string
): Promise<{ locked: boolean; remainingSeconds?: number }> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      // Find failed attempts within 5-minute window using SQLite datetime()
      const failedAttempts = await db
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, normalizedEmail),
            eq(loginAttempts.success, false),
            sql`datetime(${loginAttempts.attemptedAt}) >= datetime('now', '-5 minutes')`
          )
        )
        .orderBy(desc(loginAttempts.attemptedAt));

      if (failedAttempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
        const latestTime = parseUtcTimestamp(failedAttempts[0].attemptedAt);
        const elapsedMs = Math.max(0, Date.now() - latestTime);
        const remainingMs = Math.max(0, RATE_LIMIT_WINDOW_MS - elapsedMs);
        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        return { locked: true, remainingSeconds };
      }

      return { locked: false };
    } catch (err) {
      console.warn("[Auth] Rate limit query error, checking fallback:", err);
    }
  }

  // Memory fallback
  const now = Date.now();
  const recentFailed = memoryAttempts.filter(
    (a) =>
      a.email === normalizedEmail &&
      !a.success &&
      now - a.attemptedAt <= RATE_LIMIT_WINDOW_MS
  );

  if (recentFailed.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    const latestAttempt = Math.max(...recentFailed.map((a) => a.attemptedAt));
    const elapsedMs = now - latestAttempt;
    const remainingSeconds = Math.max(1, Math.ceil(Math.max(0, RATE_LIMIT_WINDOW_MS - elapsedMs) / 1000));
    return { locked: true, remainingSeconds };
  }

  return { locked: false };
}

/**
 * Record a login attempt (success or failure)
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ip?: string
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      await db.insert(loginAttempts).values({
        id: crypto.randomUUID(),
        email: normalizedEmail,
        attemptedAt: new Date().toISOString(),
        success,
        ip: ip || null,
      });
      return;
    } catch (err) {
      console.warn("[Auth] Failed to persist login attempt to D1:", err);
    }
  }

  memoryAttempts.push({
    email: normalizedEmail,
    attemptedAt: Date.now(),
    success,
  });
}

/**
 * Clear failed attempts for an email upon successful authentication
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      await db
        .delete(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, normalizedEmail),
            eq(loginAttempts.success, false)
          )
        );
      return;
    } catch (err) {
      console.warn("[Auth] Failed to clear failed attempts from D1:", err);
    }
  }

  for (let i = memoryAttempts.length - 1; i >= 0; i--) {
    if (memoryAttempts[i].email === normalizedEmail && !memoryAttempts[i].success) {
      memoryAttempts.splice(i, 1);
    }
  }
}

/**
 * Create a new user session in D1 and return the token
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID() + "-" + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  const db = getDb();

  if (db) {
    try {
      await db.insert(sessions).values({
        id: crypto.randomUUID(),
        userId,
        token,
        expiresAt,
        createdAt: new Date().toISOString(),
      });
      return token;
    } catch (err) {
      console.warn("[Auth] Failed to persist session to D1:", err);
    }
  }

  memorySessions.set(token, {
    token,
    userId,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });

  return token;
}

/**
 * Validate a session token against D1 and return the associated User
 */
export async function validateSession(token: string): Promise<UserRecord | null> {
  if (!token) return null;

  const db = getDb();

  if (db) {
    try {
      const sessionResults = await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(
          and(
            eq(sessions.token, token),
            sql`datetime(${sessions.expiresAt}) >= datetime('now')`
          )
        )
        .limit(1);

      if (sessionResults.length > 0) {
        return sessionResults[0].user;
      }
      return null;
    } catch (err) {
      console.warn("[Auth] Failed to query session from D1:", err);
    }
  }

  const memSession = memorySessions.get(token);
  if (memSession && memSession.expiresAt > Date.now()) {
    return {
      id: memSession.userId,
      email: "admin@example.com",
      passwordHash: "",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Destroy a session token
 */
export async function destroySession(token: string): Promise<void> {
  if (!token) return;

  const db = getDb();
  if (db) {
    try {
      await db.delete(sessions).where(eq(sessions.token, token));
    } catch (err) {
      console.warn("[Auth] Failed to delete session from D1:", err);
    }
  }

  memorySessions.delete(token);
}

/**
 * Retrieve current authenticated admin from HTTP-only session cookie
 */
export async function getCurrentAdmin(sessionToken?: string): Promise<UserRecord | null> {
  let token = sessionToken;

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch (_err) {
      // Cookies called outside Next.js request context (e.g. testing)
      return null;
    }
  }

  if (!token) return null;

  return validateSession(token);
}

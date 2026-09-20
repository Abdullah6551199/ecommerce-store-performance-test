import { cookies } from "next/headers";
import { cache } from "react";
import { getDb, users, loginAttempts, sessions, type UserRecord } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { invalidateAdminUserCache } from "./admin-cache";

/**
 * ==============================================================================
 * Authentication & Rate Limiting Service (Cloudflare Workers & D1 Compatible)
 * ==============================================================================
 */

export const RATE_LIMIT_MAX_ATTEMPTS = 3;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// 60-second in-memory isolate token cache
export const ADMIN_TOKEN_CACHE_TTL_MS = 60 * 1000;

export interface CachedAdminSession {
  userId: string;
  email: string;
  role: string;
  expiresAt: string;
  userRecord: UserRecord;
  cachedAt: number;
}

// Isolate-scoped in-memory cache for validated admin tokens (key: SHA-256 token hash)
const adminTokenCache = new Map<string, CachedAdminSession>();

/**
 * Invalidate admin token cache for a specific user, token, or clear all
 */
export function invalidateAdminTokenCache(userIdOrToken?: string): void {
  if (!userIdOrToken) {
    adminTokenCache.clear();
    return;
  }
  for (const [hash, entry] of adminTokenCache.entries()) {
    if (entry.userId === userIdOrToken || hash === userIdOrToken) {
      adminTokenCache.delete(hash);
    }
  }
}

/**
 * Cryptographically hash session token with SHA-256 to use as safe cache key
 */
async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Dev-only verification invocation tracker (Target: 1 run per request)
let devVerificationRunCount = 0;

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
 * Securely hash a plaintext password with bcrypt (lazy-loaded)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return (bcrypt.default || bcrypt).hash(password, 10);
}

/**
 * Verify plaintext password against stored bcrypt hash (lazy-loaded)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return (bcrypt.default || bcrypt).compare(password, hash);
}

/**
 * Update password for an admin user
 */
export async function updateAdminPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
  const db = getDb();
  const newHash = await hashPassword(newPasswordPlain);

  invalidateAdminTokenCache(userId);
  invalidateAdminUserCache(userId);

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
 * Update email for an admin user in D1 database
 */
export async function updateAdminEmail(userId: string, newEmail: string): Promise<boolean> {
  const normalizedEmail = newEmail.toLowerCase().trim();
  const db = getDb();

  invalidateAdminTokenCache(userId);
  invalidateAdminUserCache(userId);

  if (db) {
    try {
      await db
        .update(users)
        .set({ email: normalizedEmail })
        .where(eq(users.id, userId));
      return true;
    } catch (err) {
      console.error("[Auth] Failed to update email in D1:", err);
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
 * Uses 60-second isolate-scoped in-memory cache for fast deduplication.
 * Cache only successful validations. Never cache failures.
 */
export async function validateSession(token: string): Promise<UserRecord | null> {
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const now = Date.now();

  // 1. Check 60-second in-memory cache (isolate-scoped)
  const cached = adminTokenCache.get(tokenHash);
  if (cached) {
    if (now - cached.cachedAt < ADMIN_TOKEN_CACHE_TTL_MS) {
      const expTime = parseUtcTimestamp(cached.expiresAt);
      if (expTime > now) {
        if (process.env.NODE_ENV === "development") {
          devVerificationRunCount++;
          console.log(
            `[Auth Dev] Session verification run #${devVerificationRunCount} (CACHE_HIT 60s, token: ${tokenHash.slice(0, 8)}...)`
          );
        }
        return cached.userRecord;
      }
    }
    // Expired from cache
    adminTokenCache.delete(tokenHash);
  }

  // 2. Query D1
  const db = getDb();

  if (db) {
    try {
      if (process.env.NODE_ENV === "development") {
        devVerificationRunCount++;
        console.log(
          `[Auth Dev] Session verification run #${devVerificationRunCount} (D1_QUERY, token: ${tokenHash.slice(0, 8)}...)`
        );
      }
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
        const { session: sess, user } = sessionResults[0];
        // Cache ONLY successful validations. Never cache failures.
        if (user && user.role === "admin") {
          adminTokenCache.set(tokenHash, {
            userId: user.id,
            email: user.email,
            role: user.role,
            expiresAt: sess.expiresAt,
            userRecord: user,
            cachedAt: now,
          });
        }
        return user;
      }
      return null;
    } catch (err) {
      console.warn("[Auth] Failed to query session from D1:", err);
    }
  }

  const memSession = memorySessions.get(token);
  if (memSession && memSession.expiresAt > Date.now()) {
    const memUser: UserRecord = {
      id: memSession.userId,
      email: "admin@example.com",
      passwordHash: "",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    adminTokenCache.set(tokenHash, {
      userId: memUser.id,
      email: memUser.email,
      role: memUser.role,
      expiresAt: new Date(memSession.expiresAt).toISOString(),
      userRecord: memUser,
      cachedAt: now,
    });
    return memUser;
  }

  return null;
}

/**
 * Destroy a session token and evict it from memory cache
 */
export async function destroySession(token: string): Promise<void> {
  if (!token) return;

  try {
    const tokenHash = await hashToken(token);
    const cached = adminTokenCache.get(tokenHash);
    if (cached) {
      invalidateAdminUserCache(cached.userId);
    }
    adminTokenCache.delete(tokenHash);
  } catch (_e) {
    // non-fatal
  }

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
 * Strictly enforces that user exists and user.role === "admin"
 * Deduplicated per-request via React.cache()
 */
export const getCurrentAdmin = cache(async (sessionToken?: string): Promise<UserRecord | null> => {
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

  if (!token || typeof token !== "string" || token.trim().length === 0) return null;

  const user = await validateSession(token.trim());
  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
});

/**
 * Fast edge & middleware check to verify an admin session token is valid and belongs to an admin
 * Deduplicated per-request via React.cache() and backed by 60s isolate token cache
 */
export const verifyAdminSessionToken = cache(async (token: string): Promise<boolean> => {
  if (!token || typeof token !== "string" || token.trim().length === 0) return false;
  const user = await validateSession(token.trim());
  return !!(user && user.role === "admin");
});



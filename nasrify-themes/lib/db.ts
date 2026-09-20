import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { sql } from "drizzle-orm";

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

export function getD1Database(): D1Database | null {
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.DB) {
      return ctx.env.DB as D1Database;
    }
  } catch (_err) {
    // Context unavailable in standard Next.js dev / build environment
  }

  const globalAny = globalThis as unknown as { env?: { DB?: D1Database }; DB?: D1Database };
  if (globalAny?.env?.DB) {
    return globalAny.env.DB;
  }
  if (globalAny?.DB) {
    return globalAny.DB;
  }

  return null;
}

export function getR2Bucket(): R2Bucket | null {
  try {
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.R2) {
      return ctx.env.R2 as R2Bucket;
    }
  } catch (_err) {
    // Context unavailable
  }

  const globalAny = globalThis as unknown as { env?: { R2?: R2Bucket }; R2?: R2Bucket };
  if (globalAny?.env?.R2) {
    return globalAny.env.R2;
  }
  if (globalAny?.R2) {
    return globalAny.R2;
  }

  return null;
}

let _cachedDb: AppDatabase | null = null;
let _cachedD1: D1Database | null = null;

export function getDb(): AppDatabase | null {
  const d1 = getD1Database();
  if (!d1) return null;

  if (_cachedDb && _cachedD1 === d1) {
    return _cachedDb;
  }

  _cachedD1 = d1;
  _cachedDb = drizzle(d1, { schema });
  return _cachedDb;
}

export * from "./db/schema";

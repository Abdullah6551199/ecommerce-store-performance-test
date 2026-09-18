import { cache } from "react";
import { getDb, installedApps } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { InstalledAppRecord } from "@/types/apps";

interface CacheEntry {
  data: InstalledAppRecord[];
  expiresAt: number;
}

const CACHE_TTL_MS = 20 * 1000; // 20s TTL per permanent rules
let memoryCache: CacheEntry | null = null;

/**
 * Manually invalidate cached installed apps (e.g. after install, uninstall, or toggle)
 */
export function invalidateInstalledAppsCache(): void {
  memoryCache = null;
}

/**
 * Fetch all installed apps from D1 with React.cache request deduplication
 * and a 60s in-memory TTL across requests in the worker isolate.
 */
export const getInstalledApps = cache(async (): Promise<InstalledAppRecord[]> => {
  const now = Date.now();
  if (memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.data;
  }

  const db = getDb();
  if (!db) {
    return memoryCache ? memoryCache.data : [];
  }

  try {
    const rows = await db.select().from(installedApps);
    const records: InstalledAppRecord[] = rows.map((r) => ({
      id: r.id,
      version: r.version,
      enabled: Boolean(r.enabled),
      installedAt: r.installedAt,
      updatedAt: r.updatedAt,
      settings: r.settings,
      permissions: r.permissions,
      installedBy: r.installedBy,
    }));

    memoryCache = {
      data: records,
      expiresAt: now + CACHE_TTL_MS,
    };

    return records;
  } catch (error) {
    console.warn("[AppsInstalled] Failed to fetch installed apps from D1:", error);
    return memoryCache ? memoryCache.data : [];
  }
});

/**
 * Fetch single installed app record
 */
export async function getInstalledApp(appId: string): Promise<InstalledAppRecord | null> {
  const all = await getInstalledApps();
  return all.find((a) => a.id === appId) || null;
}

/**
 * Check if app is installed and actively enabled
 */
export async function isAppEnabled(appId: string): Promise<boolean> {
  const app = await getInstalledApp(appId);
  return Boolean(app && app.enabled);
}

/**
 * Retrieve parsed settings JSON for an installed app with 60s TTL caching.
 */
export async function getAppSettings<T = Record<string, unknown>>(
  appId: string
): Promise<T | null> {
  const app = await getInstalledApp(appId);
  if (!app || !app.settings) {
    return null;
  }
  try {
    return typeof app.settings === "string"
      ? (JSON.parse(app.settings) as T)
      : (app.settings as T);
  } catch {
    return null;
  }
}


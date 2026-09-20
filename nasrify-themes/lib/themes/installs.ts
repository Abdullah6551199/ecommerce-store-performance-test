import { getDb, themeMarketplaceInstalls } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import type { ThemeMarketplaceInstall } from "@/types/themes";

export async function recordThemeInstall(data: {
  listingId: string;
  storeId?: string;
}): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const storeId = data.storeId || "default-store";
  const now = Date.now();

  try {
    const existing = await db
      .select({ id: themeMarketplaceInstalls.id })
      .from(themeMarketplaceInstalls)
      .where(
        and(
          eq(themeMarketplaceInstalls.listingId, data.listingId),
          eq(themeMarketplaceInstalls.storeId, storeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(themeMarketplaceInstalls)
        .set({
          status: "active",
          installedAt: now,
          uninstalledAt: null,
        })
        .where(eq(themeMarketplaceInstalls.id, existing[0].id));
      return existing[0].id;
    }

    const id = crypto.randomUUID();
    await db.insert(themeMarketplaceInstalls).values({
      id,
      listingId: data.listingId,
      storeId,
      installedAt: now,
      uninstalledAt: null,
      status: "active",
    });
    return id;
  } catch {
    return null;
  }
}

export async function recordThemeUninstall(data: {
  listingId: string;
  storeId?: string;
}): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const storeId = data.storeId || "default-store";
  const now = Date.now();

  try {
    await db
      .update(themeMarketplaceInstalls)
      .set({
        status: "uninstalled",
        uninstalledAt: now,
      })
      .where(
        and(
          eq(themeMarketplaceInstalls.listingId, data.listingId),
          eq(themeMarketplaceInstalls.storeId, storeId)
        )
      );
    return true;
  } catch {
    return false;
  }
}

export async function getThemeInstallCount(listingId: string): Promise<number> {
  const db = getDb();
  if (!db || !listingId) return 0;

  try {
    const res = await db
      .select({ count: sql<number>`count(*)` })
      .from(themeMarketplaceInstalls)
      .where(
        and(
          eq(themeMarketplaceInstalls.listingId, listingId),
          eq(themeMarketplaceInstalls.status, "active")
        )
      );
    return Number(res[0]?.count || 0);
  } catch {
    return 0;
  }
}

import { getDb, appMarketplaceInstalls } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import type { MarketplaceInstall } from "@/types/marketplace";

export async function recordAppInstall(data: {
  listingId: string;
  storeId?: string;
}): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const storeId = data.storeId || "default-store";
  const now = Date.now();

  try {
    // Check if an existing install record exists for this store
    const existing = await db
      .select({ id: appMarketplaceInstalls.id })
      .from(appMarketplaceInstalls)
      .where(
        and(
          eq(appMarketplaceInstalls.listingId, data.listingId),
          eq(appMarketplaceInstalls.storeId, storeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(appMarketplaceInstalls)
        .set({
          status: "active",
          installedAt: now,
          uninstalledAt: null,
        })
        .where(eq(appMarketplaceInstalls.id, existing[0].id));
      return existing[0].id;
    }

    const id = crypto.randomUUID();
    await db.insert(appMarketplaceInstalls).values({
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

export async function recordAppUninstall(data: {
  listingId: string;
  storeId?: string;
}): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const storeId = data.storeId || "default-store";
  const now = Date.now();

  try {
    await db
      .update(appMarketplaceInstalls)
      .set({
        status: "uninstalled",
        uninstalledAt: now,
      })
      .where(
        and(
          eq(appMarketplaceInstalls.listingId, data.listingId),
          eq(appMarketplaceInstalls.storeId, storeId)
        )
      );
    return true;
  } catch {
    return false;
  }
}

export async function getInstallCount(listingId: string): Promise<number> {
  const db = getDb();
  if (!db || !listingId) return 0;

  try {
    const res = await db
      .select({ count: sql<number>`count(*)` })
      .from(appMarketplaceInstalls)
      .where(
        and(
          eq(appMarketplaceInstalls.listingId, listingId),
          eq(appMarketplaceInstalls.status, "active")
        )
      );
    return Number(res[0]?.count || 0);
  } catch {
    return 0;
  }
}

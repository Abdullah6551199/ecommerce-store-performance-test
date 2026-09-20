import { getDb, digitalProducts, digitalDownloads, digitalLicenses, products, productImages } from "@/lib/db";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import type { DigitalDownload, DigitalFile } from "../shared/types";
import { generateDownloadToken } from "./tokens";

/**
 * Create download records for order items corresponding to digital products
 */
export async function createDownloadRecords(options: {
  orderId: string;
  productId: string;
  customerId?: string | null;
  customerEmail?: string | null;
  files: DigitalFile[];
  maxDownloads?: number;
  expiryDays?: number;
  licenseKey?: string | null;
}): Promise<string[]> {
  const db = getDb();
  if (!db || !options.orderId || !options.productId || !options.files || options.files.length === 0) {
    return [];
  }

  const now = Date.now();
  const maxDownloads = options.maxDownloads ?? 5;
  const expiryDays = options.expiryDays ?? 30;
  const expiresAt = expiryDays > 0 ? now + expiryDays * 24 * 60 * 60 * 1000 : null;

  const createdTokens: string[] = [];

  for (const file of options.files) {
    try {
      const token = await generateDownloadToken();
      const id = crypto.randomUUID();

      await db.insert(digitalDownloads).values({
        id,
        orderId: options.orderId,
        productId: options.productId,
        customerId: options.customerId || null,
        customerEmail: options.customerEmail?.toLowerCase() || null,
        fileName: file.name,
        r2Key: file.r2_key,
        downloadToken: token,
        downloadedCount: 0,
        maxDownloads,
        expiresAt,
        createdAt: now,
        lastDownloadAt: null,
      });

      createdTokens.push(token);
    } catch {
      // Continue with other files if one fails
    }
  }

  // If license key was generated, record it in digital_licenses
  if (options.licenseKey) {
    try {
      await db.insert(digitalLicenses).values({
        id: crypto.randomUUID(),
        orderId: options.orderId,
        productId: options.productId,
        licenseKey: options.licenseKey,
        customerEmail: options.customerEmail?.toLowerCase() || null,
        status: "active",
        createdAt: now,
      });
    } catch {
      // Non-blocking
    }
  }

  return createdTokens;
}

/**
 * Fetch download record by its secure download token
 */
export async function getDownloadByToken(token: string): Promise<DigitalDownload | null> {
  if (!token) return null;
  const db = getDb();
  if (!db) return null;

  try {
    const rows = await db
      .select({
        id: digitalDownloads.id,
        orderId: digitalDownloads.orderId,
        productId: digitalDownloads.productId,
        customerId: digitalDownloads.customerId,
        customerEmail: digitalDownloads.customerEmail,
        fileName: digitalDownloads.fileName,
        r2Key: digitalDownloads.r2Key,
        downloadToken: digitalDownloads.downloadToken,
        downloadedCount: digitalDownloads.downloadedCount,
        maxDownloads: digitalDownloads.maxDownloads,
        expiresAt: digitalDownloads.expiresAt,
        createdAt: digitalDownloads.createdAt,
        lastDownloadAt: digitalDownloads.lastDownloadAt,
        productName: products.name,
      })
      .from(digitalDownloads)
      .leftJoin(products, eq(digitalDownloads.productId, products.id))
      .where(eq(digitalDownloads.downloadToken, token))
      .limit(1);

    if (rows.length === 0) return null;
    return rows[0] as DigitalDownload;
  } catch {
    return null;
  }
}

/**
 * Verify and record a successful download invocation
 */
export async function recordDownload(token: string): Promise<{
  allowed: boolean;
  reason?: string;
  download?: DigitalDownload;
}> {
  const download = await getDownloadByToken(token);
  if (!download) {
    return { allowed: false, reason: "Download token not found or invalid." };
  }

  // Check max downloads
  if (download.downloadedCount >= download.maxDownloads) {
    return {
      allowed: false,
      reason: `Download limit reached (${download.downloadedCount}/${download.maxDownloads} downloads used).`,
      download,
    };
  }

  // Check expiry
  if (download.expiresAt && Date.now() > download.expiresAt) {
    return {
      allowed: false,
      reason: "This download link has expired.",
      download,
    };
  }

  const db = getDb();
  if (db) {
    const now = Date.now();
    try {
      await db
        .update(digitalDownloads)
        .set({
          downloadedCount: download.downloadedCount + 1,
          lastDownloadAt: now,
        })
        .where(eq(digitalDownloads.id, download.id));
    } catch {
      // Non-fatal
    }
  }

  return {
    allowed: true,
    download: {
      ...download,
      downloadedCount: download.downloadedCount + 1,
    },
  };
}

/**
 * Fetch all digital downloads for a customer email
 */
export async function getMyDownloads(customerEmail: string): Promise<DigitalDownload[]> {
  if (!customerEmail) return [];
  const db = getDb();
  if (!db) return [];

  const normalized = customerEmail.toLowerCase().trim();

  try {
    const rows = await db
      .select({
        id: digitalDownloads.id,
        orderId: digitalDownloads.orderId,
        productId: digitalDownloads.productId,
        customerId: digitalDownloads.customerId,
        customerEmail: digitalDownloads.customerEmail,
        fileName: digitalDownloads.fileName,
        r2Key: digitalDownloads.r2Key,
        downloadToken: digitalDownloads.downloadToken,
        downloadedCount: digitalDownloads.downloadedCount,
        maxDownloads: digitalDownloads.maxDownloads,
        expiresAt: digitalDownloads.expiresAt,
        createdAt: digitalDownloads.createdAt,
        lastDownloadAt: digitalDownloads.lastDownloadAt,
        productName: products.name,
      })
      .from(digitalDownloads)
      .leftJoin(products, eq(digitalDownloads.productId, products.id))
      .where(eq(digitalDownloads.customerEmail, normalized))
      .orderBy(desc(digitalDownloads.createdAt))
      .limit(100);

    // Fetch license keys for this customer if any
    const licenses = await db
      .select({
        orderId: digitalLicenses.orderId,
        productId: digitalLicenses.productId,
        licenseKey: digitalLicenses.licenseKey,
      })
      .from(digitalLicenses)
      .where(eq(digitalLicenses.customerEmail, normalized))
      .limit(100);

    const licenseMap = new Map<string, string>();
    for (const lic of licenses) {
      if (lic.licenseKey) {
        licenseMap.set(`${lic.orderId}:${lic.productId}`, lic.licenseKey);
      }
    }

    return rows.map((r) => ({
      ...r,
      licenseKey: licenseMap.get(`${r.orderId}:${r.productId}`) || null,
    })) as DigitalDownload[];
  } catch {
    return [];
  }
}

/**
 * Revoke or disable a download record
 */
export async function revokeDownload(id: string): Promise<boolean> {
  const db = getDb();
  if (!db || !id) return false;

  try {
    await db
      .update(digitalDownloads)
      .set({ maxDownloads: 0 })
      .where(eq(digitalDownloads.id, id));
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate KPI stats for admin dashboard
 */
export async function getDigitalStats(): Promise<{
  totalProducts: number;
  downloadsThisMonth: number;
  topProduct: string | null;
}> {
  const db = getDb();
  if (!db) {
    return { totalProducts: 0, downloadsThisMonth: 0, topProduct: null };
  }

  try {
    // 1. Total digital products
    const dpRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(digitalProducts);
    const totalProducts = dpRows[0]?.count ?? 0;

    // 2. Downloads this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startTimestamp = startOfMonth.getTime();

    const dlRows = await db
      .select({ total: sql<number>`sum(downloaded_count)` })
      .from(digitalDownloads)
      .where(gte(digitalDownloads.createdAt, startTimestamp));
    const downloadsThisMonth = dlRows[0]?.total ?? 0;

    // 3. Top downloaded product
    const topRows = await db
      .select({
        productName: products.name,
        totalDownloads: sql<number>`sum(${digitalDownloads.downloadedCount})`,
      })
      .from(digitalDownloads)
      .leftJoin(products, eq(digitalDownloads.productId, products.id))
      .groupBy(digitalDownloads.productId)
      .orderBy(desc(sql`sum(${digitalDownloads.downloadedCount})`))
      .limit(1);

    const topProduct = topRows[0]?.productName || null;

    return {
      totalProducts,
      downloadsThisMonth,
      topProduct,
    };
  } catch {
    return { totalProducts: 0, downloadsThisMonth: 0, topProduct: null };
  }
}

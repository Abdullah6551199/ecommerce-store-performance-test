import { cache } from "react";
import { getDb, settings } from "./db";
import { eq } from "drizzle-orm";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  logoText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    github?: string;
  };
  headerNav: Array<{ label: string; url: string }>;
  footerLinks: Array<{
    title: string;
    links: Array<{ label: string; url: string }>;
  }>;
  announcementText: string;
  announcementUrl: string;
  showAnnouncement: boolean;
  copyrightText: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "ApexStore",
  tagline: "High-Performance Athletic Gear & Edge Apparel",
  description: "Next-generation sports equipment and technical apparel engineered for peak human performance.",
  logoUrl: "",
  logoText: "ApexStore",
  contactEmail: "support@apexstore.edge",
  contactPhone: "+1 (800) 555-APEX",
  contactAddress: "Edge Tech Hub, 100 Velocity Blvd, San Francisco, CA",
  socialLinks: {
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    github: "https://github.com",
    youtube: "https://youtube.com",
  },
  headerNav: [
    { label: "Home", url: "/" },
    { label: "Products", url: "/search" },
    { label: "Categories", url: "/#categories-section" },
    { label: "Featured", url: "/#featured-products" },
  ],
  footerLinks: [
    {
      title: "Explore",
      links: [
        { label: "All Products", url: "/search" },
        { label: "Featured Collections", url: "/#featured-products" },
        { label: "Categories", url: "/#categories-section" },
        { label: "Performance Gear", url: "/search?q=runner" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Our Story", url: "/#brand-story" },
        { label: "Edge Architecture", url: "/#hero-section" },
        { label: "Admin Portal", url: "/admin/products" },
        { label: "Privacy Policy", url: "#" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { label: "Shipping Policy", url: "#" },
        { label: "Returns & Exchanges", url: "#" },
        { label: "Support Desk", url: "mailto:support@apexstore.edge" },
        { label: "System Health", url: "/api/health" },
      ],
    },
  ],
  announcementText: "⚡ FLASH LAUNCH: Global Edge Commerce Powered by Cloudflare D1 & R2",
  announcementUrl: "/search",
  showAnnouncement: true,
  copyrightText: "ApexStore Commerce Inc. All rights reserved.",
};

const SETTINGS_KEY = "store_settings";

// In-memory cache / fallback for static generation or non-D1 dev runtimes
let memorySettings: StoreSettings = { ...DEFAULT_STORE_SETTINGS };
let lastSettingsFetchTime = 0;
const SETTINGS_CACHE_TTL_MS = 60000; // 60s in-memory TTL

/**
 * Retrieve global store settings from Cloudflare D1 or fallback memory
 * Wrapped with React.cache() to deduplicate queries within a single request.
 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (lastSettingsFetchTime > 0 && Date.now() - lastSettingsFetchTime < SETTINGS_CACHE_TTL_MS) {
    return memorySettings;
  }

  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, SETTINGS_KEY))
        .limit(1);

      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = typeof rows[0].value === "string"
          ? JSON.parse(rows[0].value)
          : rows[0].value;

        // Merge with defaults to guarantee all expected fields exist
        const merged: StoreSettings = {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          socialLinks: {
            ...DEFAULT_STORE_SETTINGS.socialLinks,
            ...(parsed.socialLinks || {}),
          },
          headerNav: Array.isArray(parsed.headerNav) && parsed.headerNav.length > 0
            ? parsed.headerNav
            : DEFAULT_STORE_SETTINGS.headerNav,
          footerLinks: Array.isArray(parsed.footerLinks) && parsed.footerLinks.length > 0
            ? parsed.footerLinks
            : DEFAULT_STORE_SETTINGS.footerLinks,
        };
        memorySettings = merged;
        lastSettingsFetchTime = Date.now();
        return merged;
      }
    } catch (err) {
      console.warn("[getStoreSettings] D1 read error, using fallback:", err);
    }
  }

  return memorySettings;
});

/**
 * Update global store settings in Cloudflare D1
 */
export async function updateStoreSettings(
  updates: Partial<StoreSettings>
): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    socialLinks: {
      ...current.socialLinks,
      ...(updates.socialLinks || {}),
    },
    headerNav: updates.headerNav ?? current.headerNav,
    footerLinks: updates.footerLinks ?? current.footerLinks,
  };

  memorySettings = updated;
  lastSettingsFetchTime = 0;

  const db = getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, SETTINGS_KEY))
        .limit(1);

      const now = new Date().toISOString();
      if (existing && existing.length > 0) {
        await db
          .update(settings)
          .set({
            value: updated,
            updatedAt: now,
          })
          .where(eq(settings.key, SETTINGS_KEY));
      } else {
        await db.insert(settings).values({
          id: `setting-${Date.now()}`,
          key: SETTINGS_KEY,
          value: updated,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.error("[updateStoreSettings] D1 update error:", err);
      throw new Error("Failed to persist store settings to database.");
    }
  }

  return updated;
}

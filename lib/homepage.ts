import { getDb, homepageSections } from "./db";
import { asc, eq } from "drizzle-orm";

export type HomepageSectionType =
  | "hero"
  | "categories"
  | "featured_products"
  | "promo_banner"
  | "brand_story"
  | string;

export interface HomepageSectionRecord {
  id: string;
  type: HomepageSectionType;
  title: string;
  content: Record<string, any>;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_HOMEPAGE_SECTIONS: Array<Omit<HomepageSectionRecord, "createdAt" | "updatedAt">> = [
  {
    id: "sec-hero-banner",
    type: "hero",
    title: "Main Hero Showcase",
    imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1600&auto=format&fit=crop",
    sortOrder: 1,
    isActive: true,
    content: {
      heading: "Engineered for Peak Athletic Velocity",
      subheading: "Ultra-responsive edge commerce meets next-generation athletic design. Discover precision footwear, dynamic apparel, and elite equipment.",
      badgeText: "Next-Gen Commerce • Cloudflare Workers + D1 + R2",
      buttonText: "Shop Featured Gear",
      buttonUrl: "#featured-products",
      secondaryButtonText: "Explore Categories",
      secondaryButtonUrl: "#categories-section",
      alignment: "left",
    },
  },
  {
    id: "sec-categories-grid",
    type: "categories",
    title: "Curated Collections",
    imageUrl: null,
    sortOrder: 2,
    isActive: true,
    content: {
      heading: "Explore Core Disciplines",
      subheading: "Engineered categories designed for high-intensity training, trail performance, and everyday velocity.",
      badgeText: "Dynamic Hierarchy",
      maxItems: 6,
      viewAllUrl: "/search",
    },
  },
  {
    id: "sec-featured-products",
    type: "featured_products",
    title: "Featured Performance Catalog",
    imageUrl: null,
    sortOrder: 3,
    isActive: true,
    content: {
      heading: "Featured Innovations",
      subheading: "Hand-picked essentials freshly queried from Cloudflare D1 with real-time stock and multi-option variants.",
      badgeText: "Live D1 Catalog",
      maxItems: 4,
      viewAllUrl: "/search",
    },
  },
  {
    id: "sec-promo-banner",
    type: "promo_banner",
    title: "Mid-Season Breakthrough Banner",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop",
    sortOrder: 4,
    isActive: true,
    content: {
      heading: "Accelerate Beyond Limits with Carbon-Plate Tech",
      subheading: "Experience 32% greater energy return with our award-winning composite foam and zero-friction matrix.",
      badgeText: "Limited Edition Release",
      buttonText: "Discover Apex Velocity",
      buttonUrl: "/product/apex-velocity-runner-x1",
      bannerStyle: "split",
    },
  },
  {
    id: "sec-brand-story",
    type: "brand_story",
    title: "The Apex Standard Brand Story",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 5,
    isActive: true,
    content: {
      heading: "Built at the Intersection of Edge Speed & Human Potential",
      subheading: "Our Manifesto",
      narrativeText: "We engineer apparel and equipment with the same relentless optimization that powers modern edge computing. Zero latency, hyper-durable materials, and uncompromising performance for athletes who refuse to settle.",
      statItems: [
        { label: "Edge Latency", value: "< 50ms", desc: "Global edge dispatch" },
        { label: "Energy Return", value: "+32%", desc: "Carbon-matrix tech" },
        { label: "Active Athletes", value: "25,000+", desc: "Worldwide community" },
        { label: "D1 Availability", value: "99.99%", desc: "Cloudflare distributed" },
      ],
      ctaText: "Explore The Full Catalog",
      ctaUrl: "/search",
    },
  },
];

// In-memory fallback
let memorySections: HomepageSectionRecord[] = DEFAULT_HOMEPAGE_SECTIONS.map((sec) => ({
  ...sec,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

/**
 * List all homepage sections, optionally filtering to active only.
 * Always ordered by sortOrder ascending.
 */
export async function listHomepageSections(options?: {
  activeOnly?: boolean;
}): Promise<HomepageSectionRecord[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(homepageSections)
        .orderBy(asc(homepageSections.sortOrder));

      if (rows && rows.length > 0) {
        const parsed: HomepageSectionRecord[] = rows.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          content: typeof r.content === "string" ? JSON.parse(r.content) : (r.content || {}),
          imageUrl: r.imageUrl,
          sortOrder: r.sortOrder,
          isActive: Boolean(r.isActive),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));

        if (options?.activeOnly) {
          return parsed.filter((s) => s.isActive);
        }
        return parsed;
      }
    } catch (err) {
      console.warn("[listHomepageSections] D1 query error, falling back to memory:", err);
    }
  }

  // Memory fallback
  const items = [...memorySections].sort((a, b) => a.sortOrder - b.sortOrder);
  if (options?.activeOnly) {
    return items.filter((s) => s.isActive);
  }
  return items;
}

/**
 * Get a single homepage section by its ID
 */
export async function getHomepageSectionById(
  id: string
): Promise<HomepageSectionRecord | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(homepageSections)
        .where(eq(homepageSections.id, id))
        .limit(1);

      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          type: r.type,
          title: r.title,
          content: typeof r.content === "string" ? JSON.parse(r.content) : (r.content || {}),
          imageUrl: r.imageUrl,
          sortOrder: r.sortOrder,
          isActive: Boolean(r.isActive),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }
    } catch (err) {
      console.warn("[getHomepageSectionById] D1 query error:", err);
    }
  }

  return memorySections.find((s) => s.id === id) || null;
}

/**
 * Create a new homepage section
 */
export async function createHomepageSection(
  data: Partial<HomepageSectionRecord>
): Promise<HomepageSectionRecord> {
  const now = new Date().toISOString();
  const id = data.id || `sec-${Date.now()}`;
  const record: HomepageSectionRecord = {
    id,
    type: data.type || "custom",
    title: data.title || "Untitled Section",
    content: data.content || {},
    imageUrl: data.imageUrl || null,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : (memorySections.length + 1),
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  memorySections.push(record);

  const db = getDb();
  if (db) {
    try {
      await db.insert(homepageSections).values({
        id: record.id,
        type: record.type,
        title: record.title,
        content: record.content,
        imageUrl: record.imageUrl,
        sortOrder: record.sortOrder,
        isActive: record.isActive,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } catch (err) {
      console.error("[createHomepageSection] D1 insert error:", err);
      throw new Error("Failed to insert homepage section into D1.");
    }
  }

  return record;
}

/**
 * Update an existing homepage section
 */
export async function updateHomepageSection(
  id: string,
  updates: Partial<HomepageSectionRecord>
): Promise<HomepageSectionRecord | null> {
  const existing = await getHomepageSectionById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: HomepageSectionRecord = {
    ...existing,
    ...updates,
    content: updates.content ? { ...existing.content, ...updates.content } : existing.content,
    updatedAt: now,
  };

  const memIdx = memorySections.findIndex((s) => s.id === id);
  if (memIdx >= 0) {
    memorySections[memIdx] = updated;
  }

  const db = getDb();
  if (db) {
    try {
      await db
        .update(homepageSections)
        .set({
          type: updated.type,
          title: updated.title,
          content: updated.content,
          imageUrl: updated.imageUrl,
          sortOrder: updated.sortOrder,
          isActive: updated.isActive,
          updatedAt: now,
        })
        .where(eq(homepageSections.id, id));
    } catch (err) {
      console.error("[updateHomepageSection] D1 update error:", err);
      throw new Error("Failed to update homepage section in D1.");
    }
  }

  return updated;
}

/**
 * Delete a homepage section
 */
export async function deleteHomepageSection(id: string): Promise<boolean> {
  memorySections = memorySections.filter((s) => s.id !== id);

  const db = getDb();
  if (db) {
    try {
      await db.delete(homepageSections).where(eq(homepageSections.id, id));
      return true;
    } catch (err) {
      console.error("[deleteHomepageSection] D1 delete error:", err);
      throw new Error("Failed to delete homepage section from D1.");
    }
  }

  return true;
}

/**
 * Reorder sections by providing an ordered array of section IDs
 */
export async function reorderHomepageSections(orderedIds: string[]): Promise<boolean> {
  const db = getDb();
  const now = new Date().toISOString();

  // Update memory order
  orderedIds.forEach((id, idx) => {
    const s = memorySections.find((sec) => sec.id === id);
    if (s) {
      s.sortOrder = idx + 1;
      s.updatedAt = now;
    }
  });

  if (db) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await db
          .update(homepageSections)
          .set({
            sortOrder: i + 1,
            updatedAt: now,
          })
          .where(eq(homepageSections.id, orderedIds[i]));
      }
      return true;
    } catch (err) {
      console.error("[reorderHomepageSections] D1 update error:", err);
      throw new Error("Failed to persist section reordering to D1.");
    }
  }

  return true;
}

/**
 * Seed default template sections if table is empty
 */
export async function seedDefaultSectionsIfEmpty(): Promise<HomepageSectionRecord[]> {
  const existing = await listHomepageSections();
  if (existing.length > 0) {
    return existing;
  }

  const seeded: HomepageSectionRecord[] = [];
  for (const item of DEFAULT_HOMEPAGE_SECTIONS) {
    const sec = await createHomepageSection(item);
    seeded.push(sec);
  }

  return seeded;
}

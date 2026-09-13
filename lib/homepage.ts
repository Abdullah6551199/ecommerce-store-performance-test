import { cache } from "react";
import { getDb, homepageSections } from "./db";
import { asc, eq } from "drizzle-orm";

export type HomepageSectionType =
  | "hero"
  | "hero_carousel"
  | "categories"
  | "category_cards"
  | "featured_products"
  | "trending_products"
  | "trending_tabs"
  | "trust_bar"
  | "new_arrivals"
  | "brand_logos"
  | "promo_banner"
  | "brand_story"
  | "testimonials"
  | "newsletter"
  | "custom_html"
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
    id: "sec-hero-carousel",
    type: "hero",
    title: "Hero Carousel",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 1,
    isActive: true,
    content: {
      slides: [
        {
          badge: "Special Offer • New Season",
          heading: "Elevate Your Motion with Pure Precision",
          subheading: "Explore the new Spring Purple Collection. Engineered with micro-knit breathable fabrics and ultra-responsive lightweight foam soles.",
          primaryButtonText: "Shop Collection",
          primaryButtonUrl: "/shop",
          secondaryButtonText: "Explore Categories",
          secondaryButtonUrl: "#category-cards",
          imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Spring Purple Collection",
        },
        {
          badge: "Limited Edition Drop",
          heading: "Carbon Velocity Racing Series",
          subheading: "Tested by world-class marathoners. Feel 32% enhanced energy return on every stride with carbon-infused composite plates.",
          primaryButtonText: "Discover Velocity",
          primaryButtonUrl: "/shop",
          secondaryButtonText: "View Top Rated",
          secondaryButtonUrl: "#trending-products",
          imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Carbon Velocity Footwear",
        },
        {
          badge: "Trending Worldwide",
          heading: "Uncompromising Everyday Elegance",
          subheading: "Minimalist luxury athletic wear designed for seamless transition from high-intensity training to urban streetwear.",
          primaryButtonText: "Explore Now",
          primaryButtonUrl: "/shop",
          secondaryButtonText: "About Our Story",
          secondaryButtonUrl: "/about",
          imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Everyday Luxury Athletics",
        },
      ],
    },
  },
  {
    id: "sec-category-cards",
    type: "categories",
    title: "Category Cards Row",
    imageUrl: null,
    sortOrder: 2,
    isActive: true,
    content: {
      heading: "Featured Collections",
      badgeText: "Curated Categories",
      maxItems: 5,
    },
  },
  {
    id: "sec-trending-products",
    type: "trending_products",
    title: "Trending Products",
    imageUrl: null,
    sortOrder: 3,
    isActive: true,
    content: {
      heading: "Trending Products",
      badgeText: "Customer Favorites",
      maxItems: 10,
    },
  },
  {
    id: "sec-trust-bar",
    type: "trust_bar",
    title: "Store Trust Bar",
    imageUrl: null,
    sortOrder: 4,
    isActive: true,
    content: {
      items: [
        {
          icon: "shipping",
          title: "Free Worldwide Shipping",
          description: "On all orders over $50 with live tracking",
        },
        {
          icon: "return",
          title: "30-Day Return Policy",
          description: "Hassle-free exchange & money back guarantee",
        },
        {
          icon: "secure",
          title: "Secure Payment",
          description: "256-bit encrypted checkout protection",
        },
        {
          icon: "support",
          title: "24/7 Customer Support",
          description: "Dedicated concierge team ready to help",
        },
      ],
    },
  },
  {
    id: "sec-new-arrivals",
    type: "new_arrivals",
    title: "New Arrivals Showcase",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    sortOrder: 5,
    isActive: true,
    content: {
      badge: "New Collection",
      heading: "New Arrivals Just For You",
      discountText: "Save up to 40% OFF",
      subheading: "Experience cutting-edge athletic engineering designed for fluid movement and modern luxury.",
      buttonText: "Shop Collection",
      buttonUrl: "/shop",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    },
  },
  {
    id: "sec-brand-logos",
    type: "brand_logos",
    title: "Brand Partners",
    imageUrl: null,
    sortOrder: 6,
    isActive: true,
    content: {
      heading: "Trusted by World-Class Champions & Athletic Leaders",
      logos: [
        { name: "Vanguard Sport", logoText: "VANGUARD" },
        { name: "Apex Athletics", logoText: "APEX//LAB" },
        { name: "Kinetics Lab", logoText: "KINETICS" },
        { name: "Aero Velocity", logoText: "AERO VELOCITY" },
        { name: "Pulse Endurance", logoText: "PULSE PRO" },
        { name: "Chronicle Elite", logoText: "CHRONICLE" },
      ],
    },
  },
  {
    id: "sec-newsletter",
    type: "newsletter",
    title: "Newsletter Subscription",
    imageUrl: null,
    sortOrder: 7,
    isActive: true,
    content: {
      badgeText: "VIP Membership",
      heading: "Subscribe to Our Newsletter",
      subheading: "Unlock private access codes, training insights, and limited-edition colorway launches directly to your inbox.",
      buttonText: "Subscribe",
      placeholderText: "Enter your email address...",
      disclaimer: "We respect your privacy. Unsubscribe at any time with one click.",
    },
  },
];

// In-memory fallback
let memorySections: HomepageSectionRecord[] = DEFAULT_HOMEPAGE_SECTIONS.map((sec) => ({
  ...sec,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let cachedActiveSections: HomepageSectionRecord[] | null = null;
let lastActiveSectionsFetchTime = 0;
const HOMEPAGE_SECTIONS_CACHE_TTL_MS = 60000;

/**
 * List all homepage sections, optionally filtering to active only.
 * Always ordered by sortOrder ascending.
 * Wrapped with React.cache() to deduplicate queries within a single request.
 */
export const listHomepageSections = cache(async (options?: {
  activeOnly?: boolean;
}): Promise<HomepageSectionRecord[]> => {
  if (
    options?.activeOnly &&
    cachedActiveSections &&
    Date.now() - lastActiveSectionsFetchTime < HOMEPAGE_SECTIONS_CACHE_TTL_MS
  ) {
    return cachedActiveSections;
  }

  const db = getDb();
  if (db) {
    try {
      const query = db.select().from(homepageSections);
      const rows = options?.activeOnly
        ? await query.where(eq(homepageSections.isActive, true)).orderBy(asc(homepageSections.sortOrder))
        : await query.orderBy(asc(homepageSections.sortOrder));

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
          cachedActiveSections = parsed;
          lastActiveSectionsFetchTime = Date.now();
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
});

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

  cachedActiveSections = null;
  lastActiveSectionsFetchTime = 0;
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

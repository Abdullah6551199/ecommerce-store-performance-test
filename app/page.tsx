import React from "react";
import { listHomepageSections, seedDefaultSectionsIfEmpty } from "@/lib/homepage";
import { getActiveCategories } from "@/lib/categories";
import { getFeaturedProducts } from "@/lib/products";
import { renderHomepageSection } from "@/components/homepage/HomepageSections";

export const dynamic = "force-dynamic";

/**
 * Dynamic Storefront Homepage (Server Component)
 * Driven 100% by Cloudflare D1 `homepage_sections`, `categories`, and `products`.
 * Supports hero, categories, featured_products, promo_banner, brand_story,
 * testimonials, newsletter, and custom HTML sections.
 */
export default async function HomePage(): Promise<React.JSX.Element> {
  // Query active sections ordered by sortOrder
  let sections = await listHomepageSections({ activeOnly: true });
  if (sections.length === 0) {
    sections = await seedDefaultSectionsIfEmpty();
    sections = sections.filter((s) => s.isActive);
  }

  // Pre-fetch catalog data for sections that require relational records
  const [categories, featuredProducts] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div
      className="mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-24"
      style={{ maxWidth: "var(--container-max-width, 1280px)" }}
    >
      {sections.map((section) => (
        <React.Fragment key={section.id}>
          {renderHomepageSection(section, categories, featuredProducts)}
        </React.Fragment>
      ))}
    </div>
  );
}

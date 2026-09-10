import React from "react";
import { listHomepageSections, seedDefaultSectionsIfEmpty } from "@/lib/homepage";
import { getActiveCategories } from "@/lib/categories";
import { getFeaturedProducts } from "@/lib/products";
import { renderHomepageSection } from "@/components/homepage/HomepageSections";

import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/seo";

import { normalizeImageUrl } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const baseUrl = getBaseUrl();
  const title = settings.storeName
    ? `${settings.storeName} | Premium E-Commerce Experience`
    : "Apex Store | Premium E-Commerce Experience";
  const description =
    settings.description ||
    "Discover the next-generation digital storefront powered by Cloudflare Workers and Next.js.";

  return {
    title,
    description,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

  // Identify LCP hero image for high-priority preloading
  const heroSection = sections.find((s) => s.type === "hero" && s.imageUrl);
  const heroImageUrl = heroSection?.imageUrl
    ? normalizeImageUrl(heroSection.imageUrl, { hero: true, width: 700, quality: 70 })
    : null;

  return (
    <>
      {heroImageUrl && (
        <link
          rel="preload"
          as="image"
          href={heroImageUrl}
          fetchPriority="high"
        />
      )}
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
    </>
  );
}

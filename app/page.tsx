import React from "react";
import { listHomepageSections, seedDefaultSectionsIfEmpty } from "@/lib/homepage";
import { getActiveCategories } from "@/lib/categories";
import {
  getFeaturedProducts,
  getBestSellerProducts,
  getNewArrivalProducts,
  getTopRatedProducts,
} from "@/lib/products";
import { renderHomepageSection } from "@/components/homepage/HomepageSections";
import { getFeaturedBundles } from "@/lib/bundles";
import FeaturedBundlesSection from "@/components/homepage/FeaturedBundlesSection";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/seo";
import { normalizeImageUrl } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const baseUrl = getBaseUrl();
  const title = settings.storeName
    ? `${settings.storeName} | Chronicles Luxury & Athletic Store`
    : "Chronicles Store | Luxury Performance Apparel";
  const description =
    settings.description ||
    "Discover the new Purple Collection — engineered luxury athletic wear and high-performance footwear crafted for effortless style and peak endurance.";

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
  const [categories, featuredProducts, bestSellers, newArrivals, topRated, featuredBundles] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(10),
    getBestSellerProducts(10),
    getNewArrivalProducts(10),
    getTopRatedProducts(10),
    getFeaturedBundles(4),
  ]);

  // Identify LCP candidate hero image for high-priority preloading
  const heroSection = sections.find((s) => (s.type === "hero" || s.type === "hero_carousel") && s.isActive);
  const firstSlideImage = heroSection?.content?.slides?.[0]?.imageUrl || heroSection?.imageUrl;
  const heroImageUrl = firstSlideImage
    ? normalizeImageUrl(firstSlideImage, { hero: true, width: 900, quality: 80 })
    : null;

  const hasTrendingSection = sections.some(
    (s) => s.type === "trending_products" || s.type === "trending_tabs" || s.type === "featured_products"
  );

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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {sections.map((section) => {
          const isTrending =
            section.type === "trending_products" ||
            section.type === "trending_tabs" ||
            section.type === "featured_products";

          return (
            <React.Fragment key={section.id}>
              {renderHomepageSection(
                section,
                categories,
                featuredProducts,
                bestSellers,
                newArrivals,
                topRated
              )}
              {isTrending && featuredBundles.length > 0 && (
                <FeaturedBundlesSection bundles={featuredBundles} />
              )}
            </React.Fragment>
          );
        })}

        {!hasTrendingSection && featuredBundles.length > 0 && (
          <FeaturedBundlesSection bundles={featuredBundles} />
        )}
      </div>
    </>
  );
}

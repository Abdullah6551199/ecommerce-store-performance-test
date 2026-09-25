import React from "react";
import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import { getBaseUrl } from "@/lib/seo";
import { getActiveTheme, getThemeBySlug } from "@/lib/themes/loader";
import { renderTheme } from "@/lib/themes/engine";
import { fetchProducts, fetchCategories } from "@/lib/themes/data";
import { normalizeImageUrl } from "@/lib/utils";
import ThemePreviewWrapper from "@/components/themes/ThemePreviewWrapper";

export const revalidate = 60; // 60 seconds ISR cache

export async function generateMetadata(): Promise<Metadata> {
  const [settings, activeTheme] = await Promise.all([
    getStoreSettings(),
    getActiveTheme(),
  ]);

  const baseUrl = getBaseUrl();
  const title = settings.storeName
    ? `${settings.storeName} | ${activeTheme.name}`
    : `Nasrify Store | ${activeTheme.name}`;
  const description =
    settings.description ||
    activeTheme.description ||
    "Clean, modern, high-performance e-commerce store powered by the Nasrify Themes Framework.";

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

interface HomePageProps {
  searchParams?: Promise<{
    preview_theme?: string;
  }>;
}

export default async function HomePage({
  searchParams,
}: HomePageProps): Promise<React.JSX.Element> {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const previewSlug = resolvedParams?.preview_theme;

  const [activeTheme, previewTheme, storeSettings, products, categories] = await Promise.all([
    getActiveTheme(),
    previewSlug ? getThemeBySlug(previewSlug) : Promise.resolve(null),
    getStoreSettings(),
    fetchProducts(undefined, 12),
    fetchCategories(undefined, 8),
  ]);

  const effectiveTheme = previewTheme || activeTheme;

  const storeData = {
    products,
    categories,
    settings: storeSettings,
  };

  // Find hero section if present to preload image for LCP
  const heroSection = effectiveTheme.sections.find(
    (s) => s.type === "hero" && s.enabled
  );
  const heroImageUrl = heroSection?.settings?.image_url
    ? normalizeImageUrl(heroSection.settings.image_url, {
        hero: true,
        width: 1200,
        quality: 80,
      })
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
      <div className="w-full min-h-screen">
        <ThemePreviewWrapper initialTheme={effectiveTheme} storeData={storeData} />
      </div>
    </>
  );
}

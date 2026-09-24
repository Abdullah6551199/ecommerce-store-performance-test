import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/cms";
import { getStoreSettings } from "@/lib/settings";
import { getAbsoluteUrl } from "@/lib/seo";
import { getActiveTheme } from "@/lib/themes/loader";
import { renderPageTheme } from "@/lib/themes/engine";

export const revalidate = 60;

interface CustomPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CustomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPageBySlug(slug), getStoreSettings()]);
  const storeName = settings?.storeName || "ApexStore";

  if (!page || (!page.isPublished && !page.isDefault)) {
    return {
      title: `Page Not Found | ${storeName}`,
    };
  }

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || `Information page about ${page.title} at ${storeName}.`;
  const canonical = getAbsoluteUrl(`/pages/${slug}`);

  return {
    title: `${title} | ${storeName}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${storeName}`,
      description,
      url: canonical,
      type: "website",
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${storeName}`,
      description,
    },
  };
}

export default async function CustomPage({ params }: CustomPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const [page, theme] = await Promise.all([
    getPageBySlug(slug),
    getActiveTheme(),
  ]);

  if (!page || (!page.isPublished && !page.isDefault)) {
    notFound();
  }

  const pageData = {
    title: page.title,
    content: page.cleanContent || page.content || "",
    slug: page.slug,
  };

  return (
    <div className="py-8 sm:py-12 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {renderPageTheme(theme, "page", { page: pageData })}
      </div>
    </div>
  );
}

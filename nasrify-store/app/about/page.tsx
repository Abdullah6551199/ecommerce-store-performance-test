import React from "react";
import type { Metadata } from "next";
import { getPageBySlug, DEFAULT_PAGE_TEMPLATES } from "@/lib/cms";
import { getStoreSettings } from "@/lib/settings";
import { getAbsoluteUrl } from "@/lib/seo";
import { getActiveTheme } from "@/lib/themes/loader";
import { renderPageTheme } from "@/lib/themes/engine";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug("about"), getStoreSettings()]);
  const storeName = settings?.storeName || "ApexStore";
  const tpl = DEFAULT_PAGE_TEMPLATES.about;

  const title = page?.seoTitle || page?.title || tpl.title;
  const description = page?.seoDescription || tpl.seoDescription;
  const canonical = getAbsoluteUrl("/about");

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
      images: page?.ogImage ? [{ url: page.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${storeName}`,
      description,
    },
  };
}

export default async function AboutPage(): Promise<React.JSX.Element> {
  const [page, theme] = await Promise.all([
    getPageBySlug("about"),
    getActiveTheme(),
  ]);
  const fallback = DEFAULT_PAGE_TEMPLATES.about;

  const pageData = {
    title: page?.title || fallback.title,
    content: page?.content || fallback.content,
    slug: "about",
  };

  return (
    <div className="py-8 sm:py-12 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {renderPageTheme(theme, "page", { page: pageData })}
      </div>
    </div>
  );
}

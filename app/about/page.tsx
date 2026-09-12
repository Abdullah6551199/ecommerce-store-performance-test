import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, DEFAULT_PAGE_TEMPLATES } from "@/lib/cms";
import { getStoreSettings } from "@/lib/settings";
import { getAbsoluteUrl } from "@/lib/seo";

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
  const page = await getPageBySlug("about");
  const fallback = DEFAULT_PAGE_TEMPLATES.about;

  const title = page?.title || fallback.title;
  const content = page?.content || fallback.content;

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-xs text-zinc-500 dark:text-zinc-400 space-x-2">
          <a href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Home
          </a>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">{title}</span>
        </nav>

        {/* Content Container */}
        <article className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-8 sm:p-12 shadow-sm">
          <div
            className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed
              prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-white
              prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mb-6
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:my-4 prose-p:text-base prose-p:leading-relaxed
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-li:my-1.5
              prose-strong:font-bold prose-strong:text-zinc-900 dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </div>
    </div>
  );
}

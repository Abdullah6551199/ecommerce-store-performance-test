import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/cms";
import { getStoreSettings } from "@/lib/settings";
import { getAbsoluteUrl } from "@/lib/seo";

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
  const page = await getPageBySlug(slug);

  if (!page || (!page.isPublished && !page.isDefault)) {
    notFound();
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-xs text-zinc-500 dark:text-zinc-400 space-x-2">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">{page.title}</span>
        </nav>

        {/* Content Container */}
        <article className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-8 sm:p-12 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6">
            {page.title}
          </h1>
          <div
            className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed
              prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:my-4 prose-p:text-base prose-p:leading-relaxed
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-li:my-1.5
              prose-strong:font-bold prose-strong:text-zinc-900 dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: page.content || "" }}
          />
        </article>
      </div>
    </div>
  );
}

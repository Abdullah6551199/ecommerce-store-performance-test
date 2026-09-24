import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getActiveFaqs } from "@/lib/cms";
import { getStoreSettings } from "@/lib/settings";
import { getAbsoluteUrl } from "@/lib/seo";
import FaqAccordion from "@/components/faq/FaqAccordion";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const storeName = settings?.storeName || "ApexStore";

  const title = `Frequently Asked Questions (FAQ) | ${storeName}`;
  const description = `Find quick answers to common questions about ordering, express shipping, returns, sizing, and payments at ${storeName}.`;
  const canonical = getAbsoluteUrl("/faq");

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function FaqPage(): Promise<React.JSX.Element> {
  const faqs = await getActiveFaqs();

  return (
    <div className="py-12 sm:py-16 bg-white text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-body)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-xs text-[var(--theme-text-muted,#71717A)] space-x-2">
          <Link href="/" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--theme-text,#18181B)] font-medium">Frequently Asked Questions</span>
        </nav>

        {/* Page Header */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--theme-primary-light,#DCFCE7)] text-[var(--theme-accent,#18181B)] border border-[var(--theme-border,#E4E4E7)] mb-3">
            Help &amp; Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed">
            Everything you need to know about our products, expedited dispatch, 30-day trial guarantee, and payments.
          </p>
        </div>

        {/* Accordion List with Search & Filtering */}
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}

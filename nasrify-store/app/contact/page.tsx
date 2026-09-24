import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPageBySlug, DEFAULT_PAGE_TEMPLATES } from "@/lib/cms";
import { getStoreSettings } from "@/lib/settings";
import { getAbsoluteUrl } from "@/lib/seo";
import ContactForm from "@/components/contact/ContactForm";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug("contact"), getStoreSettings()]);
  const storeName = settings?.storeName || "ApexStore";
  const tpl = DEFAULT_PAGE_TEMPLATES.contact;

  const title = page?.seoTitle || page?.title || tpl.title;
  const description = page?.seoDescription || tpl.seoDescription;
  const canonical = getAbsoluteUrl("/contact");

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ContactPage(): Promise<React.JSX.Element> {
  const [page, settings] = await Promise.all([getPageBySlug("contact"), getStoreSettings()]);
  const fallback = DEFAULT_PAGE_TEMPLATES.contact;

  const title = page?.title || fallback.title;
  const pageIntro = page?.content || fallback.content;

  const email = settings.contactEmail || "support@apexstore.com";
  const phone = settings.contactPhone || "+1 (800) 555-APEX";
  const address = settings.contactAddress || "100 Velocity Blvd, San Francisco, CA";

  return (
    <div className="py-12 sm:py-16 bg-white text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-body)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-xs text-[var(--theme-text-muted,#71717A)] space-x-2">
          <Link href="/" className="hover:text-[var(--theme-primary,#25D366)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--theme-text,#18181B)] font-medium">{title}</span>
        </nav>

        {/* Header Intro */}
        <div className="max-w-2xl mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--theme-primary-light,#DCFCE7)] text-[var(--theme-accent,#18181B)] border border-[var(--theme-border,#E4E4E7)] mb-3">
            💬 Customer Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            {title}
          </h1>
          <div
            className="mt-3 text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed prose"
            dangerouslySetInnerHTML={{ __html: pageIntro }}
          />
        </div>

        {/* Main Grid: Details + Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light,#DCFCE7)] text-[var(--theme-accent,#18181B)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-[var(--theme-text,#18181B)] text-sm">Direct Email</h3>
              <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">Our team replies within 24 business hours.</p>
              <a
                href={`mailto:${email}`}
                className="mt-3 inline-block font-mono text-xs font-semibold text-[var(--theme-primary,#25D366)] hover:underline"
              >
                {email}
              </a>
            </div>

            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light,#DCFCE7)] text-[var(--theme-accent,#18181B)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-bold text-[var(--theme-text,#18181B)] text-sm">Phone Support</h3>
              <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">Mon–Fri: 8:00 AM – 6:00 PM EST</p>
              <div className="mt-3 font-mono text-xs font-semibold text-[var(--theme-text,#18181B)]">
                {phone}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-accent,#18181B)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-[var(--theme-text,#18181B)] text-sm">Headquarters</h3>
              <p className="text-xs text-[var(--theme-text-muted,#71717A)] mt-1">{address}</p>
            </div>

            {/* Link to FAQs */}
            <div className="p-4 rounded-2xl bg-[var(--theme-surface,#F4F4F5)] text-xs text-[var(--theme-text,#18181B)] flex items-center justify-between">
              <span>Have immediate questions?</span>
              <Link href="/faq" className="font-bold text-[var(--theme-primary,#25D366)] hover:underline">
                View FAQs &rarr;
              </Link>
            </div>
          </div>

          {/* Interactive Form Column */}
          <div className="lg:col-span-2 rounded-3xl border border-[var(--theme-border,#E4E4E7)] bg-white p-8 sm:p-10 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-[var(--theme-text,#18181B)] mb-1 font-[family-name:var(--theme-font-heading)]">
              Send us a Message
            </h2>
            <p className="text-xs text-[var(--theme-text-muted,#71717A)] mb-6">
              Complete the form below and our customer support team will get back to you.
            </p>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

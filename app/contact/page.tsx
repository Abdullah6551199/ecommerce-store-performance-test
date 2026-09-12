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
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-xs text-zinc-500 dark:text-zinc-400 space-x-2">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">{title}</span>
        </nav>

        {/* Header Intro */}
        <div className="max-w-2xl mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#18C729]/10 text-[#18C729] border border-[#18C729]/20 mb-3">
            💬 Customer Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h1>
          <div
            className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: pageIntro }}
          />
        </div>

        {/* Main Grid: Details + Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Direct Email</h3>
              <p className="text-xs text-zinc-500 mt-1">Our team replies within 24 business hours.</p>
              <a
                href={`mailto:${email}`}
                className="mt-3 inline-block font-mono text-xs font-semibold text-[#18C729] hover:underline"
              >
                {email}
              </a>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Phone Support</h3>
              <p className="text-xs text-zinc-500 mt-1">Mon–Fri: 8:00 AM – 6:00 PM EST</p>
              <div className="mt-3 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {phone}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Headquarters</h3>
              <p className="text-xs text-zinc-500 mt-1">{address}</p>
            </div>

            {/* Link to FAQs */}
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/5 text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
              <span>Have immediate questions?</span>
              <Link href="/faq" className="font-bold text-[#18C729] hover:underline">
                View FAQs &rarr;
              </Link>
            </div>
          </div>

          {/* Interactive Form Column */}
          <div className="lg:col-span-2 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] p-8 sm:p-10 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">
              Send us a Message
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Complete the form below and an athlete support specialist will get back to you.
            </p>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";
import { normalizeImageUrl } from "@/lib/utils";

interface FooterProps {
  settings?: StoreSettings;
}

/**
 * Dynamic Storefront Footer Component
 * Rendered from Cloudflare D1 settings with contact details, social links,
 * multi-column navigation, and dynamic copyright year.
 */
export default function Footer({ settings = DEFAULT_STORE_SETTINGS }: FooterProps): React.JSX.Element {
  const currentYear = new Date().getFullYear();
  const footerLinks = settings.footerLinks && settings.footerLinks.length > 0
    ? settings.footerLinks
    : DEFAULT_STORE_SETTINGS.footerLinks;

  const social = settings.socialLinks || DEFAULT_STORE_SETTINGS.socialLinks;

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#070c09] text-zinc-600 dark:text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 lg:gap-12">
          {/* Brand & Contact Column */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              {settings.logoUrl ? (
                <Image
                  src={normalizeImageUrl(settings.logoUrl, { width: 160, quality: 80 })}
                  alt={settings.storeName}
                  width={120}
                  height={36}
                  loading="lazy"
                  className="h-9 w-auto max-h-9 object-contain rounded-lg"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#18C729] to-[#FEF500] shadow-md shadow-[#18C729]/20">
                  <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {settings.storeName}
              </span>
            </Link>

            <p className="text-xs text-zinc-600 dark:text-white/60 leading-relaxed max-w-sm">
              {settings.description}
            </p>

            {/* Dynamic Contact Details from Settings */}
            <div className="space-y-2 pt-1 text-xs text-zinc-600 dark:text-white/70">
              {settings.contactEmail && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[#18C729] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    {settings.contactEmail}
                  </a>
                </div>
              )}

              {settings.contactPhone && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[#18C729] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{settings.contactPhone}</span>
                </div>
              )}

              {settings.contactAddress && (
                <div className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-[#18C729] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{settings.contactAddress}</span>
                </div>
              )}
            </div>

            {/* Social Media Links from Settings */}
            <div className="flex items-center gap-3 pt-2">
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200/70 dark:bg-white/5 text-zinc-600 dark:text-white/60 hover:bg-[#18C729]/20 hover:text-[#18C729] transition-all"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200/70 dark:bg-white/5 text-zinc-600 dark:text-white/60 hover:bg-[#18C729]/20 hover:text-[#18C729] transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200/70 dark:bg-white/5 text-zinc-600 dark:text-white/60 hover:bg-[#18C729]/20 hover:text-[#18C729] transition-all"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3V2.5h-3.333C8.423 2.5 7.198 4.07 7.198 6.99v2.52H4.198v3.98h3v8.01z" />
                  </svg>
                </a>
              )}
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200/70 dark:bg-white/5 text-zinc-600 dark:text-white/60 hover:bg-[#18C729]/20 hover:text-[#18C729] transition-all"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Columns from Settings */}
          {footerLinks.map((col, idx) => (
            <div key={`${col.title}-${idx}`} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-xs">
                {col.links.map((link, linkIdx) => (
                  <li key={`${link.url}-${linkIdx}`}>
                    <Link
                      href={link.url}
                      prefetch={false}
                      className="text-zinc-500 dark:text-white/60 hover:text-[#18C729] dark:hover:text-[#18C729] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Accents */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-white/10 pt-8 text-xs text-zinc-500 dark:text-white/50">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear}</span>
            <span className="h-1 w-1 rounded-full bg-[#18C729]" />
            <span>{settings.copyrightText || `${settings.storeName}. All rights reserved.`}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#18C729] font-medium">⚡ Premium Athletic Gear</span>
            <span className="text-zinc-300 dark:text-white/30">•</span>
            <span>Worldwide Shipping • Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

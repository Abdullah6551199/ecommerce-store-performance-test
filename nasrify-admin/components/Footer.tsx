import React from "react";
import Link from "next/link";
import Image from "next/image";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";
import { normalizeImageUrl } from "@/lib/utils";
import { getNavigationPages } from "@/lib/cms";
import PaymentIcons from "@/components/PaymentIcons";

interface FooterProps {
  settings?: StoreSettings;
}

/**
 * Stage 18.1 Chronicles-Style 5-Column Storefront Footer
 * Features brand info, category & collection links, company, support, legal,
 * social links, dynamic copyright year, and payment method badges.
 */
export default async function Footer({
  settings = DEFAULT_STORE_SETTINGS,
}: FooterProps): Promise<React.JSX.Element> {
  const currentYear = new Date().getFullYear();

  // Load custom pages from CMS marked showInFooter
  let customCompanyLinks: Array<{ label: string; url: string }> = [];
  let customLegalLinks: Array<{ label: string; url: string }> = [];

  try {
    const { footerPages } = await getNavigationPages();
    const coreSlugs = ["home", "about", "contact", "privacy-policy", "terms", "returns", "shipping", "faq"];
    const customFooterPages = footerPages.filter((p) => !coreSlugs.includes(p.slug));

    customFooterPages.forEach((p) => {
      const s = p.slug.toLowerCase();
      if (s.includes("terms") || s.includes("privacy") || s.includes("cookie") || s.includes("policy") || s.includes("legal")) {
        customLegalLinks.push({ label: p.title, url: p.href });
      } else {
        customCompanyLinks.push({ label: p.title, url: p.href });
      }
    });
  } catch (err) {
    console.warn("Could not load dynamic footer CMS pages:", err);
  }

  const social = settings.socialLinks || DEFAULT_STORE_SETTINGS.socialLinks;

  return (
    <footer className="w-full border-t border-[#E4E4E7]/70 dark:border-zinc-800/40 bg-[#F4F4F5] dark:bg-[#18181B] text-[#18181B] dark:text-[#DCFCE7] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand Info & Social Icons */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              {settings.logoUrl ? (
                <Image
                  src={normalizeImageUrl(settings.logoUrl, { width: 160, quality: 80 })}
                  alt={settings.storeName}
                  width={120}
                  height={36}
                  loading="lazy"
                  className="h-8 w-auto max-h-8 object-contain rounded-lg"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#25D366] to-[#1EA855] shadow-md shadow-[#25D366]/20">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              <span className="text-base font-black tracking-tight text-[#18181B] dark:text-white">
                {settings.storeName || "ApexStore"}
              </span>
            </Link>

            <p className="text-xs text-[#15803D]/80 dark:text-[#DCFCE7]/80 leading-relaxed max-w-xs">
              {settings.description || "Discover premium apparel and high-performance collections engineered for everyday elegance and dynamic lifestyle."}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7] dark:border-zinc-800/60 bg-white dark:bg-[#18181B] text-[#1EA855] dark:text-zinc-400 hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] transition-all"
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7] dark:border-zinc-800/60 bg-white dark:bg-[#18181B] text-[#1EA855] dark:text-zinc-400 hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] transition-all"
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7] dark:border-zinc-800/60 bg-white dark:bg-[#18181B] text-[#1EA855] dark:text-zinc-400 hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] transition-all"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3V2.5h-3.333C8.423 2.5 7.198 4.07 7.198 6.99v2.52H4.198v3.98h3v8.01z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-white border-b border-[#E4E4E7]/50 dark:border-zinc-800/40 pb-1.5">
              Shop
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/bundles" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Product Bundles
                </Link>
              </li>
              <li>
                <Link href="/search?q=arrivals" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/search?q=best+seller" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/search?q=women" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Women&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/search?q=men" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Men&apos;s Collection
                </Link>
              </li>
              <li>
                <Link href="/search?q=accessories" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Accessories &amp; Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-white border-b border-[#E4E4E7]/50 dark:border-zinc-800/40 pb-1.5">
              Company
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Blog &amp; Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              {customCompanyLinks.map((p, idx) => (
                <li key={idx}>
                  <Link href={p.url} className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-white border-b border-[#E4E4E7]/50 dark:border-zinc-800/40 pb-1.5">
              Support
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/faq" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Help &amp; FAQ
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Customer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-white border-b border-[#E4E4E7]/50 dark:border-zinc-800/40 pb-1.5">
              Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                  Cookie Policy &amp; Settings
                </Link>
              </li>
              {customLegalLinks.map((p, idx) => (
                <li key={idx}>
                  <Link href={p.url} className="hover:text-[#25D366] dark:hover:text-white transition-colors">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E4E4E7]/60 dark:border-zinc-800/50 pt-8 text-xs text-[#18181B]/80 dark:text-[#DCFCE7]/70">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} {settings.storeName || "ApexStore"}. All rights reserved.</span>
          </div>

          {/* Payment Method Badges (Integrated with payment_icons table) */}
          <PaymentIcons className="flex items-center gap-2 text-[10px] font-bold" />
        </div>
      </div>
    </footer>
  );
}

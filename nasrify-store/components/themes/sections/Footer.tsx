import React from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; url: string }>;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface FooterSettings {
  logo_text?: string;
  columns?: FooterColumn[];
  social_links?: SocialLink[];
  copyright?: string;
  newsletter_signup?: boolean;
}

export default function Footer({
  variant = "standard",
  settings = {},
  themeSettings,
}: SectionProps<FooterSettings>) {
  const logoText = settings.logo_text || "Nasrify Store";
  const copyright = settings.copyright || `© ${new Date().getFullYear()} Nasrify Inc. All rights reserved.`;

  const columns = settings.columns?.length
    ? settings.columns
    : [
        {
          title: "Shop",
          links: [
            { label: "All Products", url: "/shop" },
            { label: "Featured", url: "/shop?filter=featured" },
            { label: "New Arrivals", url: "/shop?filter=new" },
            { label: "Sale", url: "/shop?filter=sale" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About Us", url: "/about" },
            { label: "Contact", url: "/contact" },
            { label: "FAQ", url: "/faq" },
          ],
        },
        {
          title: "Policies",
          links: [
            { label: "Privacy Policy", url: "/privacy-policy" },
            { label: "Terms of Service", url: "/terms" },
            { label: "Shipping & Returns", url: "/shipping" },
            { label: "Cookie Policy", url: "/cookie-policy" },
          ],
        },
        {
          title: "Customer Care",
          links: [
            { label: "My Account", url: "/account" },
            { label: "Track Order", url: "/track-order" },
            { label: "Wishlist", url: "/wishlist" },
          ],
        },
      ];

  const socialLinks = settings.social_links?.length
    ? settings.social_links
    : [
        { platform: "twitter", url: "https://twitter.com" },
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "github", url: "https://github.com" },
      ];

  if (variant === "minimal") {
    return (
      <footer className="border-t border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-extrabold text-lg tracking-tight text-[var(--theme-text,#18181B)]">
            {logoText}
          </span>
          <p className="text-xs text-[var(--theme-text-muted,#71717A)]">{copyright}</p>
        </div>
      </footer>
    );
  }

  const isExpanded = variant === "expanded";

  return (
    <footer className="border-t border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)]">
      {isExpanded && (
        <div className="border-b border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <span className="text-3xl">🚀</span>
              <div>
                <h4 className="font-bold text-sm text-[var(--theme-text,#18181B)]">Global Express Delivery</h4>
                <p className="text-xs text-[var(--theme-text-muted,#71717A)]">Shipped with real-time tracking worldwide</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <span className="text-3xl">🛡️</span>
              <div>
                <h4 className="font-bold text-sm text-[var(--theme-text,#18181B)]">Safe &amp; Secure Checkout</h4>
                <p className="text-xs text-[var(--theme-text-muted,#71717A)]">Encrypted transactions &amp; fraud defense</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <span className="text-3xl">✨</span>
              <div>
                <h4 className="font-bold text-sm text-[var(--theme-text,#18181B)]">Exceptional Quality</h4>
                <p className="text-xs text-[var(--theme-text-muted,#71717A)]">Tested rigorously for durability &amp; style</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-4">
            <span className="font-extrabold text-xl tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
              {logoText}
            </span>
            <p className="text-xs text-[var(--theme-text-muted,#71717A)] leading-relaxed font-[family-name:var(--theme-font-body)]">
              Designed for modern living. Engineered for peak performance and timeless aesthetics.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-white flex items-center justify-center text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-primary,#25D366)] hover:border-[var(--theme-primary,#25D366)] transition-colors shadow-2xs"
                  aria-label={s.platform}
                >
                  <span className="capitalize text-xs font-bold">{s.platform[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--theme-text,#18181B)]">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.url}
                      className="text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 pt-8 border-t border-[var(--theme-border,#E4E4E7)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--theme-text-muted,#71717A)] gap-4">
          <p>{copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/cookie-policy" className="hover:underline">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

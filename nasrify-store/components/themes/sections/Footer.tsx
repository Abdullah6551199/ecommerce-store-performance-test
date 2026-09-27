import React from "react";
import Link from "next/link";
import { SectionProps } from "@/lib/themes/types";
import { renderRich } from "@/lib/themes/utils";

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
          <span
            data-editable="logo_text"
            className="font-extrabold text-lg tracking-tight text-[var(--theme-text,#18181B)]"
            dangerouslySetInnerHTML={renderRich(logoText)}
          />
          <p
            data-editable="copyright"
            className="text-xs text-[var(--theme-text-muted,#71717A)]"
            dangerouslySetInnerHTML={renderRich(copyright)}
          />
        </div>
      </footer>
    );
  }

  if (variant === "centered") {
    return (
      <footer className="border-t border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span
            data-editable="logo_text"
            className="font-extrabold text-2xl tracking-tight text-[var(--theme-text,#18181B)] inline-block"
            dangerouslySetInnerHTML={renderRich(logoText)}
          />
          <p className="text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] max-w-md mx-auto">
            Thoughtfully crafted products made for comfort, style, and endurance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {columns.flatMap((c) => c.links).slice(0, 6).map((link, idx) => (
              <Link
                key={idx}
                href={link.url}
                className="text-xs sm:text-sm font-medium text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-white flex items-center justify-center text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-accent,#2563EB)] transition-colors shadow-2xs"
                aria-label={s.platform}
              >
                <span className="capitalize text-xs font-bold">{s.platform[0]}</span>
              </a>
            ))}
          </div>
          <div className="pt-6 border-t border-[var(--theme-border,#E4E4E7)] text-xs text-[var(--theme-text-muted,#71717A)]">
            <p data-editable="copyright" dangerouslySetInnerHTML={renderRich(copyright)} />
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "mega") {
    return (
      <footer className="border-t border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] text-[var(--theme-text,#18181B)]">
        {/* Newsletter bar */}
        <div className="border-b border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--theme-text,#18181B)]">Join our inner circle</h3>
              <p className="text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] mt-1">Get 15% off your first order plus secret drop alerts.</p>
            </div>
            <div className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-white focus:outline-hidden focus:ring-2 focus:ring-[var(--theme-accent,#2563EB)]"
              />
              <button
                type="button"
                className="shrink-0 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* 6 Column Matrix */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
              <span
                data-editable="logo_text"
                className="font-extrabold text-2xl tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
                dangerouslySetInnerHTML={renderRich(logoText)}
              />
              <p className="text-xs text-[var(--theme-text-muted,#71717A)] leading-relaxed max-w-sm">
                The flagship destination for curated lifestyle essentials. Built with edge performance and precision engineering.
              </p>
              <div className="flex items-center gap-3 pt-1">
                {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-[var(--theme-border,#E4E4E7)] bg-white flex items-center justify-center text-xs font-bold text-[var(--theme-text-muted,#71717A)] hover:text-black shadow-2xs"
                  >
                    {s.platform[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

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
                        className="text-xs text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--theme-border,#E4E4E7)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--theme-text-muted,#71717A)] gap-4">
            <p data-editable="copyright" dangerouslySetInnerHTML={renderRich(copyright)} />
            <div className="flex items-center gap-4">
              <span>Encrypted 256-Bit SSL Checkout</span>
              <span>•</span>
              <span>All Major Cards Accepted</span>
            </div>
          </div>
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
            <span
              data-editable="logo_text"
              className="font-extrabold text-xl tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
              dangerouslySetInnerHTML={renderRich(logoText)}
            />
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
          <p data-editable="copyright" dangerouslySetInnerHTML={renderRich(copyright)} />
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

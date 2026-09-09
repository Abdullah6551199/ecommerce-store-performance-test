import React from "react";
import Link from "next/link";
import Image from "next/image";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";
import { normalizeImageUrl } from "@/lib/utils";
import HeaderSearch from "@/components/HeaderSearch";
import CartNavButton from "@/components/CartNavButton";
import MobileNav from "@/components/MobileNav";

interface HeaderProps {
  settings?: StoreSettings;
}

/**
 * Server-Rendered Storefront Header Component.
 * The logo, desktop navigation, announcement bar, and layout are rendered at the server/edge.
 * Search, shopping cart badge, and mobile navigation are client islands.
 */
export default function Header({ settings = DEFAULT_STORE_SETTINGS }: HeaderProps): React.JSX.Element {
  const navLinks = settings.headerNav && settings.headerNav.length > 0
    ? settings.headerNav
    : DEFAULT_STORE_SETTINGS.headerNav;

  return (
    <>
      {/* 1. Optional Top Announcement Bar (Server-rendered) */}
      {settings.showAnnouncement && settings.announcementText && (
        <div className="bg-gradient-to-r from-[#18C729]/90 via-[#12a822]/90 to-[#FEF500]/90 px-4 py-1.5 text-center text-[11px] font-semibold text-black">
          {settings.announcementUrl ? (
            <Link
              href={settings.announcementUrl}
              className="hover:underline inline-flex items-center gap-1.5"
            >
              <span>{settings.announcementText}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <span>{settings.announcementText}</span>
          )}
        </div>
      )}

      {/* 2. Main Navigation Header (Server Component Container) */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel backdrop-blur-md bg-[#080e0a]/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Logo Area (Server-rendered) */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {settings.logoUrl ? (
              <Image
                src={normalizeImageUrl(settings.logoUrl, { width: 160, quality: 80 })}
                alt={settings.storeName}
                width={120}
                height={40}
                priority
                className="h-10 w-auto max-h-10 object-contain rounded-lg"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#18C729] to-[#FEF500] shadow-lg shadow-[#18C729]/20 group-hover:scale-105 transition-transform"
                aria-label="Store Logo"
              >
                <svg
                  className="h-6 w-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#18C729] transition-colors">
                {settings.storeName || "ApexStore"}
              </span>
            </div>
          </Link>

          {/* Search Bar (Client Island) */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <HeaderSearch />
          </div>

          {/* Navigation Links & Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Desktop Navigation (Server-rendered) */}
            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-white/70">
              {navLinks.map((item, idx) => (
                <Link
                  key={`${item.url}-${idx}`}
                  href={item.url}
                  className="hover:text-[#18C729] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin/products"
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#FEF500] hover:bg-white/10 transition-colors"
              >
                Admin
              </Link>
            </nav>

            {/* Account Icon (Server-rendered) */}
            <Link
              href="/admin/login"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-[#18C729]/40 transition-all"
              title="Account / Admin Login"
              aria-label="Account"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Cart Button (Client Island) */}
            <CartNavButton />

            {/* Mobile menu toggle & drawer (Client Island) */}
            <MobileNav navLinks={navLinks} />
          </div>
        </div>
      </header>
    </>
  );
}

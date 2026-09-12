import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";
import { getActiveCategories } from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/utils";
import HeaderSearch from "@/components/HeaderSearch";
import CategoriesDropdown from "@/components/CategoriesDropdown";
import CartNavButton from "@/components/CartNavButton";
import WishlistNavButton from "@/components/WishlistNavButton";
import ThemeToggle from "@/components/ThemeToggle";

const MobileNav = dynamic(() => import("@/components/MobileNav"));

interface HeaderProps {
  settings?: StoreSettings;
}

/**
 * Stage 15: Server-Rendered Storefront Header Component.
 * Full multi-page navigation architecture with hover Categories dropdown,
 * dedicated Shop/About/Contact links, Account router, and mobile accordion drawer.
 */
export default async function Header({
  settings = DEFAULT_STORE_SETTINGS,
}: HeaderProps): Promise<React.JSX.Element> {
  const activeCategories = await getActiveCategories();

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
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-white/10 glass-panel backdrop-blur-md bg-white/85 dark:bg-[#080e0a]/85 transition-colors duration-300">
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
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white group-hover:text-[#18C729] transition-colors">
                {settings.storeName || "ApexStore"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Link href="/" className="hover:text-[#18C729] transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-[#18C729] transition-colors">
              Shop
            </Link>

            {/* Categories Hover Dropdown */}
            <CategoriesDropdown categories={activeCategories} />

            <Link href="/about" className="hover:text-[#18C729] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#18C729] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search Bar (Client Island) */}
          <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-1 sm:mx-2">
            <HeaderSearch />
          </div>

          {/* Navigation Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Wishlist Button (Client Island) */}
            <WishlistNavButton />

            {/* Cart Button (Client Island) */}
            <CartNavButton />

            {/* Account Icon (Dedicated /account route) */}
            <Link
              href="/account"
              prefetch={false}
              className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white hover:border-[#18C729]/40 transition-all"
              title="Account / Sign In"
              aria-label="Account"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Dark / Light Theme Toggle Switch */}
            <ThemeToggle storageKey="apex_theme" />

            {/* Mobile menu toggle & drawer (Client Island) */}
            <MobileNav categories={activeCategories} />
          </div>
        </div>
      </header>
    </>
  );
}

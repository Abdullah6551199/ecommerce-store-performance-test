import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";
import { getActiveCategories } from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/utils";
import { getNavigationPages } from "@/lib/cms";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import SubNavBar from "@/components/SubNavBar";
import HeaderSearch from "@/components/HeaderSearch";
import CategoriesDropdown from "@/components/CategoriesDropdown";
import MegaMenuDropdown, { MegaMenuColumn } from "@/components/MegaMenuDropdown";
import CartNavButton from "@/components/CartNavButton";
import WishlistNavButton from "@/components/WishlistNavButton";
import AccountNavButton from "@/components/AccountNavButton";
import NotificationNavButton from "@/components/NotificationNavButton";
import ThemeToggle from "@/components/ThemeToggle";

const MobileNav = dynamic(() => import("@/components/MobileNav"));

interface HeaderProps {
  settings?: StoreSettings;
}

const WOMEN_COLUMNS: MegaMenuColumn[] = [
  {
    title: "Clothing",
    items: [
      { label: "Tops & T-Shirts", href: "/search?q=women+top" },
      { label: "Hoodies & Sweatshirts", href: "/search?q=women+hoodie" },
      { label: "Jackets & Vests", href: "/search?q=women+jacket", badge: "New" },
      { label: "Sports Bras", href: "/search?q=bra" },
    ],
  },
  {
    title: "Activewear",
    items: [
      { label: "High-Rise Leggings", href: "/search?q=leggings" },
      { label: "Running Shorts", href: "/search?q=women+shorts" },
      { label: "Track Pants & Joggers", href: "/search?q=women+pants" },
      { label: "Gym Sets", href: "/search?q=women+sets", badge: "Popular" },
    ],
  },
  {
    title: "Footwear & Gear",
    items: [
      { label: "Road Running Shoes", href: "/search?q=women+shoes" },
      { label: "Trail Runners", href: "/search?q=women+trail" },
      { label: "Recovery Slides", href: "/search?q=slides" },
      { label: "Bags & Accessories", href: "/search?q=women+accessories" },
    ],
  },
];

const MEN_COLUMNS: MegaMenuColumn[] = [
  {
    title: "Tops & Layers",
    items: [
      { label: "Performance Tees", href: "/search?q=men+tee" },
      { label: "Training Tanks", href: "/search?q=men+tank" },
      { label: "Tech Fleece Hoodies", href: "/search?q=men+hoodie", badge: "Warm" },
      { label: "Weatherproof Jackets", href: "/search?q=men+jacket" },
    ],
  },
  {
    title: "Bottoms",
    items: [
      { label: "Compression Tights", href: "/search?q=men+tights" },
      { label: "Lined Running Shorts", href: "/search?q=men+shorts", badge: "Best" },
      { label: "Training Joggers", href: "/search?q=men+joggers" },
      { label: "Cross-Train Shorts", href: "/search?q=men+bottoms" },
    ],
  },
  {
    title: "Footwear & Gear",
    items: [
      { label: "Carbon Marathon Shoes", href: "/search?q=men+shoes", badge: "Pro" },
      { label: "Trail Enduro Grips", href: "/search?q=men+trail" },
      { label: "Athletic Backpacks", href: "/search?q=backpack" },
      { label: "Socks & Headwear", href: "/search?q=men+gear" },
    ],
  },
];

export default async function Header({
  settings = DEFAULT_STORE_SETTINGS,
}: HeaderProps): Promise<React.JSX.Element> {
  const [activeCategories, navigation] = await Promise.all([
    getActiveCategories(),
    getNavigationPages().catch(() => ({ headerPages: [], footerPages: [] })),
  ]);
  const headerPages = (navigation.headerPages || []).filter(
    (hp) => !["about", "contact"].includes(hp.slug)
  );

  return (
    <>
      {/* 1. Top Announcement Bar with rotating messages & phone */}
      <TopAnnouncementBar
        customMessage={settings.showAnnouncement ? settings.announcementText : null}
        phone={settings.contactPhone || "+1 (800) 555-0199"}
      />

      {/* 2. Main Navigation Header (Sticky on scroll) */}
      <header className="sticky top-0 z-40 w-full border-b border-purple-200/70 dark:border-purple-800/50 bg-white/95 dark:bg-[#3C0561]/95 backdrop-blur-md shadow-sm transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sm:gap-4">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#960DF2] to-[#AB3DF5] shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform"
                aria-label="Store Logo"
              >
                <svg
                  className="h-5 w-5 text-white"
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
              <span className="text-base font-black tracking-tight text-[#3C0561] dark:text-[#EACFFC] group-hover:text-[#960DF2] transition-colors">
                {settings.storeName || "ApexStore"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-zinc-700 dark:text-purple-100">
            {/* Home */}
            <Link href="/" className="relative py-2 hover:text-[#960DF2] dark:hover:text-[#C06EF7] transition-colors group">
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#960DF2] group-hover:w-full transition-all duration-200" />
            </Link>

            {/* Shop */}
            <Link href="/shop" className="relative py-2 hover:text-[#960DF2] dark:hover:text-[#C06EF7] transition-colors group">
              <span>Shop</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#960DF2] group-hover:w-full transition-all duration-200" />
            </Link>

            {/* Categories Dropdown */}
            <CategoriesDropdown categories={activeCategories} />

            {/* Women Mega Menu */}
            <MegaMenuDropdown
              label="Women"
              href="/search?q=women"
              columns={WOMEN_COLUMNS}
              promoBanner={{
                tag: "Special Release",
                title: "Velocity Luxe Drop",
                description: "Form-fitting microfiber designed for high impact endurance.",
                ctaLabel: "Shop Women",
                ctaHref: "/search?q=women",
              }}
            />

            {/* Men Mega Menu */}
            <MegaMenuDropdown
              label="Men"
              href="/search?q=men"
              columns={MEN_COLUMNS}
              promoBanner={{
                tag: "Top Rated",
                title: "Carbon Plate Runners",
                description: "32% energy return on marathon courses. Limited stock.",
                ctaLabel: "Shop Men",
                ctaHref: "/search?q=men",
              }}
            />

            {/* Accessories */}
            <Link href="/search?q=accessories" className="relative py-2 hover:text-[#960DF2] dark:hover:text-[#C06EF7] transition-colors group">
              <span>Accessories</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#960DF2] group-hover:w-full transition-all duration-200" />
            </Link>

            {/* Dynamic Custom Header Pages */}
            {headerPages.map((hp) => (
              <Link
                key={hp.slug}
                href={hp.href}
                className="relative py-2 hover:text-[#960DF2] dark:hover:text-[#C06EF7] transition-colors group"
              >
                <span>{hp.title}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#960DF2] group-hover:w-full transition-all duration-200" />
              </Link>
            ))}

            {/* Blog / Story */}
            <Link href="/about" className="relative py-2 hover:text-[#960DF2] dark:hover:text-[#C06EF7] transition-colors group">
              <span>Blog</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#960DF2] group-hover:w-full transition-all duration-200" />
            </Link>

            {/* Contact */}
            <Link href="/contact" className="relative py-2 hover:text-[#960DF2] dark:hover:text-[#C06EF7] transition-colors group">
              <span>Contact</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#960DF2] group-hover:w-full transition-all duration-200" />
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-1 sm:mx-2">
            <HeaderSearch />
          </div>

          {/* Navigation Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Wishlist Button */}
            <WishlistNavButton />

            {/* Cart Button */}
            <CartNavButton />

            {/* Notification Bell */}
            <NotificationNavButton />

            {/* Account Profile / Dropdown */}
            <AccountNavButton />

            {/* Dark / Light Theme Toggle Switch */}
            <ThemeToggle storageKey="apex_theme" />

            {/* Mobile menu toggle & drawer */}
            <MobileNav categories={activeCategories} />
          </div>
        </div>
      </header>

      {/* 3. Sub-Navigation Bar */}
      <SubNavBar />
    </>
  );
}

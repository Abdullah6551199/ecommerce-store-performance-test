"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CategoryRecord } from "@/lib/categories";

interface MobileNavProps {
  navLinks?: Array<{ label: string; url: string }>;
  categories?: CategoryRecord[];
}

/**
 * Mobile Navigation Drawer with Accordion Menus and Purple Brand Styling.
 */
export default function MobileNav({
  categories = [],
}: MobileNavProps): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [womenExpanded, setWomenExpanded] = useState(false);
  const [menExpanded, setMenExpanded] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setCategoriesExpanded(false);
    setWomenExpanded(false);
    setMenExpanded(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-[#E4E4E7]/60 dark:border-zinc-800/60 bg-white/50 dark:bg-[#15803D]/50 text-[#18181B] dark:text-zinc-200 hover:text-[#25D366] transition-colors shadow-sm"
        aria-label="Toggle Navigation Menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 lg:hidden border-b border-[#E4E4E7] dark:border-zinc-800/60 bg-[#DCFCE7]/98 dark:bg-[#18181B]/98 backdrop-blur-xl px-4 py-4 space-y-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. Home */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-[#18181B] dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-white/60 dark:hover:bg-[#15803D]/60 transition"
          >
            Home
          </Link>

          {/* 2. Shop */}
          <Link
            href="/shop"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-[#18181B] dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-white/60 dark:hover:bg-[#15803D]/60 transition"
          >
            Shop All Products
          </Link>

          {/* Bundles */}
          <Link
            href="/bundles"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center justify-between px-3 py-2 text-sm font-semibold text-[#18181B] dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-white/60 dark:hover:bg-[#15803D]/60 transition"
          >
            <span>Product Bundles</span>
            <span className="rounded-full bg-[#25D366] text-[10px] text-white px-2 py-0.5 font-bold">Save</span>
          </Link>

          {/* 3. Categories Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setCategoriesExpanded((prev) => !prev)}
              className="flex w-full min-h-[42px] items-center justify-between px-3 py-2 text-sm font-semibold text-[#18181B] dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-white/60 dark:hover:bg-[#15803D]/60 transition"
            >
              <span>Categories</span>
              <svg
                className={`w-4 h-4 transition-transform ${categoriesExpanded ? "rotate-180 text-[#25D366]" : "text-zinc-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoriesExpanded && (
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-[#E4E4E7] dark:border-zinc-800 ml-3 mt-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={closeMenu}
                    className="flex min-h-[36px] items-center px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#25D366] rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#15803D]/40 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/shop"
                  onClick={closeMenu}
                  className="flex min-h-[36px] items-center px-3 py-1.5 text-xs font-bold text-[#25D366] dark:text-[#DCFCE7] rounded-lg transition"
                >
                  View All Categories &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* 4. Women Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setWomenExpanded((prev) => !prev)}
              className="flex w-full min-h-[42px] items-center justify-between px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#15803D]/60 transition"
            >
              <span>Women</span>
              <svg
                className={`w-4 h-4 transition-transform ${womenExpanded ? "rotate-180 text-[#25D366]" : "text-zinc-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {womenExpanded && (
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-[#E4E4E7] dark:border-zinc-800 ml-3 mt-1">
                <Link href="/search?q=women+top" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#25D366]">
                  Tops &amp; Tees
                </Link>
                <Link href="/search?q=leggings" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#25D366]">
                  Leggings &amp; Tights
                </Link>
                <Link href="/search?q=women+shoes" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#25D366]">
                  Running Shoes
                </Link>
                <Link href="/search?q=women" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-bold text-[#25D366] dark:text-[#DCFCE7]">
                  Shop All Women &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* 5. Men Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setMenExpanded((prev) => !prev)}
              className="flex w-full min-h-[42px] items-center justify-between px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#15803D]/60 transition"
            >
              <span>Men</span>
              <svg
                className={`w-4 h-4 transition-transform ${menExpanded ? "rotate-180 text-[#25D366]" : "text-zinc-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menExpanded && (
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-[#E4E4E7] dark:border-zinc-800 ml-3 mt-1">
                <Link href="/search?q=men+tee" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#25D366]">
                  Performance Tees
                </Link>
                <Link href="/search?q=men+shorts" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#25D366]">
                  Running Shorts
                </Link>
                <Link href="/search?q=men+shoes" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#25D366]">
                  Athletic Shoes
                </Link>
                <Link href="/search?q=men" onClick={closeMenu} className="block px-3 py-1.5 text-xs font-bold text-[#25D366] dark:text-[#DCFCE7]">
                  Shop All Men &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* 6. Accessories */}
          <Link
            href="/search?q=accessories"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#15803D]/60 transition"
          >
            Accessories
          </Link>

          {/* 7. Blog / About */}
          <Link
            href="/about"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#15803D]/60 transition"
          >
            Blog &amp; Story
          </Link>

          {/* 8. Contact */}
          <Link
            href="/contact"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-200 hover:text-[#25D366] rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#15803D]/60 transition"
          >
            Contact
          </Link>

          <div className="pt-3 border-t border-[#E4E4E7] dark:border-zinc-800/60 space-y-1">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              onClick={closeMenu}
              className="flex min-h-[40px] items-center px-3 py-2 text-xs font-semibold text-[#25D366] dark:text-zinc-400 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/40 transition"
            >
              ❤️ My Wishlist
            </Link>

            {/* Notifications */}
            <Link
              href="/account/notifications"
              onClick={closeMenu}
              className="flex min-h-[40px] items-center px-3 py-2 text-xs font-semibold text-[#25D366] dark:text-zinc-400 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/40 transition"
            >
              🔔 Notifications
            </Link>

            {/* Account */}
            <Link
              href="/account"
              onClick={closeMenu}
              className="flex min-h-[40px] items-center px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/40 transition"
            >
              👤 My Account / Login
            </Link>

            {/* Admin */}
            <Link
              href="/admin/products"
              prefetch={false}
              onClick={closeMenu}
              className="flex min-h-[40px] items-center px-3 py-2 text-xs font-bold text-[#25D366] dark:text-[#1EA855] rounded-xl hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B]/40 transition"
            >
              ⚡ Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

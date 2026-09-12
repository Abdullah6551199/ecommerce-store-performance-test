"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CategoryRecord } from "@/lib/categories";

interface MobileNavProps {
  navLinks?: Array<{ label: string; url: string }>;
  categories?: CategoryRecord[];
}

/**
 * Stage 15 Mobile Navigation with Accordion Category Menu and Dedicated Pages Links.
 */
export default function MobileNav({
  categories = [],
}: MobileNavProps): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setCategoriesExpanded(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-white"
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
        <div className="absolute top-16 left-0 right-0 md:hidden border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#080e0a]/95 backdrop-blur-xl px-4 py-4 space-y-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. Home */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-white hover:text-[#18C729] rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition"
          >
            Home
          </Link>

          {/* 2. Shop */}
          <Link
            href="/shop"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-white hover:text-[#18C729] rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition"
          >
            Shop All Products
          </Link>

          {/* 3. Categories Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setCategoriesExpanded((prev) => !prev)}
              className="flex w-full min-h-[42px] items-center justify-between px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-white hover:text-[#18C729] rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition"
            >
              <span>Categories</span>
              <svg
                className={`w-4 h-4 transition-transform ${categoriesExpanded ? "rotate-180 text-[#18C729]" : "text-zinc-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {categoriesExpanded && (
              <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-zinc-200 dark:border-white/10 ml-3 mt-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={closeMenu}
                    className="flex min-h-[36px] items-center px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#18C729] rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/shop"
                  onClick={closeMenu}
                  className="flex min-h-[36px] items-center px-3 py-1.5 text-xs font-bold text-[#18C729] rounded-lg transition"
                >
                  View All Categories &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* 4. About */}
          <Link
            href="/about"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-white hover:text-[#18C729] rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition"
          >
            About Us
          </Link>

          {/* 5. Contact */}
          <Link
            href="/contact"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-white hover:text-[#18C729] rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition"
          >
            Contact
          </Link>

          {/* 6. FAQ */}
          <Link
            href="/faq"
            onClick={closeMenu}
            className="flex min-h-[42px] items-center px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-white hover:text-[#18C729] rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition"
          >
            FAQ & Support
          </Link>

          <div className="pt-2 border-t border-zinc-200 dark:border-white/10 space-y-1">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              onClick={closeMenu}
              className="flex min-h-[40px] items-center px-3 py-2 text-xs font-semibold text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
            >
              My Wishlist
            </Link>

            {/* Account */}
            <Link
              href="/account"
              onClick={closeMenu}
              className="flex min-h-[40px] items-center px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition"
            >
              My Account / Login
            </Link>

            {/* Admin */}
            <Link
              href="/admin/products"
              prefetch={false}
              onClick={closeMenu}
              className="flex min-h-[40px] items-center px-3 py-2 text-xs font-bold text-indigo-600 dark:text-[#FEF500] rounded-xl hover:bg-indigo-50 dark:hover:bg-white/5 transition"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

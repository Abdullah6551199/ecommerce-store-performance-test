"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/lib/settings";
import { useCart } from "@/components/CartContext";

interface HeaderProps {
  settings?: StoreSettings;
}

/**
 * Dynamic Storefront Header Component
 * Fully bound to Cloudflare D1 settings with search bar, announcement bar,
 * dynamic logo, dynamic navigation, and Stage 9 Cart integration.
 */
export default function Header({ settings = DEFAULT_STORE_SETTINGS }: HeaderProps): React.JSX.Element {
  const router = useRouter();
  const { itemCount, openDrawer } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const navLinks = settings.headerNav && settings.headerNav.length > 0
    ? settings.headerNav
    : DEFAULT_STORE_SETTINGS.headerNav;

  return (
    <>
      {/* 1. Optional Top Announcement Bar */}
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

      {/* 2. Main Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel backdrop-blur-md bg-[#080e0a]/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
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

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name, SKU, brand..."
                className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729] transition-all"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Navigation Links & Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Desktop Navigation from Settings */}
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

            {/* Account Icon (Placeholder) */}
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

            {/* Cart Button & View Cart Trigger */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={openDrawer}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:scale-105 hover:border-[#18C729]/50 hover:bg-[#18C729]/10 cursor-pointer"
                aria-label="Open Shopping Cart"
                title={`Shopping Cart (${itemCount} items)`}
              >
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-[#18C729] to-[#FEF500] text-[10px] font-black text-black shadow-md animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={openDrawer}
                className="text-[10px] font-bold text-white/60 hover:text-[#18C729] mt-0.5 tracking-tight transition-colors cursor-pointer"
                title="View Cart Drawer"
              >
                View Cart
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
              aria-label="Toggle Navigation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#080e0a] px-4 py-3 space-y-2">
            {navLinks.map((item, idx) => (
              <Link
                key={`mob-${item.url}-${idx}`}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-semibold text-white/80 hover:text-[#18C729]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs font-semibold text-[#FEF500]"
            >
              Admin Portal
            </Link>
          </div>
        )}
      </header>
    </>
  );
}

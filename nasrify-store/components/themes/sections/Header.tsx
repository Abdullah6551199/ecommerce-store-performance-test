"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import { useCart } from "@/components/CartContext";

export interface HeaderMenuItem {
  label: string;
  url: string;
}

export interface HeaderSettings {
  logo_url?: string;
  logo_text?: string;
  menu_items?: HeaderMenuItem[];
  show_search?: boolean;
  show_cart?: boolean;
  show_account?: boolean;
  sticky?: boolean;
}

export default function Header({
  variant = "classic",
  settings = {},
  themeSettings,
}: SectionProps<HeaderSettings>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  const logoText = settings.logo_text || "Nasrify";
  const logoUrl = settings.logo_url;
  const menuItems = settings.menu_items?.length
    ? settings.menu_items
    : [
        { label: "Shop", url: "/shop" },
        { label: "Categories", url: "/#categories" },
        { label: "About", url: "/about" },
        { label: "Contact", url: "/contact" },
      ];

  const showSearch = settings.show_search !== false;
  const showCart = settings.show_cart !== false;
  const showAccount = settings.show_account !== false;
  const isSticky = settings.sticky !== false;

  const headerClass = `w-full bg-[var(--theme-background,#FFFFFF)] border-b border-[var(--theme-border,#E4E4E7)] transition-all z-30 ${
    isSticky ? "sticky top-0 shadow-xs backdrop-blur-md bg-opacity-95" : "relative"
  }`;

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between h-16 sm:h-20 ${
            variant === "centered" ? "relative" : ""
          }`}
        >
          {/* Mobile hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-surface,#F4F4F5)] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Logo */}
          <div
            className={`flex items-center ${
              variant === "centered" ? "lg:absolute lg:left-1/2 lg:-translate-x-1/2" : ""
            }`}
          >
            <Link href="/" className="flex items-center gap-2 group">
              {logoUrl ? (
                <div className="relative h-9 w-32">
                  <Image
                    src={logoUrl}
                    alt={logoText}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
              ) : (
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[var(--theme-text,#18181B)] group-hover:text-[var(--theme-accent,#2563EB)] transition-colors font-[family-name:var(--theme-font-heading)]">
                  {logoText}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          {variant !== "minimal" && (
            <nav
              aria-label="Main Navigation"
              className={`hidden lg:flex items-center gap-8 ${
                variant === "centered" ? "mr-auto" : "mx-8"
              }`}
            >
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url}
                  className="text-sm font-medium text-[var(--theme-text-muted,#71717A)] hover:text-[var(--theme-text,#18181B)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {showSearch && (
              <Link
                href="/search"
                className="p-2 text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] hover:bg-[var(--theme-surface,#F4F4F5)] rounded-full transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </Link>
            )}

            {showAccount && (
              <Link
                href="/account"
                className="p-2 text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] hover:bg-[var(--theme-surface,#F4F4F5)] rounded-full transition-colors"
                aria-label="My Account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            )}

            {showCart && (
              <Link
                href="/cart"
                className="relative p-2 text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] hover:bg-[var(--theme-surface,#F4F4F5)] rounded-full transition-colors"
                aria-label="Cart"
                title={`Shopping Cart (${itemCount} items)`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--theme-accent,#2563EB)] text-[10px] font-bold text-white shadow-xs animate-in zoom-in-75">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 text-base font-medium rounded-lg text-[var(--theme-text,#18181B)] hover:bg-[var(--theme-surface,#F4F4F5)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";

export interface PageTypeItem {
  id: string;
  name: string;
  icon: string;
  group: "Core" | "Commerce" | "Content" | "Dynamic";
  urlParam: string;
}

export const BUILT_IN_PAGES: PageTypeItem[] = [
  // Core
  { id: "homepage", name: "Homepage", icon: "🏠", group: "Core", urlParam: "homepage" },

  // Commerce
  { id: "shop", name: "Shop / Catalog", icon: "🛍️", group: "Commerce", urlParam: "shop" },
  { id: "product", name: "Product Page", icon: "🏷️", group: "Commerce", urlParam: "product" },
  { id: "category", name: "Category Page", icon: "📁", group: "Commerce", urlParam: "category" },
  { id: "cart", name: "Cart", icon: "🛒", group: "Commerce", urlParam: "cart" },
  { id: "checkout", name: "Checkout", icon: "💳", group: "Commerce", urlParam: "checkout" },
  { id: "order_success", name: "Order Success", icon: "✅", group: "Commerce", urlParam: "order_success" },
  { id: "bundles", name: "Bundles", icon: "📦", group: "Commerce", urlParam: "bundles" },
  { id: "wishlist", name: "Wishlist", icon: "❤️", group: "Commerce", urlParam: "wishlist" },
  { id: "compare", name: "Compare", icon: "⚖️", group: "Commerce", urlParam: "compare" },
  { id: "track_order", name: "Track Order", icon: "🚚", group: "Commerce", urlParam: "track_order" },

  // Content
  { id: "account", name: "Customer Account", icon: "👤", group: "Content", urlParam: "account" },
  { id: "custom_page", name: "Page Template", icon: "📄", group: "Content", urlParam: "custom_page" },
];

interface PageSwitcherProps {
  activePageType: string;
  onSelectPage: (pageType: string) => void;
  cmsPages?: Array<{ id: string; slug: string; title: string }>;
  isLoadingPages?: boolean;
}

export function PageSwitcher({
  activePageType,
  onSelectPage,
  cmsPages = [],
  isLoadingPages = false,
}: PageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Combine built-in pages with dynamic CMS pages
  const dynamicPageItems: PageTypeItem[] = cmsPages.map((p) => ({
    id: `page_${p.slug}`,
    name: p.title || p.slug,
    icon: "📝",
    group: "Dynamic",
    urlParam: `page_${p.slug}`,
  }));

  const allPages = [...BUILT_IN_PAGES, ...dynamicPageItems];

  const activeItem =
    allPages.find((p) => p.id === activePageType || p.urlParam === activePageType) ||
    BUILT_IN_PAGES[0];

  const filteredPages = search.trim()
    ? allPages.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase())
      )
    : allPages;

  const groups: Array<"Core" | "Commerce" | "Content" | "Dynamic"> = [
    "Core",
    "Commerce",
    "Content",
    "Dynamic",
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-xs cursor-pointer group"
        title="Switch page to edit"
      >
        <span className="text-sm">{activeItem.icon}</span>
        <span className="font-semibold text-slate-100">{activeItem.name}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-2.5 border-b border-slate-800/80 bg-slate-950/60">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">
              Currently editing: <span className="text-emerald-400 font-bold">{activeItem.name}</span>
            </div>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#25D366]"
              autoFocus
            />
          </div>

          {/* Grouped Page Items */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-2">
            {groups.map((group) => {
              const items = filteredPages.filter((p) => p.group === group);
              if (items.length === 0) return null;

              return (
                <div key={group} className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {group === "Dynamic" ? "Dynamic (CMS Pages)" : group}
                  </div>
                  {items.map((item) => {
                    const isSelected =
                      item.id === activePageType || item.urlParam === activePageType;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectPage(item.id);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#25D366]/15 text-[#25D366] font-semibold border-l-2 border-[#25D366]"
                            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{item.icon}</span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-[#25D366] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {filteredPages.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-500">
                No matching page found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

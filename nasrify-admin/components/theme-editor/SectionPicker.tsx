"use client";

import React, { useState } from "react";

export interface SectionPickerOption {
  type: string;
  name: string;
  category: "Content" | "Products" | "Marketing" | "Commerce";
  description: string;
  icon: string;
}

export const SECTION_OPTIONS: SectionPickerOption[] = [
  // Content
  {
    type: "announcement",
    name: "Announcement Bar",
    category: "Content",
    description: "Top promotional banner with link, custom colors, and dismiss toggle.",
    icon: "📢",
  },
  {
    type: "header",
    name: "Header Navigation",
    category: "Content",
    description: "Store navigation bar with logo, menu links, and sticky support.",
    icon: "🧭",
  },
  {
    type: "hero",
    name: "Hero Banner",
    category: "Content",
    description: "High-impact visual banner with headline, call to action, and image.",
    icon: "🌟",
  },
  {
    type: "image_text",
    name: "Image with Text",
    category: "Content",
    description: "Editorial split layout pairing narrative brand copy with imagery.",
    icon: "🖼️",
  },
  {
    type: "banner",
    name: "Promotional Banner",
    category: "Content",
    description: "Full-width or boxed promo callout with background imagery and button.",
    icon: "🎯",
  },
  {
    type: "faq",
    name: "FAQ Accordion",
    category: "Content",
    description: "Interactive accordion answering frequently asked shopper questions.",
    icon: "❓",
  },
  {
    type: "footer",
    name: "Store Footer",
    category: "Content",
    description: "Site-wide footer containing column links, social profiles, and copyright.",
    icon: "⚓",
  },
  {
    type: "page_header",
    name: "Page Header",
    category: "Content",
    description: "Title banner with breadcrumb navigation for generic and CMS pages.",
    icon: "📄",
  },
  {
    type: "page_content",
    name: "Page Content",
    category: "Content",
    description: "Rich text and HTML content block rendering CMS page body.",
    icon: "📝",
  },

  // Products
  {
    type: "product_grid",
    name: "Product Grid",
    category: "Products",
    description: "Responsive grid of curated store items with prices and direct add-to-cart.",
    icon: "🛍️",
  },
  {
    type: "product_carousel",
    name: "Product Carousel",
    category: "Products",
    description: "Horizontally swipeable showcase of featured or trending items.",
    icon: "🎠",
  },
  {
    type: "categories",
    name: "Categories Showcase",
    category: "Products",
    description: "Browse collections by category with badge or circular card layouts.",
    icon: "🏷️",
  },
  {
    type: "product_gallery",
    name: "Product Gallery",
    category: "Products",
    description: "Multi-image high-resolution thumbnail gallery for PDP.",
    icon: "🖼️",
  },
  {
    type: "product_info",
    name: "Product Buy Box",
    category: "Products",
    description: "Title, pricing, variant pickers, and primary Add to Cart actions.",
    icon: "🏷️",
  },
  {
    type: "product_tabs",
    name: "Product Tabs",
    category: "Products",
    description: "Detailed tabs for description, specifications, and shipping policies.",
    icon: "📑",
  },
  {
    type: "product_reviews_section",
    name: "Product Reviews",
    category: "Products",
    description: "Customer ratings list with star summary and submission form.",
    icon: "⭐",
  },
  {
    type: "product_related",
    name: "Related Products",
    category: "Products",
    description: "Algorithmically recommended similar or cross-sell products.",
    icon: "🔄",
  },
  {
    type: "category_header",
    name: "Category Header",
    category: "Products",
    description: "Collection hero banner with category title, image, and description.",
    icon: "🗂️",
  },
  {
    type: "category_filters",
    name: "Category Filters",
    category: "Products",
    description: "Sidebar or horizontal attribute filters (price, color, brand).",
    icon: "🎛️",
  },
  {
    type: "category_grid",
    name: "Category Catalog Grid",
    category: "Products",
    description: "Paginated product catalog grid matching active collection filters.",
    icon: "📦",
  },

  // Marketing
  {
    type: "testimonials",
    name: "Customer Testimonials",
    category: "Marketing",
    description: "Social proof cards showcasing real customer quotes and ratings.",
    icon: "💬",
  },
  {
    type: "newsletter",
    name: "Newsletter Signup",
    category: "Marketing",
    description: "Email capture block offering discount incentives for subscribers.",
    icon: "✉️",
  },

  // Commerce
  {
    type: "cart_page_layout",
    name: "Cart Layout",
    category: "Commerce",
    description: "Full cart page layout with item lines, order notes, and checkout CTA.",
    icon: "🛒",
  },
  {
    type: "checkout_page_layout",
    name: "Checkout Layout",
    category: "Commerce",
    description: "Two-column frictionless checkout with customer shipping and payment.",
    icon: "💳",
  },
  {
    type: "account_dashboard",
    name: "Customer Account",
    category: "Commerce",
    description: "Account profile, past orders history, and address book portal.",
    icon: "👤",
  },
];

/**
 * 200x120 SVG Wireframe Thumbnail Generator for each section type
 */
function SectionThumbnail({ type }: { type: string }) {
  switch (type) {
    case "hero":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="0" y="0" width="200" height="120" fill="#0f172a" />
          <circle cx="160" cy="50" r="30" fill="#1e293b" />
          <rect x="20" y="32" width="110" height="14" rx="3" fill="#25D366" />
          <rect x="20" y="52" width="85" height="8" rx="2" fill="#64748b" />
          <rect x="20" y="65" width="60" height="8" rx="2" fill="#475569" />
          <rect x="20" y="82" width="45" height="16" rx="4" fill="#25D366" />
        </svg>
      );
    case "product_grid":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="15" y="15" width="38" height="42" rx="4" fill="#1e293b" />
          <rect x="15" y="62" width="28" height="5" rx="1" fill="#94a3b8" />
          <rect x="15" y="70" width="18" height="5" rx="1" fill="#25D366" />

          <rect x="60" y="15" width="38" height="42" rx="4" fill="#1e293b" />
          <rect x="60" y="62" width="28" height="5" rx="1" fill="#94a3b8" />
          <rect x="60" y="70" width="18" height="5" rx="1" fill="#25D366" />

          <rect x="105" y="15" width="38" height="42" rx="4" fill="#1e293b" />
          <rect x="105" y="62" width="28" height="5" rx="1" fill="#94a3b8" />
          <rect x="105" y="70" width="18" height="5" rx="1" fill="#25D366" />

          <rect x="150" y="15" width="38" height="42" rx="4" fill="#1e293b" />
          <rect x="150" y="62" width="28" height="5" rx="1" fill="#94a3b8" />
          <rect x="150" y="70" width="18" height="5" rx="1" fill="#25D366" />
        </svg>
      );
    case "product_carousel":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="20" y="20" width="45" height="50" rx="4" fill="#1e293b" />
          <rect x="20" y="75" width="30" height="6" rx="1" fill="#94a3b8" />
          <rect x="75" y="20" width="45" height="50" rx="4" fill="#1e293b" />
          <rect x="75" y="75" width="30" height="6" rx="1" fill="#94a3b8" />
          <rect x="130" y="20" width="45" height="50" rx="4" fill="#1e293b" />
          <rect x="130" y="75" width="30" height="6" rx="1" fill="#94a3b8" />
          <circle cx="188" cy="45" r="8" fill="#334155" />
          <path d="M186 42l4 3-4 3" stroke="#fff" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "announcement":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="10" y="15" width="180" height="24" rx="4" fill="#18181b" stroke="#334155" strokeWidth="1" />
          <rect x="50" y="24" width="100" height="6" rx="2" fill="#25D366" />
          <rect x="20" y="60" width="160" height="35" rx="4" fill="#0f172a" />
        </svg>
      );
    case "banner":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="15" y="20" width="170" height="80" rx="6" fill="#1e293b" />
          <rect x="30" y="42" width="70" height="12" rx="2" fill="#fff" />
          <rect x="30" y="58" width="50" height="6" rx="1" fill="#94a3b8" />
          <rect x="30" y="72" width="35" height="14" rx="3" fill="#25D366" />
          <circle cx="150" cy="60" r="22" fill="#334155" />
        </svg>
      );
    case "image_text":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="15" y="20" width="80" height="80" rx="5" fill="#1e293b" />
          <rect x="105" y="30" width="75" height="12" rx="2" fill="#fff" />
          <rect x="105" y="48" width="65" height="6" rx="1" fill="#64748b" />
          <rect x="105" y="58" width="75" height="6" rx="1" fill="#64748b" />
          <rect x="105" y="68" width="45" height="6" rx="1" fill="#64748b" />
          <rect x="105" y="82" width="38" height="14" rx="3" fill="#25D366" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <circle cx="40" cy="50" r="22" fill="#1e293b" />
          <rect x="25" y="78" width="30" height="6" rx="1" fill="#94a3b8" />

          <circle cx="100" cy="50" r="22" fill="#1e293b" />
          <rect x="85" y="78" width="30" height="6" rx="1" fill="#94a3b8" />

          <circle cx="160" cy="50" r="22" fill="#1e293b" />
          <rect x="145" y="78" width="30" height="6" rx="1" fill="#94a3b8" />
        </svg>
      );
    case "testimonials":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="15" y="25" width="50" height="70" rx="4" fill="#1e293b" />
          <rect x="22" y="35" width="30" height="4" rx="1" fill="#25D366" />
          <rect x="22" y="45" width="36" height="4" rx="1" fill="#64748b" />
          <circle cx="30" cy="75" r="6" fill="#475569" />

          <rect x="75" y="25" width="50" height="70" rx="4" fill="#1e293b" />
          <rect x="82" y="35" width="30" height="4" rx="1" fill="#25D366" />
          <rect x="82" y="45" width="36" height="4" rx="1" fill="#64748b" />
          <circle cx="90" cy="75" r="6" fill="#475569" />

          <rect x="135" y="25" width="50" height="70" rx="4" fill="#1e293b" />
          <rect x="142" y="35" width="30" height="4" rx="1" fill="#25D366" />
          <rect x="142" y="45" width="36" height="4" rx="1" fill="#64748b" />
          <circle cx="150" cy="75" r="6" fill="#475569" />
        </svg>
      );
    case "faq":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="20" y="20" width="160" height="22" rx="4" fill="#1e293b" />
          <rect x="30" y="28" width="80" height="6" rx="1" fill="#e2e8f0" />
          <rect x="20" y="48" width="160" height="22" rx="4" fill="#1e293b" />
          <rect x="30" y="56" width="90" height="6" rx="1" fill="#e2e8f0" />
          <rect x="20" y="76" width="160" height="22" rx="4" fill="#1e293b" />
          <rect x="30" y="84" width="70" height="6" rx="1" fill="#e2e8f0" />
        </svg>
      );
    case "newsletter":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="15" y="20" width="170" height="80" rx="6" fill="#18181b" stroke="#334155" strokeWidth="1" />
          <rect x="40" y="36" width="120" height="10" rx="2" fill="#fff" />
          <rect x="40" y="58" width="85" height="20" rx="3" fill="#0f172a" stroke="#334155" />
          <rect x="130" y="58" width="30" height="20" rx="3" fill="#25D366" />
        </svg>
      );
    case "footer":
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="10" y="15" width="180" height="90" rx="4" fill="#0f172a" />
          <rect x="25" y="30" width="30" height="8" rx="1" fill="#fff" />
          <rect x="25" y="44" width="22" height="4" rx="1" fill="#64748b" />
          <rect x="25" y="52" width="25" height="4" rx="1" fill="#64748b" />

          <rect x="68" y="30" width="30" height="8" rx="1" fill="#fff" />
          <rect x="68" y="44" width="24" height="4" rx="1" fill="#64748b" />
          <rect x="68" y="52" width="20" height="4" rx="1" fill="#64748b" />

          <rect x="110" y="30" width="30" height="8" rx="1" fill="#fff" />
          <rect x="110" y="44" width="26" height="4" rx="1" fill="#64748b" />
          <rect x="110" y="52" width="22" height="4" rx="1" fill="#64748b" />

          <rect x="150" y="30" width="30" height="8" rx="1" fill="#fff" />
          <rect x="150" y="44" width="25" height="4" rx="1" fill="#64748b" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 120" className="w-full h-full bg-slate-950">
          <rect x="20" y="20" width="160" height="80" rx="4" fill="#1e293b" />
          <rect x="35" y="35" width="60" height="10" rx="2" fill="#25D366" />
          <rect x="35" y="52" width="120" height="6" rx="1" fill="#64748b" />
          <rect x="35" y="64" width="90" height="6" rx="1" fill="#64748b" />
        </svg>
      );
  }
}

interface SectionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (type: string) => void;
}

export function SectionPicker({
  isOpen,
  onClose,
  onSelectSection,
}: SectionPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const categories = ["All", "Content", "Products", "Marketing", "Commerce"];

  const filteredSections = SECTION_OPTIONS.filter((sec) => {
    const matchesCategory =
      selectedCategory === "All" || sec.category === selectedCategory;
    const matchesSearch =
      sec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-sm">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>📚</span> Section Library
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a section component with pre-configured layouts to add to your theme.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/50 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#25D366] text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-[#25D366]"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-2.5 top-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 3-Column Section Grid with Thumbnails */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSections.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <span className="text-2xl">🔍</span>
              <p>No matching sections found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSections.map((sec) => (
                <div
                  key={sec.type}
                  onClick={() => {
                    onSelectSection(sec.type);
                    onClose();
                  }}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-[#25D366]/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col"
                >
                  {/* Thumbnail Mockup */}
                  <div className="h-32 w-full border-b border-slate-800/80 overflow-hidden relative">
                    <SectionThumbnail type={sec.type} />
                    <span className="absolute top-2 left-2 text-xs p-1 rounded-md bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 shadow-xs">
                      {sec.icon}
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 text-slate-400">
                      {sec.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {sec.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sec.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500 group-hover:text-[#25D366] transition-colors">
                      <span>Add Section</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

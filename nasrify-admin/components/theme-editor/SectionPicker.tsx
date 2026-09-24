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
    description: "Image gallery with thumbnails, multiple view layouts, and zoom.",
    icon: "🖼️",
  },
  {
    type: "product_info",
    name: "Product Info",
    category: "Products",
    description: "Title, price, SKU, variant selector, quantity, and add to cart CTA.",
    icon: "🏷️",
  },
  {
    type: "product_tabs",
    name: "Product Tabs",
    category: "Products",
    description: "Multi-tab interface or accordion for specs, description, and shipping.",
    icon: "📑",
  },
  {
    type: "product_reviews_section",
    name: "Product Reviews",
    category: "Products",
    description: "Ratings summary, customer reviews showcase, and feedback submission.",
    icon: "⭐",
  },
  {
    type: "product_related",
    name: "Related Products",
    category: "Products",
    description: "Cross-sell grid or carousel of complementary store items.",
    icon: "🔄",
  },
  {
    type: "category_header",
    name: "Category Header",
    category: "Products",
    description: "Collection title, description banner, and breadcrumbs.",
    icon: "🗂️",
  },
  {
    type: "category_filters",
    name: "Category Filters",
    category: "Products",
    description: "Sidebar or horizontal filters for collections, price range, and stock.",
    icon: "🎛️",
  },
  {
    type: "category_grid",
    name: "Category Grid",
    category: "Products",
    description: "Paginated product catalog grid with responsive column layout.",
    icon: "📦",
  },

  // Marketing
  {
    type: "testimonials",
    name: "Customer Testimonials",
    category: "Marketing",
    description: "Social proof cards displaying real reviews, customer roles, and avatars.",
    icon: "💬",
  },
  {
    type: "newsletter",
    name: "Newsletter Signup",
    category: "Marketing",
    description: "Lead capture section with custom heading, email input, and button.",
    icon: "✉️",
  },

  // Commerce
  {
    type: "cart_page_layout",
    name: "Cart Page Layout",
    category: "Commerce",
    description: "Shopping cart table with line items, quantity, coupon code, and summary.",
    icon: "🛒",
  },
  {
    type: "checkout_page_layout",
    name: "Checkout Page Layout",
    category: "Commerce",
    description: "Customer shipping details, order notes, payment options, and summary.",
    icon: "💳",
  },
  {
    type: "account_dashboard",
    name: "Account Dashboard",
    category: "Commerce",
    description: "Customer profile, recent order history, and saved address cards.",
    icon: "👤",
  },
];

interface SectionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (type: string) => void;
}

export function SectionPicker({ isOpen, onClose, onSelectSection }: SectionPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  if (!isOpen) return null;

  const categories = ["All", "Content", "Products", "Marketing", "Commerce"];

  const filteredSections = SECTION_OPTIONS.filter((sec) => {
    const matchesCategory = selectedCategory === "All" || sec.category === selectedCategory;
    const matchesSearch =
      sec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Add a Section</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select from all 24 built-in theme framework sections
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sections (e.g. Gallery, Cart, Hero)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sections Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {filteredSections.map((sec) => (
            <button
              key={sec.type}
              type="button"
              onClick={() => {
                onSelectSection(sec.type);
                onClose();
              }}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 transition-all text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-lg shrink-0 transition-colors">
                {sec.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {sec.name}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase font-mono">
                    {sec.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sec.description}
                </p>
              </div>
            </button>
          ))}

          {filteredSections.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No sections found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";

export interface SectionPickerOption {
  type: string;
  name: string;
  category: "Content" | "Products" | "Marketing" | "Utility";
  description: string;
  icon: string;
}

const SECTION_OPTIONS: SectionPickerOption[] = [
  {
    type: "announcement_bar",
    name: "Announcement Bar",
    category: "Utility",
    description: "Top promotional banner with link, custom colors, and dismiss toggle.",
    icon: "📢",
  },
  {
    type: "header",
    name: "Header Navigation",
    category: "Utility",
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
  {
    type: "banner",
    name: "Promotional Banner",
    category: "Marketing",
    description: "Full-width or boxed promo callout with background imagery and button.",
    icon: "🎯",
  },
  {
    type: "image_text",
    name: "Image with Text",
    category: "Content",
    description: "Editorial split layout pairing narrative brand copy with imagery.",
    icon: "🖼️",
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
    category: "Utility",
    description: "Site-wide footer containing column links, social profiles, and copyright.",
    icon: "⚓",
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

  const categories = ["All", "Content", "Products", "Marketing", "Utility"];

  const filteredSections = SECTION_OPTIONS.filter((sec) => {
    const matchesCategory = selectedCategory === "All" || sec.category === selectedCategory;
    const matchesSearch =
      sec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sec.description.toLowerCase().includes(searchTerm.toLowerCase());
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
              Select from the 12 built-in theme framework sections
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

        {/* Filter bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Sections Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 custom-scrollbar">
          {filteredSections.map((sec) => (
            <div
              key={sec.type}
              onClick={() => {
                onSelectSection(sec.type);
                onClose();
              }}
              className="p-3.5 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all duration-150 flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                {sec.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {sec.name}
                  </h4>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {sec.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sec.description}
                </p>
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="col-span-2 text-center py-8 text-xs text-slate-500">
              No matching sections found for &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

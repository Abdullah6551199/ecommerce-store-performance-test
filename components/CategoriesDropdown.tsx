"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { CategoryRecord } from "@/lib/categories";

interface CategoriesDropdownProps {
  categories: CategoryRecord[];
}

export default function CategoriesDropdown({
  categories,
}: CategoriesDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex items-center gap-1 hover:text-[#18C729] transition-colors py-2 focus:outline-none"
      >
        <span>Categories</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#18C729]" : "text-zinc-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#0c140f]/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-white/5">
            Product Categories
          </div>

          <div className="max-h-72 overflow-y-auto py-1 space-y-0.5 scrollbar-thin">
            {categories.length === 0 ? (
              <div className="px-3 py-2 text-xs text-zinc-400">No categories found</div>
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-[#18C729] dark:hover:text-[#18C729] transition-colors group"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-xs">
                    &rarr;
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-white/5 mt-1">
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-bold text-center text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/5 hover:bg-[#18C729]/10 hover:text-[#18C729] dark:hover:text-[#18C729] rounded-xl transition-colors"
            >
              <span>View All Categories</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

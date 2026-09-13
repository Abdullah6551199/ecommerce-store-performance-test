"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export interface MegaMenuColumn {
  title: string;
  items: Array<{ label: string; href: string; badge?: string }>;
}

export interface MegaMenuProps {
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  promoBanner?: {
    tag: string;
    title: string;
    description: string;
    imageUrl?: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

export default function MegaMenuDropdown({
  label,
  href,
  columns,
  promoBanner,
}: MegaMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    }, 180);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-1 hover:text-[#960DF2] dark:hover:text-[#C06EF7] transition-colors py-2 focus:outline-none group"
      >
        <span className="relative">
          {label}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#960DF2] group-hover:w-full transition-all duration-200" />
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#960DF2]" : "text-purple-400 dark:text-purple-300"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {/* Mega Menu Overlay Container */}
      {isOpen && (
        <div className="absolute -left-20 sm:-left-32 top-full mt-1 w-[680px] lg:w-[820px] rounded-3xl border border-purple-200 dark:border-purple-800/60 bg-white/95 dark:bg-[#3C0561]/95 backdrop-blur-2xl shadow-2xl shadow-purple-500/15 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-12 gap-6">
            {/* Columns Grid */}
            <div className={`grid ${promoBanner ? "col-span-8 grid-cols-3" : "col-span-12 grid-cols-4"} gap-4`}>
              {columns.map((col, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 border-b border-purple-100 dark:border-purple-800/40 pb-1.5">
                    {col.title}
                  </h4>
                  <ul className="space-y-2">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-purple-100 hover:text-[#960DF2] dark:hover:text-white transition-colors group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="rounded-full bg-[#EACFFC] dark:bg-[#5A0891] px-1.5 py-0.5 text-[9px] font-bold text-[#960DF2] dark:text-[#EACFFC]">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Promo Card Right */}
            {promoBanner && (
              <div className="col-span-4 rounded-2xl border border-purple-100 dark:border-purple-700/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-[#5A0891]/60 dark:to-[#3C0561]/80 p-4 flex flex-col justify-between overflow-hidden relative">
                <div className="space-y-2 relative z-10">
                  <span className="inline-block rounded-full bg-[#960DF2] text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    {promoBanner.tag}
                  </span>
                  <h5 className="text-sm font-extrabold text-[#3C0561] dark:text-white leading-tight">
                    {promoBanner.title}
                  </h5>
                  <p className="text-[11px] text-purple-900/70 dark:text-purple-200/70 leading-relaxed">
                    {promoBanner.description}
                  </p>
                </div>

                <div className="pt-4 relative z-10">
                  <Link
                    href={promoBanner.ctaHref}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#960DF2] dark:text-[#EACFFC] hover:underline"
                  >
                    <span>{promoBanner.ctaLabel}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Bottom quick bar */}
          <div className="mt-5 pt-3 border-t border-purple-100 dark:border-purple-800/40 flex items-center justify-between text-xs">
            <span className="text-purple-800/60 dark:text-purple-300/60 font-medium">
              Free 30-day returns on all {label.toLowerCase()}&apos;s apparel & footwear
            </span>
            <Link
              href={href}
              onClick={() => setIsOpen(false)}
              className="text-[#960DF2] dark:text-[#EACFFC] font-bold hover:underline"
            >
              Explore Full Collection &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

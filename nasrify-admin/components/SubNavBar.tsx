"use client";

import React from "react";
import Link from "next/link";

interface SubNavProps {
  onChatClick?: () => void;
}

const SUB_NAV_ITEMS = [
  { label: "Women's Top", href: "/search?q=top" },
  { label: "Women's Wear", href: "/search?q=wear" },
  { label: "Sunglasses", href: "/search?q=sunglasses" },
  { label: "Shoes Store", href: "/search?q=shoes" },
  { label: "Bags Store", href: "/search?q=bags" },
  { label: "Jewelry Store", href: "/search?q=jewelry" },
  { label: "Track Order", href: "/track-order" },
];

export default function SubNavBar({ onChatClick }: SubNavProps): React.JSX.Element {
  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onChatClick) {
      onChatClick();
    } else {
      // Direct to contact page or chat trigger
      window.location.href = "/contact";
    }
  };

  return (
    <div className="hidden md:block w-full border-b border-[#E4E4E7]/60 dark:border-zinc-800/40 bg-[#DCFCE7]/60 dark:bg-[#18181B]/90 backdrop-blur-sm transition-colors">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Navigation chips */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1 text-xs font-semibold text-[#18181B] dark:text-zinc-200">
          {SUB_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-[#25D366] dark:hover:text-[#1EA855] transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Chat Now CTA */}
        <div className="shrink-0 pl-4">
          <button
            type="button"
            onClick={handleChat}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#1EA855] text-white px-3.5 py-1 text-xs font-bold shadow-sm hover:shadow-[#25D366]/20 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chat Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

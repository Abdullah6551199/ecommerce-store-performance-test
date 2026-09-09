"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Isolated Client Island for Header Search Bar.
 */
export default function HeaderSearch(): React.JSX.Element {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products by name, SKU, brand..."
        className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-8 py-2 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729] transition-all"
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
  );
}

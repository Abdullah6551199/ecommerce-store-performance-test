import React from "react";

/**
 * Server Component for Header Search Bar.
 * Uses native semantic HTML GET form submission to /search without client JavaScript overhead.
 */
export default function HeaderSearch(): React.JSX.Element {
  return (
    <form action="/search" method="GET" className="relative w-full">
      <input
        type="search"
        name="q"
        placeholder="Search products by name, SKU, brand..."
        autoComplete="off"
        className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729] transition-all"
      />
      <svg
        className="absolute left-3 top-2.5 h-4 w-4 text-white/40 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </form>
  );
}


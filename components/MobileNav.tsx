"use client";

import React, { useState } from "react";
import Link from "next/link";

interface MobileNavProps {
  navLinks: Array<{ label: string; url: string }>;
}

/**
 * Isolated Client Island for Mobile Navigation toggle & dropdown.
 */
export default function MobileNav({ navLinks }: MobileNavProps): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
        aria-label="Toggle Navigation"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 md:hidden border-t border-white/10 bg-[#080e0a] px-4 py-3 space-y-2 shadow-2xl z-50">
          {navLinks.map((item, idx) => (
            <Link
              key={`mob-${item.url}-${idx}`}
              href={item.url}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-xs font-semibold text-white/80 hover:text-[#18C729]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin/products"
            prefetch={false}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-xs font-semibold text-[#FEF500]"
          >
            Admin Portal
          </Link>
        </div>
      )}
    </>
  );
}

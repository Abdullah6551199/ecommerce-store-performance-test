"use client";

import React from "react";
import { useCompare } from "@/components/CompareContext";

interface CompareButtonProps {
  productId: string;
  variant?: "card" | "detail" | "icon" | "pill" | "button";
  className?: string;
}

export default function CompareButton({
  productId,
  variant = "card",
  className = "",
}: CompareButtonProps): React.JSX.Element {
  const { isInCompare, toggleCompare } = useCompare();
  const active = isInCompare(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(productId);
  };

  // Detail / Pill / Button style
  if (variant === "button" || variant === "pill" || variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Remove from comparison" : "Add to comparison"}
        title={active ? "In comparison (Click to remove)" : "Compare product"}
        className={`inline-flex items-center justify-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
          active
            ? "border-[#25D366] bg-[#25D366] text-white shadow-md shadow-emerald-500/20"
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        } ${className}`}
      >
        <svg
          className="h-4 w-4 transition-transform group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <span>{active ? "In Compare" : "Compare"}</span>
      </button>
    );
  }

  // Card / Icon style (ProductCard top-right)
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from comparison" : "Add to comparison"}
      title={active ? "In comparison (Click to remove)" : "Compare product"}
      className={`group flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer ${
        active
          ? "border-[#25D366] bg-[#25D366] text-white shadow-md shadow-emerald-500/25 scale-105"
          : "border-zinc-200/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:scale-110"
      } ${className}`}
    >
      <svg
        className="h-4 w-4 transition-transform group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    </button>
  );
}

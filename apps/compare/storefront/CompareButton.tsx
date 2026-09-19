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
            ? "border-[#960DF2] bg-[#960DF2] text-white shadow-md shadow-purple-500/20"
            : "border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-200 hover:border-purple-400 hover:bg-purple-100/50"
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
          ? "border-[#960DF2] bg-[#960DF2] text-white shadow-md shadow-purple-500/25 scale-105"
          : "border-purple-200/80 dark:border-purple-700/80 bg-white/90 dark:bg-[#3C0561]/90 text-purple-700 dark:text-purple-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:scale-110"
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

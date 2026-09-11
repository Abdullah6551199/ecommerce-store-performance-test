"use client";

import React, { useEffect, useState } from "react";

interface ThemeToggleProps {
  storageKey?: "apex_theme" | "apex_admin_theme";
  className?: string;
}

/**
 * Reusable Theme Toggle Switch supporting both Storefront (apex_theme)
 * and Admin Panel (apex_admin_theme).
 * Left position = Light Mode (Sun)
 * Right position = Dark Mode (Moon)
 */
export default function ThemeToggle({
  storageKey = "apex_theme",
  className = "",
}: ThemeToggleProps): React.JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const darkActive = saved === "dark";
      setIsDark(darkActive);
      if (darkActive) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Respect system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [storageKey]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem(storageKey, nextDark ? "dark" : "light");
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Avoid hydration mismatch by rendering a stable placeholder before mount
  if (!mounted) {
    return (
      <div
        className={`relative inline-flex h-8 w-16 items-center rounded-full border border-white/20 bg-white/10 p-1 opacity-60 ${className}`}
        aria-hidden="true"
      >
        <span className="h-6 w-6 rounded-full bg-white/30" />
      </div>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className={`group relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#18C729] focus:ring-offset-2 focus:ring-offset-black ${
        isDark
          ? "border-white/15 bg-zinc-900 text-[#FEF500]"
          : "border-zinc-300 bg-amber-50 text-amber-500"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Background Icons */}
      <span className="absolute left-1.5 flex h-5 w-5 items-center justify-center text-amber-500">
        <svg
          className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? "opacity-40" : "opacity-100"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </span>

      <span className="absolute right-1.5 flex h-5 w-5 items-center justify-center text-[#FEF500]">
        <svg
          className={`h-3.5 w-3.5 transition-opacity duration-200 ${isDark ? "opacity-100" : "opacity-40"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </span>

      {/* Sliding Knob: Left = Light, Right = Dark */}
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isDark
            ? "translate-x-9 bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/20"
            : "translate-x-1 bg-white border border-amber-300 shadow-amber-200"
        }`}
      />
    </button>
  );
}

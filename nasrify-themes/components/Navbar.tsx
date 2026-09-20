import React from "react";
import Link from "next/link";

export default function Navbar(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#960DF2] via-[#C06EF7] to-[#EACFFC] flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-zinc-900 dark:text-white tracking-tight text-lg">
                Nasrify
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Themes Hub
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5 hidden sm:block">
              Storefront Themes Marketplace &amp; Developer Hub
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-colors"
          >
            Themes
          </Link>
          <Link
            href="/developer"
            className="px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-colors"
          >
            Developer Portal
          </Link>
          <Link
            href="/super/pending"
            className="px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-colors"
          >
            Approval Queue
          </Link>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden md:block" />

          <a
            href="https://nasrify-apps.zia291930.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>Apps Hub</span>
            <span className="text-[10px]">&nearr;</span>
          </a>

          <a
            href="https://nasrify-admin.zia291930.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>Admin</span>
            <span className="text-[10px]">&nearr;</span>
          </a>

          <a
            href="https://nasrify-store.zia291930.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-purple-500/25 transition-all cursor-pointer"
          >
            <span>Storefront</span>
            <span className="text-[10px]">&rarr;</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

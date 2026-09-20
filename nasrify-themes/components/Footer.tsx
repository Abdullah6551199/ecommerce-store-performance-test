import React from "react";
import Link from "next/link";

export default function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#960DF2] to-[#C06EF7] flex items-center justify-center text-white font-bold text-xs">
            🎨
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Nasrify Themes Hub. High-performance Edge Themes for Cloudflare Workers &amp; Next.js 16.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400">
            Themes Marketplace
          </Link>
          <Link href="/developer" className="hover:text-purple-600 dark:hover:text-purple-400">
            Developer Documentation
          </Link>
          <Link href="/super/pending" className="hover:text-purple-600 dark:hover:text-purple-400">
            Review Queue
          </Link>
          <a
            href="https://nasrify-apps.zia291930.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-600 dark:hover:text-purple-400"
          >
            Apps Hub
          </a>
          <a
            href="https://nasrify-admin.zia291930.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-600 dark:hover:text-purple-400"
          >
            Admin Panel
          </a>
        </div>
      </div>
    </footer>
  );
}

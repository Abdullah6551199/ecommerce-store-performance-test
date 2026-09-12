"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { FaqRecord } from "@/lib/db";

interface FaqAccordionProps {
  faqs: FaqRecord[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openIds, setOpenIds] = useState<string[]>(faqs.length > 0 ? [faqs[0].id] : []);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category || "General"));
    return Array.from(set);
  }, [faqs]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || (faq.category || "General") === selectedCategory;
      const matchesSearch =
        search === "" ||
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, search, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions (e.g. returns, delivery, sizing)..."
          className="w-full pl-11 pr-4 py-3.5 text-sm rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] text-zinc-900 dark:text-white placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#18C729]"
        />
        <svg
          className="w-5 h-5 text-zinc-400 absolute left-3.5 top-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedCategory === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
            }`}
          >
            All Questions ({faqs.length})
          </button>
          {categories.map((cat) => {
            const count = faqs.filter((f) => (f.category || "General") === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-[#18C729] text-black font-bold shadow-sm"
                    : "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Accordion Items List */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 p-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No answers matched your query &ldquo;{search}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs font-semibold text-[#18C729] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f] overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-zinc-50/70 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {faq.category && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 shrink-0">
                        {faq.category}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/10 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-zinc-100 dark:bg-white/10 text-[#18C729]" : "text-zinc-400"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-white/5 animate-in fade-in duration-150">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* "Still have questions? Contact Us" footer callout */}
      <div className="max-w-2xl mx-auto rounded-3xl border border-zinc-200 dark:border-white/10 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-[#0c140f] dark:to-[#121c15] p-8 text-center space-y-3">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Still have questions?
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Can&apos;t find the answer you are looking for? Our athlete support specialists are available Monday through Friday.
        </p>
        <div className="pt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18C729] hover:bg-[#15b224] text-black font-bold text-xs shadow-md shadow-[#18C729]/20 transition-all"
          >
            <span>Contact Customer Support</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

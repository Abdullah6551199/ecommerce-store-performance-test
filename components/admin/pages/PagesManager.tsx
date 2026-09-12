"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { PageRecord } from "@/lib/db";
import PageEditorModal from "./PageEditorModal";
import FaqManager from "./FaqManager";

export default function PagesManager(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"pages" | "faqs">("pages");
  const [pagesList, setPagesList] = useState<PageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageRecord | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/pages");
      const data = (await res.json()) as any;
      if (data.success && Array.isArray(data.data?.pages)) {
        setPagesList(data.data.pages);
      }
    } catch (err) {
      console.error("Failed to load CMS pages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDeletePage = async (page: PageRecord) => {
    if (page.isDefault) {
      alert("System default pages cannot be deleted.");
      return;
    }

    const confirmDel = window.confirm(`Are you sure you want to delete custom page "${page.title}"?`);
    if (!confirmDel) return;

    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete page");
      }
      setFeedback({ type: "success", message: `Deleted "${page.title}" successfully.` });
      fetchPages();
    } catch (err: any) {
      alert(err.message || "Failed to delete page");
    }
  };

  const filteredPages = pagesList.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getPageUrl = (slug: string) => {
    switch (slug) {
      case "about":
        return "/about";
      case "contact":
        return "/contact";
      case "privacy-policy":
        return "/privacy-policy";
      case "terms":
        return "/terms";
      case "returns":
        return "/returns";
      case "shipping":
        return "/shipping";
      default:
        return `/pages/${slug}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Pages & Content CMS</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage storefront pages (About, Contact, Policies) and customer FAQs.
          </p>
        </div>

        {activeTab === "pages" && (
          <button
            onClick={() => {
              setSelectedPage(null);
              setIsEditorOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Custom Page
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("pages")}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${
            activeTab === "pages"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Storefront Pages ({pagesList.length})
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${
            activeTab === "faqs"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Frequently Asked Questions (FAQs)
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-sm border flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Tab 1: Pages CMS */}
      {activeTab === "pages" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-xs text-slate-500">
              {filteredPages.length} {filteredPages.length === 1 ? "page" : "pages"}
            </div>
          </div>

          {/* Pages Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Page Title</th>
                    <th className="px-5 py-3.5">Slug (Route)</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Footer Link</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Loading pages...
                      </td>
                    </tr>
                  ) : filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No pages match your query.
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((page) => {
                      const url = getPageUrl(page.slug);
                      return (
                        <tr
                          key={page.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {page.title}
                            </div>
                            {page.seoTitle && (
                              <div className="text-xs text-slate-400 line-clamp-1 max-w-sm">
                                {page.seoTitle}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                            {url}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                page.isDefault
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              }`}
                            >
                              {page.isDefault ? "Core System" : "Custom Page"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                page.showInFooter
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {page.showInFooter ? "Visible" : "Hidden"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                page.isPublished
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              }`}
                            >
                              {page.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Open Page in New Tab"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                              <button
                                onClick={() => {
                                  setSelectedPage(page);
                                  setIsEditorOpen(true);
                                }}
                                className="px-3 py-1 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition"
                              >
                                Edit
                              </button>
                              {!page.isDefault && (
                                <button
                                  onClick={() => handleDeletePage(page)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                  title="Delete Page"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FAQs Management */}
      {activeTab === "faqs" && <FaqManager />}

      {/* Page Editor Modal */}
      {isEditorOpen && (
        <PageEditorModal
          isOpen={isEditorOpen}
          page={selectedPage}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedPage(null);
          }}
          onSave={() => {
            setIsEditorOpen(false);
            setSelectedPage(null);
            fetchPages();
          }}
        />
      )}
    </div>
  );
}

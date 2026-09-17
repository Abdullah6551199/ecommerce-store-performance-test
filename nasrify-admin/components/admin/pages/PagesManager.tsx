"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { EnhancedPageRecord } from "@/lib/cms";
import PageEditorModal from "./PageEditorModal";
import FaqManager from "./FaqManager";
import { fetchWithClientCache, invalidateClientCache } from "@/lib/client-cache";

export default function PagesManager(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"pages" | "faqs">("pages");
  const [pagesList, setPagesList] = useState<EnhancedPageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<EnhancedPageRecord | null>(null);

  // Delete Confirmation Modal
  const [pageToDelete, setPageToDelete] = useState<EnhancedPageRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Confirmation State
  const [resettingId, setResettingId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPages = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const data = await fetchWithClientCache<{ pages: EnhancedPageRecord[] }>("/api/admin/pages", {
        forceRefresh,
      });
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

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    if (pageToDelete.isDefault) {
      alert("System default core pages cannot be deleted.");
      setPageToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/pages/${pageToDelete.id}`, { method: "DELETE" });
      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete page");
      }
      setFeedback({ type: "success", message: `Deleted "${pageToDelete.title}" successfully.` });
      setPageToDelete(null);
      invalidateClientCache("/api/admin/pages");
      fetchPages(true);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete page" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetCorePage = async (page: EnhancedPageRecord) => {
    const confirmReset = window.confirm(
      `Reset "${page.title}" to its factory default template? Any custom modifications will be replaced.`
    );
    if (!confirmReset) return;

    try {
      setResettingId(page.id);
      const res = await fetch(`/api/admin/pages/${page.id}/reset`, { method: "POST" });
      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset page to default.");
      }
      setFeedback({ type: "success", message: `"${page.title}" restored to default template.` });
      invalidateClientCache("/api/admin/pages");
      fetchPages(true);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to reset template" });
    } finally {
      setResettingId(null);
    }
  };

  const getPageUrl = (slug: string) => {
    switch (slug) {
      case "home":
        return "/";
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
      case "faq":
        return "/faq";
      default:
        return `/pages/${slug}`;
    }
  };

  const filteredPages = pagesList.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const corePages = filteredPages.filter((p) => p.isDefault);
  const customPages = filteredPages.filter((p) => !p.isDefault);

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Pages Management</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build and manage custom storefront landing pages and edit core policy pages.
          </p>
        </div>

        {activeTab === "pages" && (
          <button
            onClick={() => {
              setSelectedPage(null);
              setIsEditorOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#960DF2] hover:bg-[#850bd8] text-white text-sm font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            + Create New Page
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-purple-200/50 dark:border-purple-900/40">
        <button
          onClick={() => setActiveTab("pages")}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${
            activeTab === "pages"
              ? "border-[#960DF2] text-[#960DF2] dark:text-[#EACFFC]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Storefront Pages ({pagesList.length})
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${
            activeTab === "faqs"
              ? "border-[#960DF2] text-[#960DF2] dark:text-[#EACFFC]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Frequently Asked Questions (FAQs)
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm border flex items-center justify-between animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✓" : "⚠️"}</span>
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-base px-2 hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {activeTab === "pages" && (
        <div className="space-y-8">
          {/* Live Search Bar */}
          <div className="bg-white dark:bg-[#1E0230] p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-purple-200/70 dark:border-purple-800/60 bg-purple-50/40 dark:bg-[#2A0344] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#960DF2]"
              />
              <svg className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-purple-300">
              Showing {filteredPages.length} {filteredPages.length === 1 ? "page" : "pages"} ({corePages.length} core, {customPages.length} custom)
            </div>
          </div>

          {/* SECTION 1: CORE PAGES (cannot be deleted) */}
          <div className="bg-white dark:bg-[#1E0230] rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-[#2A0344]/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#3C0561] dark:text-white flex items-center gap-2">
                  <span>CORE PAGES</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]">
                    Protected • Edit Only
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
                  Core storefront pages cannot be deleted. You can customize their content or reset them to defaults.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#25033d] text-xs uppercase font-bold text-slate-500 dark:text-purple-300 border-b border-purple-100 dark:border-purple-900/40">
                  <tr>
                    <th className="px-6 py-3.5">Page Title</th>
                    <th className="px-6 py-3.5">Route URL</th>
                    <th className="px-6 py-3.5">Header / Footer</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100/70 dark:divide-purple-900/40">
                  {corePages.map((page) => {
                    const url = getPageUrl(page.slug);
                    const isResetting = resettingId === page.id;
                    return (
                      <tr key={page.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="text-base">📄</span>
                            <span>{page.title}</span>
                          </div>
                          {page.seoTitle && (
                            <div className="text-xs text-slate-400 dark:text-purple-300/60 line-clamp-1 max-w-sm mt-0.5">
                              {page.seoTitle}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-[#960DF2] dark:text-[#C06EF7]">
                          {url}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                page.showInHeader
                                  ? "bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              }`}
                            >
                              Header: {page.showInHeader ? "On" : "Off"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                page.showInFooter
                                  ? "bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              }`}
                            >
                              Footer: {page.showInFooter ? "On" : "Off"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              page.isPublished
                                ? "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {page.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleResetCorePage(page)}
                              disabled={isResetting}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition disabled:opacity-50"
                              title="Reset content to factory template"
                            >
                              {isResetting ? "Resetting..." : "Reset"}
                            </button>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs font-bold rounded-lg border border-purple-200 dark:border-purple-800 text-[#960DF2] dark:text-[#C06EF7] hover:bg-purple-50 dark:hover:bg-purple-900/40 transition"
                            >
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPage(page);
                                setIsEditorOpen(true);
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-lg bg-[#960DF2] hover:bg-[#850bd8] text-white shadow-sm transition"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: CUSTOM PAGES (full CRUD) */}
          <div className="bg-white dark:bg-[#1E0230] rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-[#2A0344]/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#3C0561] dark:text-white flex items-center gap-2">
                  <span>CUSTOM PAGES</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]">
                    Full CRUD ({customPages.length})
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
                  Create dedicated brand stories, sizing charts, sustainability announcements, and campaign landing pages.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedPage(null);
                  setIsEditorOpen(true);
                }}
                className="text-xs font-bold text-[#960DF2] dark:text-[#C06EF7] hover:underline"
              >
                + New Page
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#25033d] text-xs uppercase font-bold text-slate-500 dark:text-purple-300 border-b border-purple-100 dark:border-purple-900/40">
                  <tr>
                    <th className="px-6 py-3.5">Page Title</th>
                    <th className="px-6 py-3.5">Slug (Route)</th>
                    <th className="px-6 py-3.5">Template</th>
                    <th className="px-6 py-3.5">Navigation</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100/70 dark:divide-purple-900/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Loading custom pages...
                      </td>
                    </tr>
                  ) : customPages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">No custom pages created yet.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click &quot;+ Create New Page&quot; to build your first landing page or size guide.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    customPages.map((page) => {
                      const url = getPageUrl(page.slug);
                      return (
                        <tr key={page.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="text-base">📄</span>
                              <span>{page.title}</span>
                            </div>
                            {page.seoTitle && (
                              <div className="text-xs text-slate-400 dark:text-purple-300/60 line-clamp-1 max-w-sm mt-0.5">
                                {page.seoTitle}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-[#960DF2] dark:text-[#C06EF7]">
                            {url}
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {page.template || "Standard"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  page.showInHeader
                                    ? "bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                }`}
                              >
                                Header: {page.showInHeader ? "On" : "Off"}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  page.showInFooter
                                    ? "bg-purple-100 dark:bg-purple-900/60 text-[#960DF2] dark:text-[#EACFFC]"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                }`}
                              >
                                Footer: {page.showInFooter ? "On" : "Off"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                page.isPublished
                                  ? "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {page.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs font-bold rounded-lg border border-purple-200 dark:border-purple-800 text-[#960DF2] dark:text-[#C06EF7] hover:bg-purple-50 dark:hover:bg-purple-900/40 transition"
                              >
                                View
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPage(page);
                                  setIsEditorOpen(true);
                                }}
                                className="px-3 py-1 text-xs font-bold rounded-lg bg-[#960DF2] hover:bg-[#850bd8] text-white shadow-sm transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setPageToDelete(page)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title="Delete Custom Page"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
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
            invalidateClientCache("/api/admin/pages");
            fetchPages(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {pageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1E0230] border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Custom Page</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{pageToDelete.title}&quot;</strong>? This action cannot be undone and its route will return 404.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPageToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

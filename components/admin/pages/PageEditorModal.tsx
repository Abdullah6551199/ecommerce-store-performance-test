"use client";

import React, { useState, useEffect, useRef } from "react";
import type { PageRecord } from "@/lib/db";

interface PageEditorModalProps {
  isOpen: boolean;
  page: PageRecord | null;
  onClose: () => void;
  onSave: () => void;
}

export default function PageEditorModal({
  isOpen,
  page,
  onClose,
  onSave,
}: PageEditorModalProps): React.JSX.Element | null {
  const isEditing = Boolean(page);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [showInFooter, setShowInFooter] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or reset form
  useEffect(() => {
    if (page) {
      setTitle(page.title || "");
      setSlug(page.slug || "");
      setContent(page.content || "");
      setSeoTitle(page.seoTitle || "");
      setSeoDescription(page.seoDescription || "");
      setOgImage(page.ogImage || "");
      setShowInFooter(Boolean(page.showInFooter));
      setIsPublished(Boolean(page.isPublished));
    } else {
      setTitle("");
      setSlug("");
      setContent(`<h1>Page Title</h1>\n<p>Write your page content here...</p>`);
      setSeoTitle("");
      setSeoDescription("");
      setOgImage("");
      setShowInFooter(true);
      setIsPublished(true);
    }
    setErrorMessage(null);
    setActiveTab("edit");
  }, [page, isOpen]);

  if (!isOpen) return null;

  // Auto slugify when title changes on new pages
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Content formatting toolbar helpers
  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${tagStart}${selected || "text"}${tagEnd}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tagStart.length, start + tagStart.length + (selected.length || 4));
    }, 0);
  };

  const handleSave = async (publishStatus?: boolean) => {
    if (!title.trim()) {
      setErrorMessage("Page title is required.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Page slug is required.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        content,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        ogImage: ogImage.trim() || null,
        showInFooter,
        isPublished: publishStatus !== undefined ? publishStatus : isPublished,
      };

      const url = isEditing ? `/api/admin/pages/${page!.id}` : "/api/admin/pages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save page");
      }

      onSave();
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!page || !page.isDefault) return;
    const confirmReset = window.confirm(
      `Reset "${page.title}" to its factory default template? Custom changes will be overwritten.`
    );
    if (!confirmReset) return;

    try {
      setIsResetting(true);
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_default" }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset page");
      }

      if (data.data?.page) {
        const p = data.data.page;
        setTitle(p.title);
        setContent(p.content);
        setSeoTitle(p.seoTitle || "");
        setSeoDescription(p.seoDescription || "");
      }
      alert("Page restored to default template.");
    } catch (err: any) {
      alert(err.message || "Failed to reset template");
    } finally {
      setIsResetting(false);
    }
  };

  const pagePath =
    page?.slug === "about"
      ? "/about"
      : page?.slug === "contact"
      ? "/contact"
      : page?.slug === "privacy-policy"
      ? "/privacy-policy"
      : page?.slug === "terms"
      ? "/terms"
      : page?.slug === "returns"
      ? "/returns"
      : page?.slug === "shipping"
      ? "/shipping"
      : `/pages/${slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              📄
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit Page: ${page?.title}` : "Create New Custom Page"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing && page?.isDefault ? "Core System Page" : "Custom Storefront Page"} • URL:{" "}
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{pagePath}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <a
                href={pagePath}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Preview
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Page Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Page Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. About Our Brand"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Slug (URL Path) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl">
                  /
                </span>
                <input
                  type="text"
                  value={slug}
                  disabled={page?.isDefault}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="about"
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-r-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Content Editor Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Page Content (Rich HTML / Markdown)
              </label>

              {/* Edit / Preview Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === "edit"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === "preview"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  HTML Preview
                </button>
              </div>
            </div>

            {activeTab === "edit" ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h1>", "</h1>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h2>", "</h2>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h3>", "</h3>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("<strong>", "</strong>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<em>", "</em>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 italic"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<u>", "</u>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 underline"
                    title="Underline"
                  >
                    U
                  </button>
                  <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Numbered List"
                  >
                    1. List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<blockquote>\n  ", "\n</blockquote>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Blockquote"
                  >
                    Quote
                  </button>
                  <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter Link URL:", "https://");
                      if (url) insertFormatting(`<a href="${url}">`, "</a>");
                    }}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Link"
                  >
                    🔗 Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter Image URL:", "https://");
                      if (url) insertFormatting(`<img src="${url}" alt="`, '" class="my-4 rounded-xl max-w-full" />');
                    }}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Image"
                  >
                    🖼️ Image
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<pre><code>", "</code></pre>")}
                    className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-xs"
                    title="Code"
                  >
                    &lt;/&gt;
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full p-4 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 bg-transparent resize-y focus:outline-none"
                  placeholder="<h1>Heading</h1><p>Your HTML content...</p>"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 min-h-[300px] max-h-[400px] overflow-y-auto prose dark:prose-invert max-w-none text-sm">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            )}
          </div>

          {/* SEO Metadata Accordion / Fields */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🔍</span> SEO & Social Sharing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Meta Title ({seoTitle.length}/60 chars)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. About Our Brand | ApexStore"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Open Graph Image URL
                </label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Meta Description ({seoDescription.length}/160 chars)
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary for Google search snippets and social shares..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Page Settings & Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-6">
              {/* Published Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                />
                <span>Published (Visible on Storefront)</span>
              </label>

              {/* Show in Footer Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showInFooter}
                  onChange={(e) => setShowInFooter(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                />
                <span>Show in Footer Navigation</span>
              </label>
            </div>

            {/* Reset to Default Template button (if default page) */}
            {isEditing && page?.isDefault && (
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isResetting}
                className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "↺ Reset to Default Template"}
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Publish Page"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

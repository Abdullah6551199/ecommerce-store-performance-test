"use client";

import React, { useState, useEffect, useRef } from "react";
import type { CategoryRecord, FlattenedCategory } from "@/lib/categories";
import { generateSlug, getDescendantIds } from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit: CategoryRecord | null;
  allCategories: CategoryRecord[];
  flattenedCategories: FlattenedCategory[];
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
  allCategories,
  flattenedCategories,
}: CategoryModalProps): React.JSX.Element | null {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form state when categoryToEdit changes or modal opens
  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setSlugManuallyEdited(true);
      setDescription(categoryToEdit.description || "");
      setParentId(categoryToEdit.parentId || "");
      setImageUrl(categoryToEdit.imageUrl || "");
      setStatus(categoryToEdit.status === "inactive" ? "inactive" : "active");
      setSortOrder(categoryToEdit.sortOrder || 0);
      setSeoTitle(categoryToEdit.seoTitle || "");
      setSeoDescription(categoryToEdit.seoDescription || "");
    } else {
      setName("");
      setSlug("");
      setSlugManuallyEdited(false);
      setDescription("");
      setParentId("");
      setImageUrl("");
      setStatus("active");
      setSortOrder(0);
      setSeoTitle("");
      setSeoDescription("");
    }
    setErrorMessage(null);
    setUploadError(null);
  }, [categoryToEdit, isOpen]);

  // Auto-generate slug when name changes if not manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
  };

  const handleRegenerateSlug = () => {
    const autoSlug = generateSlug(name);
    setSlug(autoSlug);
    setSlugManuallyEdited(false);
  };

  // Image Upload via /api/media/upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image file size exceeds 5MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "categories");
      formData.append("altText", `${name || "Category"} banner`);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        success: boolean;
        data?: { url: string };
        error?: { message?: string };
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload image to R2 storage.");
      }

      if (data.data?.url) {
        setImageUrl(data.data.url);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Determine which categories cannot be selected as parent (self + all descendants)
  const invalidParentIds = React.useMemo(() => {
    if (!categoryToEdit) return new Set<string>();
    const descendants = getDescendantIds(allCategories, categoryToEdit.id);
    descendants.add(categoryToEdit.id);
    return descendants;
  }, [categoryToEdit, allCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        parentId: parentId || null,
        imageUrl: imageUrl.trim() || null,
        status,
        sortOrder: Number(sortOrder) || 0,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
      };

      const url = categoryToEdit
        ? `/api/admin/categories/${categoryToEdit.id}`
        : "/api/admin/categories";
      const method = categoryToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: CategoryRecord;
      };

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save category.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0a110c] p-6 sm:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h2 id="category-modal-title" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {categoryToEdit ? "Edit Category" : "Create New Category"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-white/50">
                {categoryToEdit ? `Updating #${categoryToEdit.slug}` : "Add a category or subcategory to your store catalog."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 p-2 text-zinc-600 dark:text-white/60 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-500 dark:text-red-400 flex items-start gap-2.5">
            <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Grid: Name & Slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category-name" className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                Category Name <span className="text-[#18C729]">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Streetwear"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="category-slug" className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                  Slug <span className="text-[#18C729]">*</span>
                </label>
                {slugManuallyEdited && (
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[10px] text-emerald-600 dark:text-[#FEF500] hover:underline"
                  >
                    Regenerate
                  </button>
                )}
              </div>
              <input
                id="category-slug"
                type="text"
                required
                value={slug}
                onChange={handleSlugChange}
                placeholder="e.g. streetwear"
                className="mt-1.5 w-full font-mono rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="category-description" className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
              Description <span className="text-zinc-400 dark:text-white/40 font-normal">(Optional)</span>
            </label>
            <textarea
              id="category-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for category banner and storefront cards..."
              className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
            />
          </div>

          {/* Parent Category & Status & Sort Order */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="category-parent" className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                Parent Category
              </label>
              <select
                id="category-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#0e1610] px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
              >
                <option value="">None (Top-Level Category)</option>
                {flattenedCategories.map((cat) => {
                  const isSelfOrDescendant = invalidParentIds.has(cat.id);
                  const prefix = "— ".repeat(cat.depth);
                  return (
                    <option key={cat.id} value={cat.id} disabled={isSelfOrDescendant}>
                      {prefix}
                      {cat.name} {isSelfOrDescendant ? "(Self / Descendant)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="category-status" className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                Status
              </label>
              <select
                id="category-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#0e1610] px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
              >
                <option value="active">Active (Visible on Storefront)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div>
              <label htmlFor="category-sort" className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                Sort Order
              </label>
              <input
                id="category-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
              />
            </div>
          </div>

          {/* Image Upload to R2 Bucket */}
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-white/90">Category Image</span>
                <p className="text-[11px] text-zinc-500 dark:text-white/50">Direct upload to Cloudflare R2 bucket (PNG, JPG, WebP &le; 5MB)</p>
              </div>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  Remove Image
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-300 dark:border-white/15 bg-zinc-100 dark:bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={normalizeImageUrl(imageUrl)} alt="Category preview" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-zinc-900 dark:text-white truncate">{imageUrl}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#18C729]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                    Ready &amp; Stored in Cloudflare R2
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 text-xs text-zinc-700 dark:text-white/80 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Replace
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="category-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-white/20 bg-white dark:bg-white/5 p-4 text-center hover:border-[#18C729]/50 hover:bg-[#18C729]/5 transition-all"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-xs text-[#18C729]">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Uploading to Cloudflare R2...
                    </div>
                  ) : (
                    <>
                      <svg className="h-6 w-6 text-zinc-400 dark:text-white/50 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-zinc-700 dark:text-white/80">Click to upload category image</span>
                      <span className="text-[10px] text-zinc-400 dark:text-white/40 mt-0.5">PNG, JPG, WebP up to 5MB (auto-uploaded to R2)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{uploadError}</p>
            )}
          </div>

          {/* SEO Accordion */}
          <details className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 p-4 transition-all">
            <summary className="cursor-pointer text-xs font-semibold text-zinc-700 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white flex items-center justify-between">
              <span>Search Engine Optimization (SEO) Metadata</span>
              <span className="text-[10px] text-zinc-400 dark:text-white/40">Expand</span>
            </summary>
            <div className="mt-4 space-y-3 pt-2 border-t border-zinc-200 dark:border-white/10">
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="category-seo-title" className="text-xs text-zinc-700 dark:text-white/70">
                    SEO Title
                  </label>
                  <span className="text-[10px] text-zinc-400 dark:text-white/40">{seoTitle.length}/160</span>
                </div>
                <input
                  id="category-seo-title"
                  type="text"
                  maxLength={160}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Custom title tag for search engines"
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="category-seo-description" className="text-xs text-zinc-700 dark:text-white/70">
                    SEO Description
                  </label>
                  <span className="text-[10px] text-zinc-400 dark:text-white/40">{seoDescription.length}/320</span>
                </div>
                <textarea
                  id="category-seo-description"
                  rows={2}
                  maxLength={320}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description for search snippets"
                  className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
              </div>
            </div>
          </details>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-white/70 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2.5 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving Category...
                </>
              ) : categoryToEdit ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

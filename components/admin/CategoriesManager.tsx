"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import CategoryModal from "./CategoryModal";
import type { CategoryRecord, FlattenedCategory, CategoryWithChildren } from "@/lib/categories";
import { buildCategoryTree, flattenCategoryHierarchy } from "@/lib/categories";

export default function CategoriesManager(): React.JSX.Element {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryRecord | null>(null);

  // Delete confirmation
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/admin/categories");
      const data = (await res.json()) as {
        success: boolean;
        data?: { categories: CategoryRecord[] };
        error?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load categories");
      }
      setCategories(data.data?.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Derive tree and flattened hierarchy
  const { tree, flattened } = useMemo(() => {
    const t = buildCategoryTree(categories);
    const f = flattenCategoryHierarchy(t);
    return { tree: t, flattened: f };
  }, [categories]);

  // Filtered rows for table
  const displayedCategories = useMemo(() => {
    return flattened.filter((cat) => {
      const matchesSearch =
        searchQuery === "" ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || cat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [flattened, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.status === "active").length;
    const root = categories.filter((c) => !c.parentId).length;
    const sub = categories.filter((c) => !!c.parentId).length;
    return { total, active, root, sub };
  }, [categories]);

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryRecord) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete category");
      }
      setFeedback({
        type: "success",
        message: `Category '${categoryToDelete.name}' was removed.`,
      });
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete category",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Categories & Taxonomy</h1>
            <span className="rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#18C729]">
              Stage 4 Active
            </span>
          </div>
          <p className="mt-1 text-xs text-white/60">
            Manage catalog taxonomy, multi-level parent-child hierarchy, and storefront collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2.5 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Category
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
            feedback.type === "success"
              ? "border-[#18C729]/30 bg-[#18C729]/10 text-[#18C729]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0c140f]/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Total Categories</span>
            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c140f]/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Active on Store</span>
            <span className="h-2 w-2 rounded-full bg-[#18C729] animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#18C729]">{stats.active}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c140f]/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Root Categories</span>
            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-white">{stats.root}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c140f]/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Subcategories</span>
            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#FEF500]">{stats.sub}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0c140f]/60 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by category name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-status" className="text-xs text-white/60">Status:</label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="rounded-xl border border-white/10 bg-[#0a110c] px-3 py-1.5 text-xs text-white focus:border-[#18C729] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            type="button"
            onClick={fetchCategories}
            title="Refresh list"
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <svg className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c140f]/80 backdrop-blur-md shadow-xl">
        {isLoading && categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/50">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#18C729] border-t-transparent" />
            Loading categories from database...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-xs text-red-400">{error}</p>
            <button
              type="button"
              onClick={fetchCategories}
              className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : displayedCategories.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[#FEF500]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">No categories found</h3>
            <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No categories matched your search criteria."
                : "Your store catalog currently has no categories. Create your first category to get started."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#18C729] px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/60">
                  <th className="py-3.5 pl-6 pr-4 font-semibold">Category (Hierarchy)</th>
                  <th className="px-4 py-3.5 font-semibold">Slug</th>
                  <th className="px-4 py-3.5 font-semibold">Parent Category</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Sort</th>
                  <th className="py-3.5 pl-4 pr-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayedCategories.map((cat) => {
                  const hasParent = Boolean(cat.parentId);
                  const indentPx = cat.depth * 24;

                  return (
                    <tr
                      key={cat.id}
                      className="group transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Name with visual indentation & image */}
                      <td className="py-3.5 pl-6 pr-4">
                        <div
                          className="flex items-center gap-3"
                          style={{ paddingLeft: `${indentPx}px` }}
                        >
                          {/* Visual hierarchy tree branch marker */}
                          {cat.depth > 0 && (
                            <span className="text-[#FEF500]/60 font-mono text-sm shrink-0 select-none">
                              ↳
                            </span>
                          )}

                          {/* Thumbnail */}
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            {cat.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white/30">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white group-hover:text-[#18C729] transition-colors truncate">
                                {cat.name}
                              </span>
                              {cat.depth === 0 && (
                                <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-white/50 border border-white/10">
                                  Root
                                </span>
                              )}
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-white/40 truncate max-w-xs">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-4 py-3.5 font-mono text-white/60">
                        <span className="rounded-lg bg-black/40 px-2 py-1 border border-white/10 text-[11px]">
                          /{cat.slug}
                        </span>
                      </td>

                      {/* Parent Category */}
                      <td className="px-4 py-3.5 text-white/70">
                        {hasParent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#FEF500]/20 bg-[#FEF500]/5 px-2 py-1 text-[11px] text-[#FEF500]">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            {cat.parentName || "Parent"}
                          </span>
                        ) : (
                          <span className="text-white/30 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {cat.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#18C729]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Sort Order */}
                      <td className="px-4 py-3.5 text-white/70">
                        <span className="font-mono text-[11px]">{cat.sortOrder}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:border-[#18C729]/40 hover:bg-[#18C729]/10 hover:text-[#18C729] transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            title="Delete Category"
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async () => {
          await fetchCategories();
          setFeedback({
            type: "success",
            message: categoryToEdit ? "Category updated successfully." : "Category created successfully.",
          });
        }}
        categoryToEdit={categoryToEdit}
        allCategories={categories}
        flattenedCategories={flattened}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0a110c] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Delete Category</h3>
            <p className="mt-1.5 text-xs text-white/60">
              Are you sure you want to delete <span className="font-semibold text-white">&quot;{categoryToDelete.name}&quot;</span>?
              If this category has child subcategories, their parent link will be safely cleared.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

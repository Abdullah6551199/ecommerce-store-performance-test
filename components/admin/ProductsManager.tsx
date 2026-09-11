"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import ProductModal from "./ProductModal";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import type { CategoryRecord } from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/utils";

export default function ProductsManager(): React.JSX.Element {
  const [productsList, setProductsList] = useState<ProductWithImagesAndCategory[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductWithImagesAndCategory | null>(null);

  // Deletion
  const [productToDelete, setProductToDelete] = useState<ProductWithImagesAndCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Duplication
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [prodsRes, catsRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

      const prodsData = (await prodsRes.json()) as { success: boolean; data?: ProductWithImagesAndCategory[]; error?: string };
      const catsData = (await catsRes.json()) as { success: boolean; data?: { categories: CategoryRecord[] }; error?: string };

      if (!prodsRes.ok || !prodsData.success) {
        throw new Error(prodsData.error || "Failed to load products");
      }

      setProductsList(prodsData.data || []);
      if (catsRes.ok && catsData.success) {
        setCategoriesList(catsData.data?.categories || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered rows
  const filteredProducts = useMemo(() => {
    return productsList.filter((prod) => {
      const matchesSearch =
        searchQuery === "" ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.brand && prod.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === "all" || prod.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || prod.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [productsList, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = productsList.length;
    const published = productsList.filter((p) => p.status === "published").length;
    const lowOrOut = productsList.filter(
      (p) =>
        p.stockStatus === "out_of_stock" ||
        (p.trackInventory && p.stockQuantity <= p.lowStockThreshold)
    ).length;
    const totalUnits = productsList.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

    return { total, published, lowOrOut, totalUnits };
  }, [productsList]);

  const handleDuplicate = async (id: string) => {
    try {
      setDuplicatingId(id);
      const res = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: "POST",
      });
      const data = (await res.json()) as { success: boolean; message?: string; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to duplicate product");
      }

      setFeedback({
        type: "success",
        message: data.message || "Product cloned successfully as draft.",
      });
      await fetchData();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Duplication error",
      });
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { success: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }

      setFeedback({
        type: "success",
        message: `Product '${productToDelete.name}' has been deleted.`,
      });
      setProductToDelete(null);
      await fetchData();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Deletion error",
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Product Catalog</h1>
            <span className="rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#18C729]">
              Live Catalog
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-600 dark:text-white/60">
            Manage SKU inventory, pricing tiers, gallery assets, and store listings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2.5 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Product
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
            feedback.type === "success"
              ? "border-[#18C729]/30 bg-[#18C729]/10 text-emerald-800 dark:text-[#18C729]"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f]/80 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-white/60">
            <span>Total Products</span>
            <svg className="h-4 w-4 text-zinc-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f]/80 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-white/60">
            <span>Published Live</span>
            <span className="h-2 w-2 rounded-full bg-[#18C729] animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-[#18C729]">{stats.published}</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f]/80 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-white/60">
            <span>Low / Out of Stock</span>
            <svg className="h-4 w-4 text-zinc-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-[#FEF500]">{stats.lowOrOut}</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f]/80 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-white/60">
            <span>Total Units</span>
            <svg className="h-4 w-4 text-zinc-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{stats.totalUnits}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f]/60 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by product name, SKU, or brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-white/5 pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/40 focus:border-[#18C729] focus:outline-none"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#0a110c] px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#0a110c] px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={fetchData}
            title="Refresh product list"
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 p-2 text-zinc-600 dark:text-white/60 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <svg className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Products Table Container */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c140f]/80 backdrop-blur-md shadow-xl">
        {isLoading && productsList.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 dark:text-white/50">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#18C729] border-t-transparent" />
            Loading catalog from database...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="mt-3 rounded-lg border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-3 py-1 text-xs text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5 text-[#18C729]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">No products found</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-white/50 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "No products matched your search or filter criteria."
                : "Your store catalog currently has no products. Click below to create your first item."}
            </p>
            <button
              type="button"
              onClick={() => {
                setProductToEdit(null);
                setIsModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#18C729] px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create First Product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] text-zinc-500 dark:text-white/60 font-medium">
                  <th className="py-3.5 pl-6 pr-4 font-semibold">Product</th>
                  <th className="px-4 py-3.5 font-semibold">SKU</th>
                  <th className="px-4 py-3.5 font-semibold">Price</th>
                  <th className="px-4 py-3.5 font-semibold">Inventory</th>
                  <th className="px-4 py-3.5 font-semibold">Category</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                {paginatedProducts.map((prod) => {
                  const hasSale = Boolean(prod.salePrice && prod.salePrice < prod.price);
                  const isOutOfStock =
                    prod.stockStatus === "out_of_stock" ||
                    (prod.trackInventory && prod.stockQuantity <= 0 && !prod.allowBackorders);
                  const isLowStock =
                    !isOutOfStock &&
                    prod.trackInventory &&
                    prod.stockQuantity <= prod.lowStockThreshold;

                  return (
                    <tr key={prod.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5">
                            {prod.mainImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={normalizeImageUrl(prod.mainImage)}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-white/30">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-zinc-900 dark:text-white group-hover:text-[#18C729] transition-colors truncate block">
                              {prod.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 dark:text-white/40">
                              /{prod.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3.5 font-mono text-zinc-700 dark:text-white/70">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-lg bg-zinc-100 dark:bg-black/40 px-2 py-1 border border-zinc-200 dark:border-white/10 text-[11px] text-zinc-800 dark:text-white">
                            {prod.sku}
                          </span>
                          {prod.variants && prod.variants.length > 0 && (
                            <span className="rounded-md bg-[#FEF500]/15 border border-[#FEF500]/30 px-1.5 py-0.5 text-[9px] font-sans font-bold text-amber-700 dark:text-[#FEF500]">
                              {prod.variants.length} vars
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        {hasSale ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-[#18C729]">
                              ${Number(prod.salePrice).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-white/40 line-through">
                              ${Number(prod.price).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-zinc-900 dark:text-white">
                            ${Number(prod.price).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Inventory */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-zinc-900 dark:text-white/90">{prod.stockQuantity}</span>
                          {isOutOfStock ? (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/30">
                              Out
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-[#FEF500]/20 text-amber-700 dark:text-[#FEF500] border border-[#FEF500]/30">
                              Low
                            </span>
                          ) : (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-[#18C729]/15 text-emerald-700 dark:text-[#18C729] border border-[#18C729]/30">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        {prod.categoryName ? (
                          <span className="rounded-lg bg-zinc-100 dark:bg-white/5 px-2 py-1 text-[11px] text-zinc-700 dark:text-white/70 border border-zinc-200 dark:border-white/10">
                            {prod.categoryName}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-white/30">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {prod.status === "published" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#18C729]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                            Published
                          </span>
                        ) : prod.status === "draft" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-white/15 bg-zinc-100 dark:bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-white/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-white/40" />
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-white/40">
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setProductToEdit(prod);
                              setIsModalOpen(true);
                            }}
                            title="Edit Product"
                            className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 p-1.5 text-zinc-600 dark:text-white/70 hover:border-[#18C729]/40 hover:bg-[#18C729]/10 hover:text-[#18C729] transition-colors cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(prod.id)}
                            disabled={duplicatingId === prod.id}
                            title="Duplicate Product"
                            className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 p-1.5 text-zinc-600 dark:text-white/70 hover:border-[#FEF500]/40 hover:bg-[#FEF500]/10 hover:text-amber-600 dark:hover:text-[#FEF500] transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(prod)}
                            title="Delete Product"
                            className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 p-1.5 text-zinc-600 dark:text-white/70 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
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

          {/* Pagination Controls */}
          {filteredProducts.length > PAGE_SIZE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-white/10 px-6 py-4 bg-zinc-50 dark:bg-white/[0.01]">
              <div className="text-xs text-zinc-500 dark:text-white/60">
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)}
                </span>{" "}
                of <span className="font-semibold text-zinc-900 dark:text-white">{filteredProducts.length}</span> products
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        pNum === currentPage
                          ? "bg-[#18C729] text-black font-bold shadow-md shadow-[#18C729]/20"
                          : "border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-700 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async () => {
          await fetchData();
          setFeedback({
            type: "success",
            message: productToEdit ? "Product updated successfully." : "Product created successfully.",
          });
        }}
        productToEdit={productToEdit}
        categoriesList={categoriesList}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0a110c] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">Delete Product</h3>
            <p className="mt-1.5 text-xs text-zinc-600 dark:text-white/60">
              Are you sure you want to permanently delete <span className="font-semibold text-zinc-900 dark:text-white">&quot;{productToDelete.name}&quot;</span> (SKU: {productToDelete.sku})? All associated gallery records will also be removed.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-white/70 hover:bg-zinc-200 dark:hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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

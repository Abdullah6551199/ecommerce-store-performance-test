"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/utils";
import type { BundleWithItems } from "../shared/types";

export default function BundlesManager(): React.JSX.Element {
  const [bundles, setBundles] = useState<BundleWithItems[]>([]);
  const [stats, setStats] = useState({
    totalBundles: 0,
    activeBundles: 0,
    featuredBundles: 0,
    averageDiscountPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "featured">("all");
  const [sortBy, setSortBy] = useState<"sortOrder" | "name" | "price" | "discount" | "createdAt">("sortOrder");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BundleWithItems | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Product search state inside modal
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  // Bundle Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formBundlePrice, setFormBundlePrice] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<"active" | "draft">("active");
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formItems, setFormItems] = useState<
    Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
      product?: any;
    }>
  >([]);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const isFeatured = statusFilter === "featured" ? true : undefined;
      const statusParam = statusFilter === "featured" || statusFilter === "all" ? undefined : statusFilter;

      const [bundlesRes, statsRes] = await Promise.all([
        fetch(
          `/api/admin/bundles?search=${encodeURIComponent(search)}&sortBy=${sortBy}${
            statusParam ? `&status=${statusParam}` : ""
          }${isFeatured !== undefined ? `&isFeatured=true` : ""}`
        ),
        fetch("/api/admin/bundles/stats"),
      ]);

      const bundlesData = (await bundlesRes.json()) as any;
      const statsData = (await statsRes.json()) as any;

      if (bundlesData?.success) {
        setBundles(bundlesData.bundles || []);
      }
      if (statsData?.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error("Failed to load bundles data:", err);
      showFeedback("Failed to load bundles", "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search catalog products when typing in modal
  useEffect(() => {
    if (!isModalOpen || !productSearch.trim()) {
      setCatalogProducts([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearchingProducts(true);
      fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=6`)
        .then((res) => res.json() as Promise<any>)
        .then((data: any) => {
          if (data?.success && Array.isArray(data?.products)) {
            setCatalogProducts(data.products);
          }
        })
        .catch((err) => console.warn("Catalog product search error:", err))
        .finally(() => setIsSearchingProducts(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [productSearch, isModalOpen]);

  // Compute original price of items in modal
  const calculatedOriginalPrice = formItems.reduce((acc, item) => {
    const pPrice = item.product ? Number(item.product.price) : 0;
    return acc + pPrice * item.quantity;
  }, 0);

  const calculatedDiscountPercent =
    calculatedOriginalPrice > 0 && formBundlePrice < calculatedOriginalPrice
      ? Number((((calculatedOriginalPrice - formBundlePrice) / calculatedOriginalPrice) * 100).toFixed(1))
      : 0;

  const calculatedSavings = Math.max(0, calculatedOriginalPrice - formBundlePrice);

  const openCreateModal = () => {
    setEditingBundle(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormImageUrl("");
    setFormBundlePrice(0);
    setFormStatus("active");
    setFormIsFeatured(false);
    setFormSortOrder(bundles.length + 1);
    setFormItems([]);
    setProductSearch("");
    setIsModalOpen(true);
  };

  const openEditModal = (bundle: BundleWithItems) => {
    setEditingBundle(bundle);
    setFormName(bundle.name);
    setFormSlug(bundle.slug);
    setFormDescription(bundle.description || "");
    setFormImageUrl(bundle.imageUrl || "");
    setFormBundlePrice(bundle.bundlePrice);
    setFormStatus((bundle.status as "active" | "draft") || "active");
    setFormIsFeatured(Boolean(bundle.isFeatured));
    setFormSortOrder(bundle.sortOrder || 0);
    setFormItems(
      bundle.items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        quantity: it.quantity,
        product: it.product,
      }))
    );
    setProductSearch("");
    setIsModalOpen(true);
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showFeedback("Bundle name is required", "error");
      return;
    }
    if (formItems.length === 0) {
      showFeedback("Please add at least 1 product to the bundle", "error");
      return;
    }
    if (formBundlePrice <= 0) {
      showFeedback("Bundle price must be greater than 0", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim() || null,
        imageUrl: formImageUrl.trim() || null,
        bundlePrice: Number(formBundlePrice),
        status: formStatus,
        isFeatured: formIsFeatured,
        sortOrder: Number(formSortOrder),
        items: formItems.map((it, idx) => ({
          productId: it.productId,
          variantId: it.variantId || null,
          quantity: it.quantity,
          sortOrder: idx + 1,
        })),
      };

      const url = editingBundle
        ? `/api/admin/bundles/${editingBundle.id}`
        : "/api/admin/bundles";
      const method = editingBundle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (!data?.success) {
        showFeedback(data?.error || "Failed to save bundle", "error");
        return;
      }

      showFeedback(
        editingBundle ? "Bundle updated successfully" : "Bundle created successfully",
        "success"
      );
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Save bundle error:", err);
      showFeedback("Error saving bundle", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBundle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
      const data = (await res.json()) as any;
      if (data?.success) {
        showFeedback("Bundle deleted successfully", "success");
        setDeletingId(null);
        loadData();
      } else {
        showFeedback(data?.error || "Failed to delete bundle", "error");
      }
    } catch {
      showFeedback("Error deleting bundle", "error");
    }
  };

  const handleDuplicateBundle = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bundles/${id}/duplicate`, { method: "POST" });
      const data = (await res.json()) as any;
      if (data?.success) {
        showFeedback("Bundle duplicated successfully", "success");
        loadData();
      } else {
        showFeedback(data?.error || "Failed to duplicate bundle", "error");
      }
    } catch {
      showFeedback("Error duplicating bundle", "error");
    }
  };

  const handleToggleStatus = async (bundle: BundleWithItems) => {
    const nextStatus = bundle.status === "active" ? "draft" : "active";
    try {
      const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await res.json()) as any;
      if (data?.success) {
        showFeedback(`Bundle set to ${nextStatus}`, "success");
        loadData();
      }
    } catch {
      showFeedback("Failed to update status", "error");
    }
  };

  const addProductToBundle = (product: any) => {
    if (formItems.some((it) => it.productId === product.id)) {
      showFeedback("Product is already in this bundle", "error");
      return;
    }
    setFormItems((prev) => [
      ...prev,
      {
        productId: product.id,
        variantId: null,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          mainImage: product.mainImage,
        },
      },
    ]);
    setProductSearch("");
  };

  const removeProductFromBundle = (productId: string) => {
    setFormItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= formItems.length) return;
    const copy = [...formItems];
    const temp = copy[index];
    copy[index] = copy[nextIndex];
    copy[nextIndex] = temp;
    setFormItems(copy);
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`fixed top-5 right-5 z-50 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-4 ${
            feedback.type === "success" ? "bg-[#25D366]" : "bg-rose-600"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Top Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4E4E7] dark:border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white flex items-center gap-3">
            <span>Product Bundles</span>
            <span className="rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/50 px-3 py-0.5 text-xs font-bold text-[#25D366] dark:text-[#1EA855]">
              Stage 21
            </span>
          </h1>
          <p className="text-xs text-[#1EA855]/80 dark:text-zinc-400 mt-1">
            Create high-converting curated bundles with automatic discount calculations and cart breakdown.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:scale-105 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Bundle</span>
        </button>
      </div>

      {/* 4 Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-white/95 dark:bg-[#18181B]/80 p-5 shadow-sm backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-[#25D366] dark:text-zinc-400">
            Total Bundles
          </p>
          <p className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white mt-1">
            {stats.totalBundles}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-white/95 dark:bg-[#18181B]/80 p-5 shadow-sm backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-[#25D366] dark:text-zinc-400">
            Active Bundles
          </p>
          <p className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white mt-1">
            {stats.activeBundles}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-white/95 dark:bg-[#18181B]/80 p-5 shadow-sm backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-[#25D366] dark:text-zinc-400">
            Featured Bundles
          </p>
          <p className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white mt-1">
            {stats.featuredBundles}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-white/95 dark:bg-[#18181B]/80 p-5 shadow-sm backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-wider text-[#25D366] dark:text-zinc-400">
            Avg. Discount
          </p>
          <p className="text-2xl sm:text-3xl font-black text-[#25D366] dark:text-[#1EA855] mt-1">
            {stats.averageDiscountPercent}%
          </p>
        </div>
      </div>

      {/* Filters, Search & Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/60 dark:bg-[#18181B]/60 p-3 rounded-2xl border border-[#E4E4E7]/70 dark:border-zinc-800/50 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search bundles by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B]/40 px-3.5 py-2 pl-9 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center rounded-xl bg-[#DCFCE7] dark:bg-[#18181B]/50 p-1">
            {(["all", "active", "draft", "featured"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition ${
                  statusFilter === st
                    ? "bg-white dark:bg-[#18181B] text-[#25D366] dark:text-[#DCFCE7] shadow-sm"
                    : "text-[#1EA855] dark:text-zinc-400 hover:text-[#18181B]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B]/40 px-3 py-1.5 text-xs font-semibold text-[#18181B] dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          >
            <option value="sortOrder">Sort Order</option>
            <option value="name">Name</option>
            <option value="price">Bundle Price</option>
            <option value="discount">Discount %</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>
      </div>

      {/* Bundles List Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-white dark:bg-[#18181B]/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E4E4E7]/60 dark:border-zinc-800/40 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 text-[#18181B] dark:text-zinc-300 font-bold uppercase tracking-wider">
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Name & Slug</th>
                <th className="p-4 text-center">Products</th>
                <th className="p-4">Bundle Price</th>
                <th className="p-4">Original Price</th>
                <th className="p-4 text-center">Discount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 dark:divide-zinc-200 dark:divide-zinc-800 text-[#18181B] dark:text-zinc-200 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#25D366] border-r-transparent mb-2" />
                    <p>Loading bundles...</p>
                  </td>
                </tr>
              ) : bundles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-zinc-400">
                    No bundles found. Click &quot;Create Bundle&quot; to build your first bundle!
                  </td>
                </tr>
              ) : (
                bundles.map((b) => {
                  const img = b.imageUrl
                    ? normalizeImageUrl(b.imageUrl, { width: 96, quality: 75 })
                    : null;

                  return (
                    <tr key={b.id} className="hover:bg-[#F4F4F5]/40 dark:hover:bg-[#18181B]/30 transition">
                      {/* Image */}
                      <td className="p-4">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5] flex items-center justify-center">
                          {img ? (
                            <Image src={img} alt={b.name} fill className="object-cover" />
                          ) : (
                            <span className="text-[10px] text-zinc-400">PKG</span>
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="p-4">
                        <div className="space-y-0.5 max-w-xs">
                          <p className="font-bold text-sm text-[#18181B] dark:text-white line-clamp-1">
                            {b.name}
                          </p>
                          <p className="text-[11px] text-[#25D366]/80 dark:text-zinc-400 font-mono">
                            /{b.slug}
                          </p>
                          {Boolean(b.isFeatured) && (
                            <span className="inline-block rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/40 text-[#25D366] dark:text-[#DCFCE7] text-[9px] font-bold px-1.5 py-0.2">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Products Count */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/50 px-2.5 py-1 text-xs font-bold text-[#25D366] dark:text-[#1EA855]">
                          {b.items.length} items
                        </span>
                      </td>

                      {/* Bundle Price */}
                      <td className="p-4 font-black text-sm text-[#25D366] dark:text-[#1EA855]">
                        ${b.bundlePrice.toFixed(2)}
                      </td>

                      {/* Original Price */}
                      <td className="p-4 text-zinc-400 line-through text-xs font-semibold">
                        ${b.originalPrice.toFixed(2)}
                      </td>

                      {/* Discount % */}
                      <td className="p-4 text-center">
                        <span className="rounded-full bg-[#25D366]/15 dark:bg-[#25D366]/30 text-[#1EA855] dark:text-zinc-300 px-2 py-0.5 text-xs font-extrabold">
                          -{b.discountPercentage || 0}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(b)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                            b.status === "active"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {b.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View on Storefront */}
                          <Link
                            href={`/bundles/${b.slug}`}
                            target="_blank"
                            className="p-1.5 text-[#25D366] dark:text-zinc-400 hover:text-[#25D366] transition"
                            title="View on Storefront"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(b)}
                            className="p-1.5 text-[#25D366] dark:text-zinc-400 hover:text-[#25D366] transition"
                            title="Edit Bundle"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateBundle(b.id)}
                            className="p-1.5 text-[#25D366] dark:text-zinc-400 hover:text-[#25D366] transition"
                            title="Duplicate Bundle"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeletingId(b.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 transition"
                            title="Delete Bundle"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-[#18181B] dark:text-white">
              Delete this Bundle?
            </h3>
            <p className="text-xs text-[#1EA855]/80 dark:text-zinc-400">
              This action will permanently delete the bundle and its item associations. Individual products in your catalog will not be deleted.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-[#E4E4E7] px-4 py-2 text-xs font-bold text-[#1EA855] dark:text-zinc-300 hover:bg-[#F4F4F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBundle(deletingId)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Delete Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Bundle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#18181B] p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[#E4E4E7]/60 dark:border-zinc-800/40 pb-4">
              <h2 className="text-lg font-black text-[#18181B] dark:text-white">
                {editingBundle ? "Edit Bundle" : "Create New Bundle"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-[#25D366] text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBundle} className="space-y-5 text-xs">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#18181B] dark:text-zinc-300 mb-1">
                    Bundle Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Endurance Performance Trio"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!editingBundle) {
                        setFormSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, "")
                            .replace(/[\s_-]+/g, "-")
                        );
                      }
                    }}
                    className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18181B] dark:text-zinc-300 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated-slug"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#18181B] dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what makes this bundle special and why customers should buy it together..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-[#18181B] dark:text-zinc-300 mb-1">
                  Bundle Image URL (Optional - defaults to first product image)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                />
              </div>

              {/* Products in Bundle Selector */}
              <div className="space-y-3 border-t border-[#E4E4E7]/60 dark:border-zinc-800/40 pt-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#18181B] dark:text-zinc-300">
                    Products in this Bundle ({formItems.length})
                  </label>
                </div>

                {/* Add Product Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product name or SKU to add..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B]/60 px-3.5 py-2 pl-9 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#25D366] focus:outline-none"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {isSearchingProducts && (
                    <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-[#25D366] border-r-transparent" />
                  )}

                  {/* Dropdown Results */}
                  {catalogProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B] shadow-2xl divide-y divide-zinc-200 dark:divide-zinc-800 dark:divide-zinc-200 dark:divide-zinc-800">
                      {catalogProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2.5 hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/40 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-[#F4F4F5]">
                              {p.mainImage && (
                                <Image
                                  src={normalizeImageUrl(p.mainImage, { width: 64, quality: 70 })}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-xs text-[#18181B] dark:text-white line-clamp-1">
                                {p.name}
                              </p>
                              <p className="text-[11px] font-semibold text-[#25D366]">
                                ${Number(p.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addProductToBundle(p)}
                            className="rounded-lg bg-[#25D366] text-white px-2.5 py-1 text-[10px] font-bold hover:bg-[#1EA855]"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Products List */}
                <div className="space-y-2 max-h-56 overflow-y-auto rounded-xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 p-2 bg-[#F4F4F5]/30 dark:bg-[#18181B]/20">
                  {formItems.length === 0 ? (
                    <p className="text-center text-xs text-zinc-400 py-4">
                      No products added to this bundle yet.
                    </p>
                  ) : (
                    formItems.map((item, idx) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#E4E4E7]/60 dark:border-zinc-800/40 bg-white dark:bg-[#18181B] p-2.5 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-[#F4F4F5]">
                            {item.product?.mainImage && (
                              <Image
                                src={normalizeImageUrl(item.product.mainImage, { width: 80, quality: 70 })}
                                alt={item.product?.name || "Product"}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#18181B] dark:text-white line-clamp-1">
                              {item.product?.name || item.productId}
                            </p>
                            <p className="text-[11px] font-bold text-[#25D366]">
                              ${Number(item.product?.price || 0).toFixed(2)} each
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-400 font-bold">Qty:</span>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const q = Math.max(1, parseInt(e.target.value) || 1);
                                setFormItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it))
                                );
                              }}
                              className="w-14 rounded-lg border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 px-2 py-1 text-center font-bold text-xs"
                            />
                          </div>

                          {/* Reorder buttons */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveItem(idx, "up")}
                              className="text-zinc-400 hover:text-[#1EA855] disabled:opacity-20 text-[10px]"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === formItems.length - 1}
                              onClick={() => moveItem(idx, "down")}
                              className="text-zinc-400 hover:text-[#1EA855] disabled:opacity-20 text-[10px]"
                            >
                              ▼
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeProductFromBundle(item.productId)}
                            className="text-rose-500 hover:text-rose-700 text-base font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pricing Breakdown Card */}
              <div className="rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-700 bg-[#DCFCE7]/50 dark:bg-[#18181B]/60 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#18181B] dark:text-zinc-300">
                      Original Total Price
                    </label>
                    <p className="text-base font-black text-zinc-600 dark:text-zinc-400 mt-1">
                      ${calculatedOriginalPrice.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#18181B] dark:text-zinc-300">
                      Bundle Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      value={formBundlePrice || ""}
                      onChange={(e) => setFormBundlePrice(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B] px-3 py-1.5 text-sm font-black text-[#25D366] dark:text-[#DCFCE7] focus:ring-2 focus:ring-[#25D366] focus:outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#18181B] dark:text-zinc-300">
                      Auto-Calculated Discount
                    </label>
                    <p className="text-base font-black text-[#25D366] dark:text-[#1EA855] mt-1">
                      {calculatedDiscountPercent}% OFF
                    </p>
                  </div>
                </div>

                {calculatedSavings > 0 && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ Customer saves ${calculatedSavings.toFixed(2)} with this bundle!
                  </p>
                )}
              </div>

              {/* Status, Featured & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E4E4E7]/60 dark:border-zinc-800/40 pt-4">
                <div>
                  <label className="block font-bold text-[#18181B] dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 px-3 py-2 text-xs font-semibold"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#18181B] dark:text-zinc-300 mb-1">
                    Featured on Homepage?
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormIsFeatured((prev) => !prev)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      formIsFeatured
                        ? "border-[#25D366] bg-[#25D366] text-white"
                        : "border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 text-[#1EA855] dark:text-zinc-400"
                    }`}
                  >
                    {formIsFeatured ? "★ Featured on Homepage" : "Standard"}
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-[#18181B] dark:text-zinc-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-[#E4E4E7] dark:border-zinc-700 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E4E7]/60 dark:border-zinc-800/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E4E4E7] dark:border-zinc-700 px-4 py-2.5 text-xs font-bold text-[#1EA855] dark:text-zinc-300 hover:bg-[#F4F4F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#25D366]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving Bundle..." : editingBundle ? "Update Bundle" : "Create Bundle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

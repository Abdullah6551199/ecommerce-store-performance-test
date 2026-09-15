"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { CouponRecord } from "@/lib/coupons";

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalDiscountsGiven: number;
  mostUsedCoupon: { code: string; count: number };
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
}

export default function CouponsManager(): React.JSX.Element {
  const [couponsList, setCouponsList] = useState<CouponRecord[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "scheduled" | "inactive">("all");
  const [sortBy, setSortBy] = useState("createdAt_desc");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [deletingCoupon, setDeletingCoupon] = useState<CouponRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage" as CouponRecord["type"],
    value: 10,
    minOrderValue: "" as string | number,
    maxDiscount: "" as string | number,
    applyTo: "all" as "all" | "category" | "product",
    applyToId: "",
    buyQuantity: "" as string | number,
    getQuantity: "" as string | number,
    usageLimit: "" as string | number,
    perCustomerLimit: 1,
    startDate: "",
    endDate: "",
    firstOrderOnly: false,
    isVisible: true,
    isAutoApply: false,
    isFeatured: false,
    isActive: true,
  });

  // Fetch coupons, stats, and catalog metadata
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sortBy) params.set("sort", sortBy);

      const [couponsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/coupons?${params.toString()}`),
        fetch("/api/admin/coupons/stats"),
      ]);

      const couponsJson = (await couponsRes.json()) as any;
      const statsJson = (await statsRes.json()) as any;

      if (!couponsRes.ok || !couponsJson.success) {
        throw new Error(couponsJson.error || "Failed to fetch coupons");
      }

      setCouponsList(couponsJson.data || []);
      if (statsJson.success && statsJson.data) {
        setStats(statsJson.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching coupon data");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  // Load categories and products for target dropdowns once
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/products?limit=100"),
        ]);
        const catJson = (await catRes.json()) as any;
        const prodJson = (await prodRes.json()) as any;

        if (catJson.success && catJson.data?.categories) {
          setCategories(catJson.data.categories.map((c: any) => ({ id: c.id, name: c.name })));
        }
        if (prodJson.success && prodJson.data?.products) {
          setProducts(prodJson.data.products.map((p: any) => ({ id: p.id, name: p.name })));
        }
      } catch {
        // Non-blocking
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      type: "percentage",
      value: 10,
      minOrderValue: "",
      maxDiscount: "",
      applyTo: "all",
      applyToId: "",
      buyQuantity: "",
      getQuantity: "",
      usageLimit: "",
      perCustomerLimit: 1,
      startDate: "",
      endDate: "",
      firstOrderOnly: false,
      isVisible: true,
      isAutoApply: false,
      isFeatured: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CouponRecord) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || "",
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue ?? "",
      maxDiscount: c.maxDiscount ?? "",
      applyTo: (c.applyTo as "all" | "category" | "product") || "all",
      applyToId: c.applyToId || "",
      buyQuantity: c.buyQuantity ?? "",
      getQuantity: c.getQuantity ?? "",
      usageLimit: c.usageLimit ?? "",
      perCustomerLimit: c.perCustomerLimit ?? 1,
      startDate: c.startDate ? c.startDate.slice(0, 16) : "",
      endDate: c.endDate ? c.endDate.slice(0, 16) : "",
      firstOrderOnly: Boolean(c.firstOrderOnly),
      isVisible: Boolean(c.isVisible),
      isAutoApply: Boolean(c.isAutoApply),
      isFeatured: Boolean(c.isFeatured),
      isActive: Boolean(c.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast("Please provide a valid coupon code", "error");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        value: Number(formData.value),
        minOrderValue: formData.minOrderValue === "" ? null : Number(formData.minOrderValue),
        maxDiscount: formData.maxDiscount === "" ? null : Number(formData.maxDiscount),
        applyTo: formData.applyTo,
        applyToId: formData.applyToId || null,
        buyQuantity: formData.buyQuantity === "" ? null : Number(formData.buyQuantity),
        getQuantity: formData.getQuantity === "" ? null : Number(formData.getQuantity),
        usageLimit: formData.usageLimit === "" ? null : Number(formData.usageLimit),
        perCustomerLimit: Number(formData.perCustomerLimit || 1),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        firstOrderOnly: formData.firstOrderOnly,
        isVisible: formData.isVisible,
        isAutoApply: formData.isAutoApply,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save coupon");
      }

      showToast(
        editingCoupon
          ? `Coupon ${payload.code} updated successfully!`
          : `Coupon ${payload.code} created successfully!`
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (c: CouponRecord) => {
    const nextState = !c.isActive;
    // Optimistic update
    setCouponsList((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, isActive: nextState } : item))
    );

    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to toggle status");
      }
      showToast(`Coupon ${c.code} is now ${nextState ? "Active" : "Inactive"}`);
      fetchData();
    } catch (err) {
      // Revert optimistic update
      setCouponsList((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, isActive: c.isActive } : item))
      );
      showToast(err instanceof Error ? err.message : "Toggle failed", "error");
    }
  };

  const handleDuplicate = async (c: CouponRecord) => {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}/duplicate`, {
        method: "POST",
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to duplicate coupon");
      }
      showToast(`Coupon ${c.code} duplicated as ${json.data?.code}!`);
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Duplicate error", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/coupons/${deletingCoupon.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete coupon");
      }
      showToast(`Coupon ${deletingCoupon.code} deleted successfully`);
      setDeletingCoupon(null);
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete error", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Copied code "${text}" to clipboard!`);
    }
  };

  const formatCouponType = (type: string) => {
    switch (type) {
      case "percentage":
        return "Percentage";
      case "fixed":
        return "Fixed Amount";
      case "free_shipping":
        return "Free Shipping";
      case "buy_x_get_y":
        return "Buy X Get Y";
      case "category":
        return "Category Specific";
      case "product":
        return "Product Specific";
      case "min_order":
        return "Minimum Order";
      case "first_order":
        return "First Order Only";
      default:
        return type;
    }
  };

  const formatDiscountDisplay = (c: CouponRecord) => {
    switch (c.type) {
      case "percentage":
      case "min_order":
      case "first_order":
      case "category":
        return `${c.value}% OFF`;
      case "fixed":
      case "product":
        return `$${c.value.toFixed(2)} OFF`;
      case "free_shipping":
        return "Free Shipping";
      case "buy_x_get_y":
        return `Buy ${c.buyQuantity || 2} Get ${c.getQuantity || 1} Free`;
      default:
        return `${c.value}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md border transition-all animate-in fade-in slide-in-from-top-4 ${
            feedback.type === "success"
              ? "border-[#18C729]/30 bg-[#0a150e]/95 text-white"
              : "border-red-500/30 bg-[#1c0c0c]/95 text-red-100"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <span>Coupons & Discounts</span>
            <span className="rounded-full bg-[#18C729]/15 px-3 py-0.5 text-xs font-mono font-bold text-[#18C729]">
              {couponsList.length}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">
            Manage promotional codes, automated cart incentives, and custom order discounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2.5 text-xs font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider">
            Total Coupons
          </p>
          <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {stats?.totalCoupons ?? couponsList.length}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-white/40 mt-0.5">Across all campaigns</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider">
            Active Coupons
          </p>
          <p className="text-2xl font-black text-[#18C729] mt-1">
            {stats?.activeCoupons ?? couponsList.filter((c) => c.isActive).length}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-white/40 mt-0.5">Ready to redeem</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider">
            Total Discounts Given
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-[#FEF500] mt-1">
            ${(stats?.totalDiscountsGiven ?? 0).toFixed(2)}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-white/40 mt-0.5">Customer savings</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider">
            Most Used Coupon
          </p>
          <p className="text-lg font-black text-zinc-900 dark:text-white mt-1 truncate">
            {stats?.mostUsedCoupon?.code || "None"}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-white/40 mt-0.5">
            {stats?.mostUsedCoupon?.count ? `${stats.mostUsedCoupon.count} redemptions` : "No usage yet"}
          </p>
        </div>
      </div>

      {/* Controls Bar: Search, Status Filter, Sort */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or description..."
            className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3.5 py-2 pl-9 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-[#18C729]"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(["all", "active", "expired", "scheduled", "inactive"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#18C729] text-black"
                  : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-[11px] text-zinc-400 dark:text-white/40">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729] cursor-pointer"
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="expiry_asc">Expiry Date</option>
            <option value="usage_desc">Most Used</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0d1611] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-zinc-100 dark:bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-red-500 mb-3">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="rounded-xl bg-zinc-100 dark:bg-white/10 px-4 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : couponsList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5 mx-auto mb-4 text-zinc-400 dark:text-white/40">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">No coupons found</p>
            <p className="text-xs text-zinc-500 dark:text-white/50 mt-1 max-w-sm mx-auto">
              No coupons match your current filters. Create a new campaign code or clear your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 text-zinc-500 dark:text-white/50 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Discount</th>
                  <th className="px-5 py-3.5">Usage</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Expiry</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5 text-zinc-800 dark:text-white/80">
                {couponsList.map((c) => {
                  const isExpired = c.endDate && new Date(c.endDate) < new Date();
                  const isScheduled = c.startDate && new Date(c.startDate) > new Date();

                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-zinc-900 dark:text-white text-sm">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(c.code)}
                            className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white p-1 rounded-md transition-colors"
                            title="Copy code"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-white/50 truncate max-w-xs mt-0.5">
                            {c.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {c.isFeatured && (
                            <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 text-[9px] font-bold">
                              Featured
                            </span>
                          )}
                          {c.isAutoApply && (
                            <span className="rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 text-[9px] font-bold">
                              Auto-Apply
                            </span>
                          )}
                          {c.firstOrderOnly && (
                            <span className="rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 text-[9px] font-bold">
                              1st Order
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:text-white/70 whitespace-nowrap">
                          {formatCouponType(c.type)}
                        </span>
                      </td>

                      {/* Discount Value */}
                      <td className="px-5 py-4 font-bold text-zinc-900 dark:text-white">
                        <div>{formatDiscountDisplay(c)}</div>
                        {c.minOrderValue && c.minOrderValue > 0 ? (
                          <div className="text-[10px] text-zinc-400 dark:text-white/40 mt-0.5">
                            Min order: ${c.minOrderValue.toFixed(2)}
                          </div>
                        ) : null}
                      </td>

                      {/* Usage */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-zinc-700 dark:text-white/70">
                          <strong>{c.usedCount}</strong> / {c.usageLimit ?? "∞"}
                        </div>
                        {c.usageLimit && c.usageLimit > 0 && (
                          <div className="h-1.5 w-20 bg-zinc-100 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full bg-[#18C729]"
                              style={{
                                width: `${Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100))}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                            !c.isActive
                              ? "bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-white/50"
                              : isExpired
                              ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                              : isScheduled
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-[#18C729]/15 text-[#18C729] border border-[#18C729]/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              !c.isActive
                                ? "bg-zinc-400"
                                : isExpired
                                ? "bg-red-500"
                                : isScheduled
                                ? "bg-amber-500"
                                : "bg-[#18C729]"
                            }`}
                          />
                          <span>
                            {!c.isActive
                              ? "Inactive"
                              : isExpired
                              ? "Expired"
                              : isScheduled
                              ? "Scheduled"
                              : "Active"}
                          </span>
                        </button>
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4 text-zinc-500 dark:text-white/50 whitespace-nowrap">
                        {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Never"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="rounded-lg p-1.5 text-zinc-500 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title="Edit Coupon"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(c)}
                            className="rounded-lg p-1.5 text-zinc-500 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title="Duplicate Coupon"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingCoupon(c)}
                            className="rounded-lg p-1.5 text-zinc-500 dark:text-white/60 hover:bg-red-500/15 hover:text-red-500 transition-colors"
                            title="Delete Coupon"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0c140f] p-6 shadow-2xl text-zinc-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-5">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editingCoupon ? `Edit Coupon "${editingCoupon.code}"` : "Create New Coupon"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Row 1: Code & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount Discount ($)</option>
                    <option value="free_shipping">Free Shipping</option>
                    <option value="buy_x_get_y">Buy X Get Y Free</option>
                    <option value="category">Category-Specific (%)</option>
                    <option value="product">Product-Specific ($/%)</option>
                    <option value="min_order">Minimum Order Spend (%)</option>
                    <option value="first_order">First Order Only (%)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 10% off your entire summer order"
                  className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                />
              </div>

              {/* Row 2: Value, Min Order, Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Value {formData.type === "percentage" || formData.type === "category" || formData.type === "min_order" || formData.type === "first_order" ? "(%)" : "($)"} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Min Order Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Max Discount Cap ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Optional cap"
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>
              </div>

              {/* Conditional targeting: Category or Product */}
              {(formData.type === "category" || formData.applyTo === "category") && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Target Category
                  </label>
                  <select
                    value={formData.applyToId}
                    onChange={(e) => setFormData({ ...formData, applyToId: e.target.value, applyTo: "category" })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(formData.type === "product" || formData.applyTo === "product") && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Target Product
                  </label>
                  <select
                    value={formData.applyToId}
                    onChange={(e) => setFormData({ ...formData, applyToId: e.target.value, applyTo: "product" })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional Buy X Get Y */}
              {formData.type === "buy_x_get_y" && (
                <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                      Buy Quantity (X)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.buyQuantity}
                      onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })}
                      placeholder="e.g. 2"
                      className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                      Get Free Quantity (Y)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.getQuantity}
                      onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })}
                      placeholder="e.g. 1"
                      className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                    />
                  </div>
                </div>
              )}

              {/* Row 3: Limits & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Per-Customer Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perCustomerLimit}
                    onChange={(e) => setFormData({ ...formData, perCustomerLimit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/70 mb-1">
                    End Date & Time (Expiry)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#18C729]"
                  />
                </div>
              </div>

              {/* Toggles & Visibility */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-white/20 text-[#18C729] focus:ring-0"
                  />
                  <span>Show in List</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAutoApply}
                    onChange={(e) => setFormData({ ...formData, isAutoApply: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-white/20 text-[#18C729] focus:ring-0"
                  />
                  <span>Auto-Apply</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-white/20 text-[#18C729] focus:ring-0"
                  />
                  <span>Featured</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-white/20 text-[#18C729] focus:ring-0"
                  />
                  <span>Active</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-6 py-2.5 text-xs font-bold text-black hover:brightness-110 shadow-lg shadow-[#18C729]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0c140f] p-6 shadow-2xl text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-500 mx-auto mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Delete Coupon &quot;{deletingCoupon.code}&quot;?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-white/50 mt-1 mb-6">
              This action cannot be undone. Any historical redemptions will remain recorded in past orders.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

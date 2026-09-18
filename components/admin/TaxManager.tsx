"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { TaxRateRecord, TaxSettingRecord } from "@/lib/db";
import { fetchWithClientCache, invalidateClientCache } from "@/lib/client-cache";
import Toggle from "@/components/ui/Toggle";

const COMMON_COUNTRIES = [
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "BD", name: "Bangladesh" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function TaxManager(): React.JSX.Element {
  const [rates, setRates] = useState<TaxRateRecord[]>([]);
  const [settings, setSettings] = useState<TaxSettingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState("country_asc");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Selected items for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRateRecord | null>(null);
  const [isSavingRate, setIsSavingRate] = useState(false);

  // Rate Form state
  const [rateForm, setRateForm] = useState({
    country: "PK",
    state: "",
    city: "",
    rate: 17,
    label: "GST",
    taxType: "exclusive" as "inclusive" | "exclusive",
    isActive: true,
  });

  // Settings Form state
  const [settingsForm, setSettingsForm] = useState({
    isEnabled: true,
    defaultRate: 0,
    defaultLabel: "Tax",
    defaultTaxType: "exclusive" as "inclusive" | "exclusive",
    applyToShipping: false,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Fetch rates and settings
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sortBy) params.set("sort", sortBy);

      const [ratesJson, settingsJson] = await Promise.all([
        fetchWithClientCache<{ data: TaxRateRecord[] }>(
          `/api/admin/tax/rates?${params.toString()}`,
          { forceRefresh }
        ),
        fetchWithClientCache<{ data: TaxSettingRecord }>("/api/admin/tax/settings", {
          forceRefresh,
        }),
      ]);

      if (ratesJson.success) {
        setRates((ratesJson.data as any)?.data || ratesJson.data || []);
      }
      if (settingsJson.success && (settingsJson.data || (settingsJson as any).settings)) {
        const s = (settingsJson.data as any)?.settings || settingsJson.data;
        if (s) {
          setSettings(s);
          setSettingsForm({
            isEnabled: Boolean(s.isEnabled),
            defaultRate: Number(s.defaultRate) || 0,
            defaultLabel: s.defaultLabel || "Tax",
            defaultTaxType: (s.defaultTaxType as "inclusive" | "exclusive") || "exclusive",
            applyToShipping: Boolean(s.applyToShipping),
          });
        }
      }
    } catch (err) {
      console.error("Failed to load tax data:", err);
      showToast("Error loading tax configuration", "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      const res = await fetch("/api/admin/tax/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update tax settings");
      setSettings(json.data);
      showToast("Global tax settings updated successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error updating tax settings", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Quick Preset Loader
  const handleLoadPreset = async (countryCode: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/tax/presets/${countryCode}`, { method: "POST" });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load preset");
      showToast(json.message || `Loaded preset rates for ${countryCode}`);
      invalidateClientCache("/api/admin/tax");
      await fetchData(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error loading preset", "error");
      setIsLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingRate(null);
    setRateForm({
      country: "PK",
      state: "",
      city: "",
      rate: 17,
      label: "GST",
      taxType: "exclusive",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rate: TaxRateRecord) => {
    setEditingRate(rate);
    setRateForm({
      country: rate.country,
      state: rate.state || "",
      city: rate.city || "",
      rate: Number(rate.rate),
      label: rate.label || "Tax",
      taxType: (rate.taxType as "inclusive" | "exclusive") || "exclusive",
      isActive: Boolean(rate.isActive),
    });
    setIsModalOpen(true);
  };

  // Save Rate (Create or Edit)
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingRate(true);
      const url = editingRate ? `/api/admin/tax/rates/${editingRate.id}` : "/api/admin/tax/rates";
      const method = editingRate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rateForm,
          state: rateForm.state ? rateForm.state.trim().toUpperCase() : null,
          city: rateForm.city ? rateForm.city.trim() : null,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save tax rate");

      showToast(editingRate ? "Tax rate updated" : "Tax rate created");
      setIsModalOpen(false);
      invalidateClientCache("/api/admin/tax");
      fetchData(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error saving tax rate", "error");
    } finally {
      setIsSavingRate(false);
    }
  };

  // Delete Rate
  const handleDeleteRate = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete tax rate "${label}"?`)) return;
    try {
      const res = await fetch(`/api/admin/tax/rates/${id}`, { method: "DELETE" });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete tax rate");
      showToast("Tax rate deleted");
      invalidateClientCache("/api/admin/tax");
      fetchData(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error deleting rate", "error");
    }
  };

  // Toggle Active
  const handleToggleActive = async (rate: TaxRateRecord) => {
    try {
      const res = await fetch(`/api/admin/tax/rates/${rate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rate.isActive }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to toggle status");
      setRates((prev) =>
        prev.map((r) => (r.id === rate.id ? { ...r, isActive: !r.isActive } : r))
      );
      showToast(`Tax rate ${!rate.isActive ? "activated" : "deactivated"}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Status update failed", "error");
    }
  };

  // Bulk Operations
  const handleSelectAll = () => {
    if (selectedIds.length === rates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rates.map((r) => r.id));
    }
  };

  const handleBulkToggle = async (active: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      setIsLoading(true);
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/tax/rates/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: active }),
          })
        )
      );
      showToast(`${selectedIds.length} tax rate(s) ${active ? "activated" : "deactivated"}`);
      setSelectedIds([]);
      invalidateClientCache("/api/admin/tax");
      fetchData(true);
    } catch {
      showToast("Bulk status update failed", "error");
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} tax rate(s)?`)) return;
    try {
      setIsLoading(true);
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/tax/rates/${id}`, { method: "DELETE" })
        )
      );
      showToast(`${selectedIds.length} tax rate(s) deleted`);
      setSelectedIds([]);
      invalidateClientCache("/api/admin/tax");
      fetchData(true);
    } catch {
      showToast("Bulk delete failed", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-2xl border px-5 py-3 text-xs font-bold shadow-2xl backdrop-blur-md transition-all ${
            feedback.type === "success"
              ? "border-purple-500/40 bg-purple-950/90 text-purple-100"
              : "border-red-500/40 bg-red-950/90 text-red-100"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-800/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3C0561] dark:text-[#EACFFC] flex items-center gap-2.5">
            <span>Tax Management</span>
            <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-3 py-0.5 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
              {rates.length} Rates
            </span>
          </h1>
          <p className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-1">
            Configure global tax settings, country-specific rates, and Cloudflare visitor IP detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Tax Rate</span>
          </button>
        </div>
      </div>

      {/* 1. Global Tax Settings Card */}
      <div className="rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-800/40 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#3C0561] dark:text-[#EACFFC]">Global Tax Settings</h2>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
              Controls whether tax calculation is enabled store-wide and default behavior.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${settingsForm.isEnabled ? "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
              {settingsForm.isEnabled ? "Tax Enabled" : "Tax Disabled"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-purple-100 dark:border-purple-800/50 bg-purple-50/40 dark:bg-purple-950/30">
            <div>
              <p className="text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]">Enable Tax</p>
              <p className="text-[10px] text-purple-600/70 dark:text-purple-300/70">Show tax at checkout</p>
            </div>
            <Toggle
              size="sm"
              checked={settingsForm.isEnabled}
              onChange={(val) => setSettingsForm({ ...settingsForm, isEnabled: val })}
              aria-label="Enable Tax"
            />
          </div>

          {/* Apply to Shipping Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-purple-100 dark:border-purple-800/50 bg-purple-50/40 dark:bg-purple-950/30">
            <div>
              <p className="text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]">Tax on Shipping</p>
              <p className="text-[10px] text-purple-600/70 dark:text-purple-300/70">Apply tax to shipping fees</p>
            </div>
            <Toggle
              size="sm"
              checked={settingsForm.applyToShipping}
              onChange={(val) => setSettingsForm({ ...settingsForm, applyToShipping: val })}
              aria-label="Tax on Shipping"
            />
          </div>

          {/* Default Label */}
          <div>
            <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
              Default Tax Label
            </label>
            <input
              type="text"
              value={settingsForm.defaultLabel}
              onChange={(e) => setSettingsForm({ ...settingsForm, defaultLabel: e.target.value })}
              placeholder="e.g. Sales Tax, GST"
              className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Default Rate & Tax Type */}
          <div>
            <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
              Default Fallback Rate (%)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settingsForm.defaultRate}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultRate: parseFloat(e.target.value) || 0 })}
                className="w-24 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
              <select
                value={settingsForm.defaultTaxType}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultTaxType: e.target.value as any })}
                className="flex-1 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/50 px-2 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
              >
                <option value="exclusive">Exclusive</option>
                <option value="inclusive">Inclusive</option>
              </select>
              <button
                type="submit"
                disabled={isSavingSettings}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingSettings ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. Quick Preset Buttons Bar */}
      <div className="rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#3C0561] dark:text-[#EACFFC]">Quick Pre-set Tax Rates</p>
            <p className="text-[11px] text-purple-600/70 dark:text-purple-300/70">
              One-click install standard official tax rates for common countries.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadPreset("PK")}
              className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-100 transition-colors cursor-pointer"
            >
              🇵🇰 Pakistan (17% GST)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset("IN")}
              className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-100 transition-colors cursor-pointer"
            >
              🇮🇳 India (18% GST)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset("US")}
              className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-100 transition-colors cursor-pointer"
            >
              🇺🇸 USA (State-based)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset("GB")}
              className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-100 transition-colors cursor-pointer"
            >
              🇬🇧 UK (20% VAT)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset("AE")}
              className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-100 transition-colors cursor-pointer"
            >
              🇦🇪 UAE (5% VAT)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filter & Bulk Actions Bar */}
      <div className="rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by country, state, city, label..."
              className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/40 px-3.5 py-2 pl-9 text-xs font-medium text-zinc-900 dark:text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
          >
            <option value="country_asc">Country (A-Z)</option>
            <option value="country_desc">Country (Z-A)</option>
            <option value="rate_desc">Rate (High to Low)</option>
            <option value="rate_asc">Rate (Low to High)</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={() => handleBulkToggle(true)}
              className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
            >
              Enable
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => handleBulkToggle(false)}
              className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
            >
              Disable
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* 4. Tax Rates Table */}
      <div className="overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-purple-100 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/40 text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === rates.length && rates.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-purple-300"
                  />
                </th>
                <th className="py-4 px-3">Country</th>
                <th className="py-4 px-3">State / Region</th>
                <th className="py-4 px-3">City</th>
                <th className="py-4 px-3">Rate</th>
                <th className="py-4 px-3">Label</th>
                <th className="py-4 px-3">Type</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-purple-800/40 text-zinc-900 dark:text-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-purple-600 dark:text-purple-300">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
                    Loading tax rates...
                  </td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-purple-600/70 dark:text-purple-300/70">
                    No tax rates found matching your filters.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => {
                  const isChecked = selectedIds.includes(rate.id);
                  return (
                    <tr
                      key={rate.id}
                      className={`hover:bg-purple-50/40 dark:hover:bg-purple-900/20 transition-colors ${
                        isChecked ? "bg-purple-50/60 dark:bg-purple-900/30" : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, rate.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== rate.id));
                            }
                          }}
                          className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-purple-300"
                        />
                      </td>

                      {/* Country */}
                      <td className="py-4 px-3 font-bold flex items-center gap-1.5">
                        <span className="font-mono bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded text-[11px] text-purple-800 dark:text-purple-200">
                          {rate.country}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400 font-normal">
                          {COMMON_COUNTRIES.find((c) => c.code === rate.country)?.name || ""}
                        </span>
                      </td>

                      {/* State */}
                      <td className="py-4 px-3 font-mono text-[11px]">
                        {rate.state ? (
                          <span className="bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                            {rate.state}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600 italic">All States</span>
                        )}
                      </td>

                      {/* City */}
                      <td className="py-4 px-3 text-xs">
                        {rate.city || <span className="text-zinc-400 dark:text-zinc-600 italic">All Cities</span>}
                      </td>

                      {/* Rate */}
                      <td className="py-4 px-3 font-mono font-bold text-sm text-[#3C0561] dark:text-[#EACFFC]">
                        {Number(rate.rate).toFixed(2)}%
                      </td>

                      {/* Label */}
                      <td className="py-4 px-3 font-semibold text-xs">
                        {rate.label || "Tax"}
                      </td>

                      {/* Type */}
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rate.taxType === "inclusive"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                          }`}
                        >
                          {rate.taxType === "inclusive" ? "Inclusive" : "Exclusive"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(rate)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            rate.isActive
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 hover:opacity-80"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:opacity-80"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              rate.isActive ? "bg-purple-600 dark:bg-purple-400" : "bg-zinc-400"
                            }`}
                          />
                          <span>{rate.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rate)}
                          className="text-xs font-bold text-purple-600 dark:text-purple-300 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRate(rate.id, `${rate.country} (${rate.rate}%)`)}
                          className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-[#200434] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/60 pb-4">
              <h2 className="text-lg font-bold text-[#3C0561] dark:text-[#EACFFC]">
                {editingRate ? "Edit Tax Rate" : "Add New Tax Rate"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-4">
              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={rateForm.country}
                  onChange={(e) => setRateForm({ ...rateForm, country: e.target.value })}
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  {COMMON_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                  <option value="OTHER">Other / Custom ISO</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                  State / Province Code <span className="text-purple-400 font-normal">(Optional)</span>
                </label>
                {rateForm.country === "US" ? (
                  <select
                    value={rateForm.state}
                    onChange={(e) => setRateForm({ ...rateForm, state: e.target.value })}
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All US States (Federal / Default)</option>
                    {US_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={rateForm.state}
                    onChange={(e) => setRateForm({ ...rateForm, state: e.target.value })}
                    placeholder="e.g. CA, NY, Sindh, Punjab"
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                  City <span className="text-purple-400 font-normal">(Optional for local tax)</span>
                </label>
                <input
                  type="text"
                  value={rateForm.city}
                  onChange={(e) => setRateForm({ ...rateForm, city: e.target.value })}
                  placeholder="e.g. Karachi, New York, London"
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Rate & Label grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Tax Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={rateForm.rate}
                    onChange={(e) => setRateForm({ ...rateForm, rate: parseFloat(e.target.value) || 0 })}
                    placeholder="17.0"
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Display Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rateForm.label}
                    onChange={(e) => setRateForm({ ...rateForm, label: e.target.value })}
                    placeholder="e.g. GST, VAT, Sales Tax"
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Tax Type & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Tax Type
                  </label>
                  <select
                    value={rateForm.taxType}
                    onChange={(e) => setRateForm({ ...rateForm, taxType: e.target.value as any })}
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="exclusive">Exclusive (Added to subtotal)</option>
                    <option value="inclusive">Inclusive (Included in product price)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/40 mt-3">
                  <Toggle
                    size="sm"
                    checked={rateForm.isActive}
                    onChange={(val) => setRateForm({ ...rateForm, isActive: val })}
                    label="Active"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100 dark:border-purple-800/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-purple-200 dark:border-purple-700 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRate}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingRate ? "Saving..." : editingRate ? "Update Tax Rate" : "Create Tax Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

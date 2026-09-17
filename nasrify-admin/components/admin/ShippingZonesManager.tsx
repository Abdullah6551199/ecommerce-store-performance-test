"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { ShippingZone, ShippingRateType } from "@/lib/shipping";
import { fetchWithClientCache, invalidateClientCache } from "@/lib/client-cache";

const QUICK_COUNTRIES = [
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "US", name: "USA" },
  { code: "GB", name: "UK" },
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "BD", name: "Bangladesh" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "*", name: "Rest of World (*)" },
];

export default function ShippingZonesManager(): React.JSX.Element {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCountries, setFormCountries] = useState<string[]>(["PK"]);
  const [formStates, setFormStates] = useState<string>("");
  const [formRateType, setFormRateType] = useState<ShippingRateType>("flat");
  const [formRate, setFormRate] = useState<number>(5);
  const [formFreeThreshold, setFormFreeThreshold] = useState<string>("");
  const [formMinOrder, setFormMinOrder] = useState<string>("");
  const [formDeliveryMin, setFormDeliveryMin] = useState<number>(2);
  const [formDeliveryMax, setFormDeliveryMax] = useState<number>(3);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Custom Country Input
  const [customCountryInput, setCustomCountryInput] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchZones = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const json = await fetchWithClientCache<{ data: ShippingZone[] }>(
        "/api/admin/shipping-zones",
        { forceRefresh }
      );
      if (json.success) {
        setZones((json.data as any)?.data || json.data || []);
      } else {
        throw new Error(json.error || "Failed to fetch shipping zones");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error loading zones", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Load Preset Zones
  const handleLoadPresets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/shipping-zones/presets", { method: "POST" });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load presets");
      showToast("Preset shipping zones loaded successfully");
      invalidateClientCache("/api/admin/shipping-zones");
      await fetchZones(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error loading presets", "error");
      setIsLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingZone(null);
    setFormName("");
    setFormCountries(["PK"]);
    setFormStates("");
    setFormRateType("flat");
    setFormRate(5);
    setFormFreeThreshold("100");
    setFormMinOrder("");
    setFormDeliveryMin(2);
    setFormDeliveryMax(3);
    setFormIsActive(true);
    setCustomCountryInput("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormName(zone.name);
    setFormCountries(zone.countries);
    setFormStates(zone.states ? zone.states.join(", ") : "");
    setFormRateType(zone.rateType);
    setFormRate(zone.rate);
    setFormFreeThreshold(zone.freeShippingThreshold !== null ? String(zone.freeShippingThreshold) : "");
    setFormMinOrder(zone.minOrderValue !== null ? String(zone.minOrderValue) : "");
    setFormDeliveryMin(zone.deliveryTimeMin ?? 2);
    setFormDeliveryMax(zone.deliveryTimeMax ?? 5);
    setFormIsActive(zone.isActive);
    setCustomCountryInput("");
    setIsModalOpen(true);
  };

  // Toggle Country in Chip List
  const toggleCountry = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (!upper) return;
    if (formCountries.includes(upper)) {
      setFormCountries(formCountries.filter((c) => c !== upper));
    } else {
      setFormCountries([...formCountries, upper]);
    }
  };

  // Add Custom Country Code
  const handleAddCustomCountry = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const code = customCountryInput.trim().toUpperCase();
    if (code && !formCountries.includes(code)) {
      setFormCountries([...formCountries, code]);
      setCustomCountryInput("");
    }
  };

  // Save Zone
  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formCountries.length === 0) {
      showToast("Please select at least one country for this zone", "error");
      return;
    }

    try {
      setIsSaving(true);
      const url = editingZone ? `/api/admin/shipping-zones/${editingZone.id}` : "/api/admin/shipping-zones";
      const method = editingZone ? "PUT" : "POST";

      const parsedStates = formStates
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const payload = {
        name: formName.trim(),
        countries: formCountries,
        states: parsedStates.length > 0 ? parsedStates : null,
        rateType: formRateType,
        rate: formRateType === "free" ? 0 : Number(formRate),
        freeShippingThreshold: formFreeThreshold ? parseFloat(formFreeThreshold) : null,
        minOrderValue: formMinOrder ? parseFloat(formMinOrder) : null,
        deliveryTimeMin: formDeliveryMin,
        deliveryTimeMax: formDeliveryMax,
        isActive: formIsActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save shipping zone");

      showToast(editingZone ? "Zone updated successfully" : "Zone created successfully");
      setIsModalOpen(false);
      invalidateClientCache("/api/admin/shipping-zones");
      fetchZones(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error saving zone", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Zone
  const handleDeleteZone = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete shipping zone "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/shipping-zones/${id}`, { method: "DELETE" });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete zone");
      showToast("Shipping zone deleted");
      invalidateClientCache("/api/admin/shipping-zones");
      fetchZones(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete error", "error");
    }
  };

  // Toggle Zone Active
  const handleToggleActive = async (zone: ShippingZone) => {
    try {
      const res = await fetch(`/api/admin/shipping-zones/${zone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !zone.isActive }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to toggle status");
      setZones((prev) =>
        prev.map((z) => (z.id === zone.id ? { ...z, isActive: !z.isActive } : z))
      );
      showToast(`Zone ${!zone.isActive ? "activated" : "deactivated"}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Status update failed", "error");
    }
  };

  // Move Zone Up / Down
  const handleMoveZone = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= zones.length) return;

    const newZones = [...zones];
    const [moved] = newZones.splice(index, 1);
    newZones.splice(targetIndex, 0, moved);

    // Re-assign sort orders
    const updatedWithOrder = newZones.map((z, idx) => ({ ...z, sortOrder: idx }));
    setZones(updatedWithOrder);

    try {
      await fetch("/api/admin/shipping-zones/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedWithOrder.map((z) => ({ id: z.id, sortOrder: z.sortOrder })),
        }),
      });
      showToast("Zone priority updated");
      invalidateClientCache("/api/admin/shipping-zones");
    } catch {
      showToast("Failed to persist order", "error");
      fetchZones(true);
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
            <span>Shipping Zones</span>
            <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-3 py-0.5 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
              {zones.length} Zones
            </span>
          </h1>
          <p className="text-xs text-purple-700/80 dark:text-purple-300/80 mt-1">
            Define store delivery regions, country targeting, shipping rates, and delivery time windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadPresets}
            className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-800/60 px-4 py-2.5 text-xs font-bold text-purple-900 dark:text-purple-100 transition-colors cursor-pointer"
          >
            ⚡ Load Preset Zones
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Shipping Zone</span>
          </button>
        </div>
      </div>

      {/* Zones List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-12 text-center text-purple-600 dark:text-purple-300 text-xs">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
            Loading shipping zones...
          </div>
        ) : zones.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 p-12 text-center space-y-4">
            <p className="text-sm font-bold text-[#3C0561] dark:text-[#EACFFC]">No shipping zones configured yet</p>
            <p className="text-xs text-purple-600/70 dark:text-purple-300/70 max-w-md mx-auto">
              Shipping zones allow you to charge accurate rates per country and provide estimated delivery dates.
            </p>
            <button
              type="button"
              onClick={handleLoadPresets}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              Load Standard Preset Zones
            </button>
          </div>
        ) : (
          zones.map((zone, index) => (
            <div
              key={zone.id}
              className={`rounded-2xl border transition-all p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                zone.isActive
                  ? "border-purple-100 dark:border-purple-800/60 bg-white dark:bg-[#3C0561]/20 hover:border-purple-300 dark:hover:border-purple-700"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 opacity-70"
              }`}
            >
              {/* Left: Reorder Arrows & Info */}
              <div className="flex items-start gap-3">
                {/* Up/Down buttons */}
                <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveZone(index, "up")}
                    className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-20 text-purple-600 dark:text-purple-300 cursor-pointer disabled:cursor-not-allowed"
                    title="Move priority up"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={index === zones.length - 1}
                    onClick={() => handleMoveZone(index, "down")}
                    className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-20 text-purple-600 dark:text-purple-300 cursor-pointer disabled:cursor-not-allowed"
                    title="Move priority down"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#3C0561] dark:text-[#EACFFC]">{zone.name}</h3>
                    <span className="text-[10px] font-mono text-purple-500 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full font-bold">
                      Priority #{index + 1}
                    </span>
                  </div>

                  {/* Countries chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {zone.countries.map((c) => (
                      <span
                        key={c}
                        className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200"
                      >
                        {c === "*" ? "Rest of World (*)" : c}
                      </span>
                    ))}
                    {zone.states && zone.states.length > 0 && (
                      <span className="text-[10px] text-purple-600/70 dark:text-purple-300/70 font-medium">
                        (States: {zone.states.join(", ")})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Center: Rates & Delivery Info */}
              <div className="flex flex-wrap items-center gap-6 text-xs md:px-4">
                {/* Rate */}
                <div>
                  <p className="text-[10px] font-semibold text-purple-600/70 dark:text-purple-300/70 uppercase tracking-wider">
                    Rate
                  </p>
                  <p className="text-sm font-bold font-mono text-[#3C0561] dark:text-[#EACFFC] mt-0.5">
                    {zone.rateType === "free" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">FREE</span>
                    ) : zone.rateType === "percentage" ? (
                      `${zone.rate}% of order`
                    ) : (
                      `$${Number(zone.rate).toFixed(2)} Flat`
                    )}
                  </p>
                </div>

                {/* Free Shipping Threshold */}
                {zone.freeShippingThreshold !== null && zone.freeShippingThreshold > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-purple-600/70 dark:text-purple-300/70 uppercase tracking-wider">
                      Free Threshold
                    </p>
                    <p className="text-xs font-bold font-mono text-purple-700 dark:text-purple-300 mt-0.5">
                      Orders ≥ ${Number(zone.freeShippingThreshold).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Delivery window */}
                <div>
                  <p className="text-[10px] font-semibold text-purple-600/70 dark:text-purple-300/70 uppercase tracking-wider">
                    Delivery Time
                  </p>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {zone.deliveryTimeMin ?? 2} - {zone.deliveryTimeMax ?? 5} business days
                  </p>
                </div>
              </div>

              {/* Right: Status Toggle & Actions */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleActive(zone)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    zone.isActive
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      zone.isActive ? "bg-purple-600 dark:bg-purple-400" : "bg-zinc-400"
                    }`}
                  />
                  <span>{zone.isActive ? "Active" : "Inactive"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(zone)}
                  className="rounded-xl border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/40 p-2 text-purple-600 dark:text-purple-300 transition-colors cursor-pointer"
                  title="Edit zone"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteZone(zone.id, zone.name)}
                  className="rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 p-2 text-red-500 transition-colors cursor-pointer"
                  title="Delete zone"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Zone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-100 dark:border-purple-800 bg-white dark:bg-[#200434] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/60 pb-4">
              <h2 className="text-lg font-bold text-[#3C0561] dark:text-[#EACFFC]">
                {editingZone ? `Edit Zone: ${editingZone.name}` : "Create Shipping Zone"}
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

            <form onSubmit={handleSaveZone} className="space-y-4">
              {/* Zone Name */}
              <div>
                <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                  Zone Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pakistan Domestic, North America, UAE Local"
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Countries Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200">
                    Countries Targeted ({formCountries.length}) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-purple-600/70 dark:text-purple-300/70">
                    Click to toggle or type custom ISO code below
                  </span>
                </div>

                {/* Quick chip buttons */}
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40">
                  {QUICK_COUNTRIES.map((c) => {
                    const isSelected = formCountries.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => toggleCountry(c.code)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-white dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 text-zinc-700 dark:text-zinc-300 hover:bg-purple-100"
                        }`}
                      >
                        {c.name} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>

                {/* Custom ISO Code Add */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customCountryInput}
                    onChange={(e) => setCustomCountryInput(e.target.value)}
                    onKeyDown={handleAddCustomCountry}
                    placeholder="Add custom 2-letter ISO code (e.g. IT, ES, AU)..."
                    className="flex-1 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCountry}
                    className="rounded-xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-800 dark:text-purple-200 px-4 py-2 text-xs font-bold cursor-pointer transition-colors"
                  >
                    + Add Country
                  </button>
                </div>
              </div>

              {/* Optional States / Provinces */}
              <div>
                <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                  States / Provinces Filter <span className="text-purple-400 font-normal">(Optional, comma-separated codes, e.g. CA, NY, TX)</span>
                </label>
                <input
                  type="text"
                  value={formStates}
                  onChange={(e) => setFormStates(e.target.value)}
                  placeholder="Leave empty to apply to entire country, or specify CA, NY"
                  className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Rate Type & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Rate Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRateType}
                    onChange={(e) => setFormRateType(e.target.value as any)}
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="flat">Flat Rate ($)</option>
                    <option value="percentage">Percentage of Cart (%)</option>
                    <option value="free">Always Free</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Rate Value {formRateType === "percentage" ? "(%)" : "($)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={formRateType === "free"}
                    value={formRateType === "free" ? 0 : formRate}
                    onChange={(e) => setFormRate(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Threshold & Min Order Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Free Shipping Threshold ($) <span className="text-purple-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formFreeThreshold}
                    onChange={(e) => setFormFreeThreshold(e.target.value)}
                    placeholder="e.g. 100 for orders ≥ $100"
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Minimum Order Value ($) <span className="text-purple-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Delivery Window & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Min Delivery (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDeliveryMin}
                    onChange={(e) => setFormDeliveryMin(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C0561] dark:text-purple-200 mb-1">
                    Max Delivery (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDeliveryMax}
                    onChange={(e) => setFormDeliveryMax(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-purple-950/60 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/40 self-end">
                  <span className="text-xs font-bold text-[#3C0561] dark:text-purple-200">Active Zone</span>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={isSaving}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingZone ? "Update Zone" : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

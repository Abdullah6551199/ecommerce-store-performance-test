"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { DigitalProduct, DigitalFile } from "../shared/types";
import { DigitalProductUploader } from "./DigitalProductUploader";

interface DigitalProductsManagerProps {
  initialProductId?: string; // If passed, operates in single-product embedded mode for admin.product.form.below
}

export function DigitalProductsManager({
  initialProductId,
}: DigitalProductsManagerProps): React.JSX.Element {
  const [digitalProductsList, setDigitalProductsList] = useState<
    Array<DigitalProduct & { productName?: string; productPrice?: number; productSlug?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DigitalProduct | null>(null);
  const [formProductId, setFormProductId] = useState(initialProductId || "");
  const [formFiles, setFormFiles] = useState<DigitalFile[]>([]);
  const [formDownloadLimit, setFormDownloadLimit] = useState(5);
  const [formExpiryDays, setFormExpiryDays] = useState(30);
  const [formLicenseEnabled, setFormLicenseEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  // Catalog products for picker
  const [catalogProducts, setCatalogProducts] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/apps/digital-products/list");
      const data: any = await res.json();
      if (data.success) {
        setDigitalProductsList(data.items || []);
      }
    } catch {
      showNotification("Failed to load digital products.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      setCatalogLoading(true);
      const res = await fetch("/api/admin/products?limit=100");
      const data: any = await res.json();
      if (data.products || data.data) {
        const list = data.products || data.data || [];
        setCatalogProducts(list.map((p: any) => ({ id: p.id, name: p.name || p.title, price: p.price })));
      }
    } catch {
      // Non-fatal
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadCatalog();
  }, [loadData, loadCatalog]);

  // If initialProductId is set, check if already configured
  useEffect(() => {
    if (initialProductId && digitalProductsList.length > 0) {
      const match = digitalProductsList.find((dp) => dp.productId === initialProductId);
      if (match) {
        setEditingItem(match);
        setFormProductId(match.productId);
        setFormFiles(match.files || []);
        setFormDownloadLimit(match.downloadLimit);
        setFormExpiryDays(match.expiryDays);
        setFormLicenseEnabled(match.licenseEnabled === 1);
      }
    }
  }, [initialProductId, digitalProductsList]);

  function handleOpenCreate() {
    setEditingItem(null);
    setFormProductId(initialProductId || "");
    setFormFiles([]);
    setFormDownloadLimit(5);
    setFormExpiryDays(30);
    setFormLicenseEnabled(false);
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: DigitalProduct) {
    setEditingItem(item);
    setFormProductId(item.productId);
    setFormFiles(item.files || []);
    setFormDownloadLimit(item.downloadLimit);
    setFormExpiryDays(item.expiryDays);
    setFormLicenseEnabled(item.licenseEnabled === 1);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to detach digital delivery from this product? The uploaded files will remain in R2.")) {
      return;
    }

    try {
      const res = await fetch(`/api/apps/digital-products/delete?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data: any = await res.json();
      if (data.success) {
        showNotification("Digital product detached successfully.");
        loadData();
      } else {
        showNotification(data.error || "Failed to delete digital product.", "error");
      }
    } catch {
      showNotification("Error communicating with server.", "error");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formProductId) {
      showNotification("Please select a store product.", "error");
      return;
    }
    if (formFiles.length === 0) {
      showNotification("Please upload or attach at least one downloadable file.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/apps/digital-products/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            files: formFiles,
            downloadLimit: formDownloadLimit,
            expiryDays: formExpiryDays,
            licenseEnabled: formLicenseEnabled,
          }),
        });
        const data: any = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Update failed");
        }
        showNotification("Digital product updated successfully.");
      } else {
        // Create
        const res = await fetch("/api/apps/digital-products/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: formProductId,
            files: formFiles,
            downloadLimit: formDownloadLimit,
            expiryDays: formExpiryDays,
            licenseEnabled: formLicenseEnabled,
          }),
        });
        const data: any = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Creation failed");
        }
        showNotification("Digital product created successfully.");
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to save digital product.", "error");
    } finally {
      setSaving(false);
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredList = digitalProductsList.filter((dp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = dp.productName?.toLowerCase().includes(q);
    const fileMatch = dp.files?.some((f) => f.name.toLowerCase().includes(q));
    return nameMatch || fileMatch;
  });

  // Embedded mode for admin.product.form.below
  if (initialProductId) {
    const existing = digitalProductsList.find((dp) => dp.productId === initialProductId);

    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💾</span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Digital Product Delivery
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
              App
            </span>
          </div>
          <button
            type="button"
            onClick={existing ? () => handleOpenEdit(existing) : handleOpenCreate}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EA855] shadow-sm"
          >
            {existing ? "Edit Digital Files" : "+ Attach Digital Files"}
          </button>
        </div>

        {existing ? (
          <div className="text-xs space-y-2">
            <p className="text-zinc-600 dark:text-zinc-300">
              Configured with <strong>{existing.files?.length || 0}</strong> downloadable file(s).
            </p>
            <div className="flex flex-wrap gap-2">
              {existing.files?.map((f, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] font-mono"
                >
                  📄 {f.name} ({formatFileSize(f.size)})
                </span>
              ))}
            </div>
            <div className="text-[11px] text-zinc-400 flex gap-4 pt-1">
              <span>Max Downloads: {existing.downloadLimit}</span>
              <span>Expires: {existing.expiryDays} days</span>
              <span>License Keys: {existing.licenseEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This product currently has no downloadable files attached. Click &quot;Attach Digital Files&quot; to configure instant download access after checkout.
          </p>
        )}

        {isModalOpen && renderModal()}
      </div>
    );
  }

  // Full Manager Standalone View
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Digital Products Manager
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Attach downloadable assets (PDF, ZIP, Video, Audio) to catalog products with secure tokenized links.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EA855] shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Add Digital Product
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Search Filter */}
      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product name or file name..."
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#25D366] shadow-sm"
        />
      </div>

      {/* Digital Products List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">
          Loading digital products catalog...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900/40">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            No digital products configured
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
            Link a store product to digital files to start selling software, ebooks, or audio assets.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EA855]"
          >
            Create Your First Digital Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((dp) => (
            <div
              key={dp.id}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#25D366]/10 text-[#25D366] dark:text-zinc-400 border border-[#25D366]/20">
                    Digital Asset
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {dp.productPrice?.toFixed(2) || "0.00"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 truncate">
                  {dp.productName || `Product (${dp.productId})`}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  {dp.files?.length || 0} attached file(s) &bull; Limit: {dp.downloadLimit} downloads
                </p>

                {/* Attached files preview */}
                <div className="space-y-1.5 mb-4">
                  {dp.files?.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                        📄 {f.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {formatFileSize(f.size)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-zinc-400 space-y-1 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <div>Link Expiry: {dp.expiryDays} days</div>
                  <div>License Keys: {dp.licenseEnabled ? "Generated on Order" : "Off"}</div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(dp)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(dp.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  Detach
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && renderModal()}
    </div>
  );

  function renderModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {editingItem ? "Edit Digital Product Configuration" : "Configure New Digital Product"}
            </h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Store Product Selection */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Store Catalog Product *
              </label>
              {initialProductId ? (
                <input
                  type="text"
                  disabled
                  value={initialProductId}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                />
              ) : (
                <select
                  required
                  disabled={!!editingItem}
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#25D366]"
                >
                  <option value="">-- Choose a store product --</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Rs. {p.price})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* File Upload Component */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Attach Downloadable Files (Cloudflare R2) *
              </label>
              <DigitalProductUploader
                productId={formProductId || "general"}
                onFileUploaded={(newFile) => {
                  setFormFiles((prev) => [...prev, newFile]);
                }}
              />
            </div>

            {/* Attached Files List */}
            {formFiles.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 block">
                  Attached Files ({formFiles.length}):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {formFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold truncate block text-zinc-800 dark:text-zinc-200">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatFileSize(f.size)} &bull; {f.mime}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-rose-500 hover:text-rose-600 font-bold text-xs p-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Limits */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Max Download Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formDownloadLimit}
                  onChange={(e) => setFormDownloadLimit(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  Maximum times customer can download file.
                </span>
              </div>
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Link Expiry (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={formExpiryDays}
                  onChange={(e) => setFormExpiryDays(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  Days until token expires (0 = no expiry).
                </span>
              </div>
            </div>

            {/* License Key Generation Toggle */}
            <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div>
                <span className="font-bold text-zinc-900 dark:text-white block">
                  Generate Software License Key
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Automatically generates a unique XXXX-XXXX-XXXX-XXXX key upon purchase.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formLicenseEnabled}
                onChange={(e) => setFormLicenseEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-[#25D366]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#1EA855] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {saving ? "Saving..." : editingItem ? "Save Changes" : "Create Digital Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default DigitalProductsManager;

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { ProductVariantRecord, ProductVariantInput } from "@/lib/variants";

interface VariantsManagerProps {
  productId: string | null;
  baseSku: string;
  basePrice: number;
  availableImages: string[];
  initialVariants?: ProductVariantRecord[];
  onVariantsChanged?: (variants: ProductVariantInput[]) => void;
  onSaved?: () => void;
}

interface AttributeState {
  name: string;
  values: string[];
  currentInput: string;
}

export default function VariantsManager({
  productId,
  baseSku,
  basePrice,
  availableImages,
  initialVariants = [],
  onVariantsChanged,
  onSaved,
}: VariantsManagerProps): React.JSX.Element {
  // Attributes State
  const [attributesList, setAttributesList] = useState<AttributeState[]>([]);
  const [newAttrName, setNewAttrName] = useState("");

  // Variants State
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Quick preset attributes
  const presetAttributes = ["Color", "Size", "Material", "Style"];

  // Expanded variant rows for weight/dimensions
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // Image Uploading per variant
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadIdxRef = useRef<number | null>(null);

  // Bulk edit state
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  // Initialize from initialVariants or DB fetch
  useEffect(() => {
    if (initialVariants && initialVariants.length > 0) {
      setVariants(
        initialVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price || undefined,
          salePrice: v.salePrice || undefined,
          stock: v.stock,
          imageUrl: v.imageUrl || undefined,
          options: v.options,
          weight: v.weight || undefined,
          dimensions: v.dimensions || undefined,
          isDefault: v.isDefault,
        }))
      );

      // Reconstruct attributes from variant options
      const attrMap: Record<string, Set<string>> = {};
      initialVariants.forEach((v) => {
        if (v.options) {
          Object.entries(v.options).forEach(([k, val]) => {
            if (!attrMap[k]) attrMap[k] = new Set();
            attrMap[k].add(val);
          });
        }
      });

      const derivedAttrs: AttributeState[] = Object.entries(attrMap).map(([k, set]) => ({
        name: k,
        values: Array.from(set),
        currentInput: "",
      }));
      if (derivedAttrs.length > 0) {
        setAttributesList(derivedAttrs);
      }
    } else if (productId) {
      fetchVariants();
    }
  }, [productId, initialVariants]);

  const fetchVariants = async () => {
    if (!productId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/products/${productId}/variants`);
      const data = (await res.json()) as { success: boolean; data?: ProductVariantRecord[]; error?: string };

      if (res.ok && data.success && data.data) {
        setVariants(
          data.data.map((v) => ({
            id: v.id,
            sku: v.sku,
            price: v.price || undefined,
            salePrice: v.salePrice || undefined,
            stock: v.stock,
            imageUrl: v.imageUrl || undefined,
            options: v.options,
            weight: v.weight || undefined,
            dimensions: v.dimensions || undefined,
            isDefault: v.isDefault,
          }))
        );

        // Reconstruct attributes if none currently set
        if (attributesList.length === 0) {
          const attrMap: Record<string, Set<string>> = {};
          data.data.forEach((v) => {
            if (v.options) {
              Object.entries(v.options).forEach(([k, val]) => {
                if (!attrMap[k]) attrMap[k] = new Set();
                attrMap[k].add(val);
              });
            }
          });
          const derivedAttrs: AttributeState[] = Object.entries(attrMap).map(([k, set]) => ({
            name: k,
            values: Array.from(set),
            currentInput: "",
          }));
          if (derivedAttrs.length > 0) {
            setAttributesList(derivedAttrs);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load variants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync with parent when variants change
  useEffect(() => {
    if (onVariantsChanged) {
      onVariantsChanged(variants);
    }
  }, [variants, onVariantsChanged]);

  // Attribute Management Handlers
  const handleAddAttribute = (nameToAdd: string) => {
    const clean = nameToAdd.trim();
    if (!clean) return;
    if (attributesList.some((a) => a.name.toLowerCase() === clean.toLowerCase())) {
      setFeedback({ type: "error", message: `Attribute '${clean}' already added.` });
      return;
    }
    setAttributesList((prev) => [...prev, { name: clean, values: [], currentInput: "" }]);
    setNewAttrName("");
    setFeedback(null);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddValue = (attrIndex: number) => {
    const attr = attributesList[attrIndex];
    const val = attr.currentInput.trim();
    if (!val) return;
    if (attr.values.some((v) => v.toLowerCase() === val.toLowerCase())) return;

    setAttributesList((prev) =>
      prev.map((a, i) =>
        i === attrIndex
          ? { ...a, values: [...a.values, val], currentInput: "" }
          : a
      )
    );
  };

  const handleRemoveValue = (attrIndex: number, valIndex: number) => {
    setAttributesList((prev) =>
      prev.map((a, i) =>
        i === attrIndex
          ? { ...a, values: a.values.filter((_, vi) => vi !== valIndex) }
          : a
      )
    );
  };

  // Generate Cartesian combinations
  const handleGenerateCombinations = () => {
    const validAttrs = attributesList.filter((a) => a.values.length > 0);
    if (validAttrs.length === 0) {
      setFeedback({
        type: "error",
        message: "Please add at least one attribute with values (e.g. Color: Black, White) first.",
      });
      return;
    }

    // Cartesian product helper
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
        [[]]
      );
    };

    const valueArrays = validAttrs.map((a) => a.values);
    const combinations = cartesian(valueArrays);

    const baseCleanSku = baseSku.trim().toUpperCase() || "PROD";

    const newVariants: ProductVariantInput[] = combinations.map((combo, idx) => {
      const opts: Record<string, string> = {};
      combo.forEach((val, i) => {
        opts[validAttrs[i].name] = val;
      });

      // Sku formula: BASE-OPT1-OPT2
      const skuSuffix = combo
        .map((v) => v.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4))
        .join("-");
      const suggestedSku = `${baseCleanSku}-${skuSuffix}`;

      // Check if existing variant has identical options to preserve data
      const existingMatch = variants.find((v) => {
        const keys = Object.keys(opts);
        return (
          keys.length === Object.keys(v.options || {}).length &&
          keys.every((k) => v.options[k] === opts[k])
        );
      });

      if (existingMatch) {
        return {
          ...existingMatch,
          options: opts,
          isDefault: idx === 0 && !variants.some((v) => v.isDefault),
        };
      }

      return {
        id: crypto.randomUUID(),
        sku: suggestedSku,
        price: basePrice > 0 ? basePrice : undefined,
        stock: 10,
        options: opts,
        isDefault: idx === 0,
      };
    });

    // Ensure first is default if none default
    if (!newVariants.some((v) => v.isDefault) && newVariants.length > 0) {
      newVariants[0].isDefault = true;
    }

    setVariants(newVariants);
    setFeedback({
      type: "success",
      message: `Generated ${newVariants.length} variant combination(s) successfully. Review and save below.`,
    });
  };

  // Add a single custom variant manually
  const handleAddSingleVariant = () => {
    const opts: Record<string, string> = {};
    attributesList.forEach((a) => {
      if (a.values.length > 0) {
        opts[a.name] = a.values[0];
      } else {
        opts[a.name] = "Standard";
      }
    });

    if (Object.keys(opts).length === 0) {
      opts["Option"] = "Default";
    }

    const newVar: ProductVariantInput = {
      id: crypto.randomUUID(),
      sku: `${baseSku.trim().toUpperCase() || "PROD"}-VAR-${variants.length + 1}`,
      price: basePrice > 0 ? basePrice : undefined,
      stock: 5,
      options: opts,
      isDefault: variants.length === 0,
    };

    setVariants((prev) => [...prev, newVar]);
  };

  // Row update handlers
  const handleUpdateVariant = (index: number, fields: Partial<ProductVariantInput>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...fields } : v))
    );
  };

  const handleSetDefault = (index: number) => {
    setVariants((prev) =>
      prev.map((v, i) => ({
        ...v,
        isDefault: i === index,
      }))
    );
  };

  const handleDeleteVariant = async (index: number) => {
    const variant = variants[index];
    if (variant.id && productId) {
      try {
        const res = await fetch(`/api/admin/variants/${variant.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          console.warn("API delete returned status", res.status);
        }
      } catch (err) {
        console.warn("API delete error:", err);
      }
    }

    setVariants((prev) => {
      const remaining = prev.filter((_, i) => i !== index);
      if (variant.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  };

  // Bulk actions
  const handleApplyBulkPrice = () => {
    const num = parseFloat(bulkPrice);
    if (isNaN(num) || num <= 0) return;
    setVariants((prev) => prev.map((v) => ({ ...v, price: num })));
    setBulkPrice("");
    setFeedback({ type: "success", message: `Updated price to $${num.toFixed(2)} for all variants.` });
  };

  const handleApplyBulkStock = () => {
    const num = parseInt(bulkStock, 10);
    if (isNaN(num) || num < 0) return;
    setVariants((prev) => prev.map((v) => ({ ...v, stock: num })));
    setBulkStock("");
    setFeedback({ type: "success", message: `Updated stock to ${num} for all variants.` });
  };

  // Upload image for a variant
  const triggerImageUpload = (idx: number) => {
    activeUploadIdxRef.current = idx;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const idx = activeUploadIdxRef.current;
    if (!file || idx === null) return;

    try {
      setUploadingIndex(idx);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "variants");
      formData.append("altText", `Variant ${variants[idx]?.sku || ""}`);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { success: boolean; data?: { url: string }; error?: { message?: string } };

      if (res.ok && data.success && data.data?.url) {
        handleUpdateVariant(idx, { imageUrl: data.data.url });
      } else {
        throw new Error(data.error?.message || "Image upload failed");
      }
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploadingIndex(null);
      activeUploadIdxRef.current = null;
    }
  };

  // Save variants to API
  const handleSaveVariants = async () => {
    if (!productId) {
      setFeedback({
        type: "success",
        message: "Variants configured! They will be created when you click 'Save Product'.",
      });
      return;
    }

    if (variants.length === 0) {
      setFeedback({ type: "error", message: "No variants to save. Add or generate variants first." });
      return;
    }

    // Check SKU duplicates
    const skus = new Set<string>();
    for (const v of variants) {
      const norm = (v.sku || "").trim().toUpperCase();
      if (!norm) {
        setFeedback({ type: "error", message: "All variants must have a SKU." });
        return;
      }
      if (skus.has(norm)) {
        setFeedback({ type: "error", message: `Duplicate SKU '${norm}' found across variants.` });
        return;
      }
      skus.add(norm);
    }

    try {
      setIsSaving(true);
      setFeedback(null);

      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants }),
      });

      const data = (await res.json()) as { success: boolean; message?: string; error?: string; data?: ProductVariantRecord[] };

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save variants.");
      }

      setFeedback({
        type: "success",
        message: `Successfully saved ${variants.length} variant(s) to Cloudflare D1!`,
      });

      if (onSaved) onSaved();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save variants.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Variant Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleVariantImageUpload}
        className="hidden"
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs border transition-all ${
            feedback.type === "success"
              ? "border-[#18C729]/30 bg-[#18C729]/10 text-[#18C729]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. ATTRIBUTES CONFIGURATION SECTION */}
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="h-4 w-4 text-[#18C729]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Step 1: Define Attributes & Options
            </h3>
            <p className="text-[11px] text-white/50">
              Add product attributes like Color or Size and list the available options.
            </p>
          </div>

          {/* Quick Add Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-white/40">Presets:</span>
            {presetAttributes.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddAttribute(preset)}
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/70 hover:border-[#18C729] hover:text-[#18C729] transition-colors"
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Existing Attributes List */}
        <div className="space-y-3">
          {attributesList.map((attr, attrIdx) => (
            <div
              key={attrIdx}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#18C729]/15 px-2 py-0.5 text-xs font-bold text-[#18C729] border border-[#18C729]/30">
                    {attr.name}
                  </span>
                  <span className="text-[11px] text-white/40">
                    ({attr.values.length} value{attr.values.length === 1 ? "" : "s"})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(attrIdx)}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Remove Attribute
                </button>
              </div>

              {/* Value Badges & Input */}
              <div className="flex flex-wrap items-center gap-2">
                {attr.values.map((val, valIdx) => (
                  <span
                    key={valIdx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(attrIdx, valIdx)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                      title="Remove option"
                    >
                      &times;
                    </button>
                  </span>
                ))}

                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={attr.currentInput}
                    onChange={(e) =>
                      setAttributesList((prev) =>
                        prev.map((a, i) =>
                          i === attrIdx ? { ...a, currentInput: e.target.value } : a
                        )
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddValue(attrIdx);
                      }
                    }}
                    placeholder={`Add ${attr.name.toLowerCase()} (e.g. ${
                      attr.name.toLowerCase() === "color"
                        ? "Black, Red"
                        : attr.name.toLowerCase() === "size"
                        ? "S, M, L"
                        : "Value"
                    })`}
                    className="h-8 w-44 rounded-lg border border-white/15 bg-white/5 px-2.5 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddValue(attrIdx)}
                    className="h-8 rounded-lg bg-white/10 px-2.5 text-xs font-semibold text-white hover:bg-[#18C729] hover:text-black transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Custom Attribute Form */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAttribute(newAttrName);
                }
              }}
              placeholder="New custom attribute name (e.g. Material, Edition)"
              className="h-9 w-64 rounded-xl border border-white/15 bg-white/5 px-3 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddAttribute(newAttrName)}
              className="h-9 rounded-xl border border-white/20 bg-white/5 px-3.5 text-xs font-semibold text-white hover:border-[#18C729] hover:text-[#18C729] transition-colors"
            >
              + Add Attribute
            </button>
          </div>
        </div>

        {/* Generate Button Action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleGenerateCombinations}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2 text-xs font-bold text-black shadow-md shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Generate Variant Combinations
          </button>

          <button
            type="button"
            onClick={handleAddSingleVariant}
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            + Add Single Variant Row
          </button>
        </div>
      </div>

      {/* 2. VARIANT COMBINATIONS TABLE / CARDS */}
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="h-4 w-4 text-[#FEF500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Step 2: Configure Variants ({variants.length})
            </h3>
            <p className="text-[11px] text-white/50">
              Set unique SKU, pricing, stock, and individual photos for each variant.
            </p>
          </div>

          {/* Bulk Update Controls */}
          {variants.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="Bulk Price ($)"
                  className="h-7 w-24 rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkPrice}
                  className="h-7 rounded-lg bg-white/10 px-2 text-[11px] font-semibold text-white/80 hover:bg-white/20 transition-colors"
                >
                  Set All
                </button>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  placeholder="Bulk Stock"
                  className="h-7 w-20 rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkStock}
                  className="h-7 rounded-lg bg-white/10 px-2 text-[11px] font-semibold text-white/80 hover:bg-white/20 transition-colors"
                >
                  Set All
                </button>
              </div>

              <button
                type="button"
                onClick={() => setVariants([])}
                className="h-7 rounded-lg bg-red-500/10 px-2 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Variants List / Rows */}
        {variants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-white/40 space-y-2">
            <svg className="mx-auto h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-xs">No variants defined yet.</p>
            <p className="text-[11px] text-white/30">
              Add attributes above and click &quot;Generate Variant Combinations&quot; to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={v.id || idx}
                className={`rounded-2xl border p-4 transition-all ${
                  v.isDefault
                    ? "border-[#18C729]/50 bg-[#18C729]/[0.03] shadow-md shadow-[#18C729]/5"
                    : "border-white/10 bg-white/[0.01]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Default Radio & Combination Pills */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(idx)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        v.isDefault
                          ? "bg-[#18C729] text-black"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                      title={v.isDefault ? "Default Variant" : "Click to set as default variant"}
                    >
                      {v.isDefault ? (
                        <>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Default</span>
                        </>
                      ) : (
                        <span>Set Default</span>
                      )}
                    </button>

                    {/* Option Values Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {Object.entries(v.options || {}).map(([key, val]) => (
                        <span
                          key={key}
                          className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/90"
                        >
                          <span className="text-white/40">{key}:</span>{" "}
                          <span className="font-semibold text-[#FEF500]">{val}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Quick actions (expand weight/dimensions, delete) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {expandedRows[idx] ? "Hide Specs" : "Weight & Dimensions"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(idx)}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Delete Variant"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Main Fields Grid: SKU, Price, Sale Price, Stock, Image */}
                <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 items-end">
                  {/* SKU */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      SKU <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) =>
                        handleUpdateVariant(idx, { sku: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. SNEAK-BLK-S"
                      className="h-9 w-full rounded-xl border border-white/15 bg-white/5 px-2.5 text-xs font-mono text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.price !== undefined && v.price !== null ? v.price : ""}
                      onChange={(e) =>
                        handleUpdateVariant(idx, {
                          price: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder={basePrice > 0 ? `$${basePrice.toFixed(2)} (Base)` : "0.00"}
                      className="h-9 w-full rounded-xl border border-white/15 bg-white/5 px-2.5 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.salePrice !== undefined && v.salePrice !== null ? v.salePrice : ""}
                      onChange={(e) =>
                        handleUpdateVariant(idx, {
                          salePrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Optional"
                      className="h-9 w-full rounded-xl border border-white/15 bg-white/5 px-2.5 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Stock Qty
                    </label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        handleUpdateVariant(idx, { stock: parseInt(e.target.value, 10) || 0 })
                      }
                      placeholder="0"
                      className="h-9 w-full rounded-xl border border-white/15 bg-white/5 px-2.5 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  {/* Image Picker / Uploader */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-1">
                      Variant Image
                    </label>
                    <div className="flex items-center gap-2">
                      {v.imageUrl ? (
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/20 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={v.imageUrl} alt={v.sku} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleUpdateVariant(idx, { imageUrl: undefined })}
                            className="absolute inset-0 bg-black/60 text-white opacity-0 hover:opacity-100 flex items-center justify-center text-xs"
                            title="Remove photo"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/20 text-white/20 text-xs">
                          Img
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={uploadingIndex === idx}
                        onClick={() => triggerImageUpload(idx)}
                        className="h-9 flex-1 rounded-xl border border-white/15 bg-white/5 px-2 text-[11px] font-medium text-white/70 hover:border-[#18C729] hover:text-white disabled:opacity-50 transition-colors truncate"
                      >
                        {uploadingIndex === idx ? "Uploading..." : v.imageUrl ? "Change" : "+ Upload"}
                      </button>

                      {/* Quick Select from existing product gallery if available */}
                      {availableImages.length > 0 && !v.imageUrl && (
                        <button
                          type="button"
                          onClick={() => handleUpdateVariant(idx, { imageUrl: availableImages[0] })}
                          className="h-9 rounded-xl border border-white/15 bg-white/5 px-2 text-[10px] text-white/50 hover:text-white"
                          title="Use Main Product Photo"
                        >
                          Use Main
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Specifications (Weight & Dimensions) */}
                {expandedRows[idx] && (
                  <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">Weight (kg/lb)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={v.weight !== undefined && v.weight !== null ? v.weight : ""}
                        onChange={(e) =>
                          handleUpdateVariant(idx, {
                            weight: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g. 0.85"
                        className="h-8 w-full rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">Length</label>
                      <input
                        type="number"
                        step="0.1"
                        value={v.dimensions?.length !== undefined && v.dimensions?.length !== null ? v.dimensions.length : ""}
                        onChange={(e) =>
                          handleUpdateVariant(idx, {
                            dimensions: {
                              ...v.dimensions,
                              length: e.target.value ? parseFloat(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="Length"
                        className="h-8 w-full rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">Width</label>
                      <input
                        type="number"
                        step="0.1"
                        value={v.dimensions?.width !== undefined && v.dimensions?.width !== null ? v.dimensions.width : ""}
                        onChange={(e) =>
                          handleUpdateVariant(idx, {
                            dimensions: {
                              ...v.dimensions,
                              width: e.target.value ? parseFloat(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="Width"
                        className="h-8 w-full rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">Height</label>
                      <input
                        type="number"
                        step="0.1"
                        value={v.dimensions?.height !== undefined && v.dimensions?.height !== null ? v.dimensions.height : ""}
                        onChange={(e) =>
                          handleUpdateVariant(idx, {
                            dimensions: {
                              ...v.dimensions,
                              height: e.target.value ? parseFloat(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="Height"
                        className="h-8 w-full rounded-lg border border-white/15 bg-white/5 px-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 mb-1">Unit</label>
                      <select
                        value={v.dimensions?.unit || "cm"}
                        onChange={(e) =>
                          handleUpdateVariant(idx, {
                            dimensions: { ...v.dimensions, unit: e.target.value },
                          })
                        }
                        className="h-8 w-full rounded-lg border border-white/15 bg-[#0e1610] px-2 text-xs text-white"
                      >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                        <option value="mm">mm</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action / Save Bar */}
        {variants.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="text-[11px] text-white/40">
              * Click &quot;Save Variants&quot; to write all combinations directly to Cloudflare D1.
            </div>

            {productId ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveVariants}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#18C729] px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#18C729]/25 hover:brightness-110 disabled:opacity-50 active:scale-98 transition-all"
              >
                {isSaving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving Variants...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Variants to D1 ({variants.length})</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-xs text-[#FEF500] font-medium">
                Variants will be created automatically when this product is saved.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

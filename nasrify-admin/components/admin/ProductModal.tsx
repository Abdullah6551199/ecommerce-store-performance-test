"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import type { CategoryRecord } from "@/lib/categories";
import { generateSlug } from "@/lib/categories";
import VariantsManager from "./VariantsManager";
import type { ProductVariantInput } from "@/lib/variants";
import { normalizeImageUrl } from "@/lib/utils";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit: ProductWithImagesAndCategory | null;
  categoriesList: CategoryRecord[];
  initialCategoryId?: string;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
  categoriesList,
  initialCategoryId,
}: ProductModalProps): React.JSX.Element | null {
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "media" | "variants" | "seo">("basic");
  const [stagedVariants, setStagedVariants] = useState<ProductVariantInput[]>([]);

  // Basic info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"published" | "draft" | "archived">("published");

  // Pricing
  const [price, setPrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");

  // Inventory
  const [stockQuantity, setStockQuantity] = useState<string>("0");
  const [stockStatus, setStockStatus] = useState<"in_stock" | "out_of_stock" | "backorder" | "preorder">("in_stock");
  const [lowStockThreshold, setLowStockThreshold] = useState<string>("5");
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorders, setAllowBackorders] = useState(false);

  // Media
  const [mainImage, setMainImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Form handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setSlugManuallyEdited(true);
      setSku(productToEdit.sku);
      setCategoryId(productToEdit.categoryId || "");
      setBrand(productToEdit.brand || "");
      setTags(productToEdit.tags ? productToEdit.tags.join(", ") : "");
      setShortDescription(productToEdit.shortDescription || "");
      setDescription(productToEdit.description || "");
      setStatus(productToEdit.status);

      setPrice(productToEdit.price.toString());
      setSalePrice(productToEdit.salePrice ? productToEdit.salePrice.toString() : "");
      setCostPrice(productToEdit.costPrice ? productToEdit.costPrice.toString() : "");
      setCompareAtPrice(productToEdit.compareAtPrice ? productToEdit.compareAtPrice.toString() : "");

      setStockQuantity(productToEdit.stockQuantity.toString());
      setStockStatus(productToEdit.stockStatus);
      setLowStockThreshold(productToEdit.lowStockThreshold.toString());
      setTrackInventory(productToEdit.trackInventory);
      setAllowBackorders(productToEdit.allowBackorders);

      setMainImage(productToEdit.mainImage || "");
      setGalleryImages(
        productToEdit.images.filter((img) => !img.isMain).map((i) => i.imageUrl)
      );

      setSeoTitle(productToEdit.seoTitle || "");
      setSeoDescription(productToEdit.seoDescription || "");

      setStagedVariants(
        (productToEdit.variants || []).map((v) => ({
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
    } else {
      setName("");
      setSlug("");
      setSlugManuallyEdited(false);
      setSku("");
      setCategoryId(initialCategoryId || "");
      setBrand("");
      setTags("");
      setShortDescription("");
      setDescription("");
      setStatus("published");

      setPrice("");
      setSalePrice("");
      setCostPrice("");
      setCompareAtPrice("");

      setStockQuantity("0");
      setStockStatus("in_stock");
      setLowStockThreshold("5");
      setTrackInventory(true);
      setAllowBackorders(false);

      setMainImage("");
      setGalleryImages([]);

      setSeoTitle("");
      setSeoDescription("");
      setStagedVariants([]);
    }
    setErrorMessage(null);
    setUploadError(null);
    setActiveTab("basic");
  }, [productToEdit, isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
    if (!sku && !productToEdit) {
      // Suggest automatic SKU initial
      const initials = val.replace(/[^A-Za-z0-9]/g, "").substring(0, 4).toUpperCase();
      if (initials) {
        setSku(`${initials}-${Date.now().toString().slice(-4)}`);
      }
    }
  };

  // Upload main image to R2
  const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMain(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");
      formData.append("altText", `${name || "Product"} Main View`);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { success: boolean; data?: { url: string }; error?: { message?: string } };

      if (!res.ok || !data.success || !data.data?.url) {
        throw new Error(data.error?.message || "Failed to upload main image to R2.");
      }

      setMainImage(data.data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  };

  // Upload gallery image to R2
  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      setUploadError(null);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");
        formData.append("altText", `${name || "Product"} Gallery View ${galleryImages.length + i + 1}`);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { success: boolean; data?: { url: string }; error?: { message?: string } };

        if (res.ok && data.success && data.data?.url) {
          setGalleryImages((prev) => [...prev, data.data!.url]);
        }
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gallery upload error");
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Front validations
    if (!name.trim()) {
      setErrorMessage("Product name is required.");
      setActiveTab("basic");
      return;
    }
    if (!sku.trim()) {
      setErrorMessage("SKU is required.");
      setActiveTab("basic");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("A valid regular price (> 0) is required.");
      setActiveTab("pricing");
      return;
    }
    if (salePrice && Number(salePrice) >= Number(price)) {
      setErrorMessage("Sale price must be strictly less than regular price.");
      setActiveTab("pricing");
      return;
    }
    if (!mainImage.trim()) {
      setErrorMessage("Please upload a main product image (go to Media tab to upload).");
      setActiveTab("media");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        sku: sku.trim().toUpperCase(),
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        costPrice: costPrice ? Number(costPrice) : null,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        stockQuantity: Number(stockQuantity) || 0,
        stockStatus,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        trackInventory,
        allowBackorders,
        categoryId: categoryId || null,
        brand: brand.trim() || null,
        tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status,
        mainImage: mainImage.trim(),
        galleryImages,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
      };

      const url = productToEdit
        ? `/api/admin/products/${productToEdit.id}`
        : "/api/admin/products";
      const method = productToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as { success: boolean; data?: { id?: string }; error?: string };

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save product.");
      }

      // Save staged variants if any exist
      const targetProductId = productToEdit?.id || result.data?.id;
      if (targetProductId && stagedVariants.length > 0) {
        await fetch(`/api/admin/products/${targetProductId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variants: stagedVariants }),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="relative w-full max-w-4xl rounded-3xl border border-zinc-200 dark:border-white/15 bg-white dark:bg-[#0a110c] text-zinc-900 dark:text-white p-6 sm:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {productToEdit ? "Edit Product" : "Create New Product"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-white/50">
                {productToEdit ? `SKU: ${productToEdit.sku}` : "Configure product pricing, inventory, gallery media, and taxonomy."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 p-2 text-zinc-500 dark:text-white/60 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex items-center gap-2 border-b border-zinc-200 dark:border-white/10 pb-3 flex-wrap">
          {[
            { id: "basic", label: "General Information" },
            { id: "pricing", label: "Pricing & Inventory" },
            { id: "media", label: "Images & Gallery" },
            { id: "variants", label: "Variants" },
            { id: "seo", label: "SEO & Attributes" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#18C729] text-black shadow-md shadow-[#18C729]/20 font-bold"
                  : "border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-white/60 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                    Product Name <span className="text-[#18C729]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Cyberpunk Techwear Jacket"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Slug <span className="text-[#18C729]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setSlug(generateSlug(name))}
                      className="text-[10px] text-amber-600 dark:text-[#FEF500] hover:underline"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="e.g. cyberpunk-techwear-jacket"
                    className="mt-1.5 w-full font-mono rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                    SKU (Stock Keeping Unit) <span className="text-[#18C729]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="e.g. TECH-JKT-01"
                    className="mt-1.5 w-full font-mono uppercase rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#0e1610] px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                  >
                    <option value="">Uncategorized</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#0e1610] px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                  >
                    <option value="published">Published (Visible on Store)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One-line summary for product cards and search results..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/5 px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive product specifications, materials, and care instructions..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/5 px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & INVENTORY */}
          {activeTab === "pricing" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#18C729]">Pricing Configuration</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Regular Price ($) <span className="text-[#18C729]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="99.00"
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="Must be < regular"
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Compare-at Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="Original MSRP"
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Cost Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="COGS (internal)"
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-[#FEF500]">Inventory & Stock Control</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="0"
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Stock Status
                    </label>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value as any)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#0e1610] px-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-[#18C729] focus:outline-none"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="backorder">Allow Backorder</option>
                      <option value="preorder">Pre-Order</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      placeholder="5"
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-white/80">
                    <input
                      type="checkbox"
                      checked={trackInventory}
                      onChange={(e) => setTrackInventory(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 dark:border-white/20 text-[#18C729] focus:ring-0"
                    />
                    <span>Track inventory levels automatically</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-white/80">
                    <input
                      type="checkbox"
                      checked={allowBackorders}
                      onChange={(e) => setAllowBackorders(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 dark:border-white/20 text-[#18C729] focus:ring-0"
                    />
                    <span>Allow customer backorders when inventory reaches 0</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & IMAGES */}
          {activeTab === "media" && (
            <div className="space-y-5">
              {/* Main Image Section */}
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Main Product Image <span className="text-[#18C729]">*</span></h3>
                    <p className="text-[11px] text-zinc-500 dark:text-white/50">Primary card thumbnail and hero gallery visual.</p>
                  </div>
                  {mainImage && (
                    <button
                      type="button"
                      onClick={() => setMainImage("")}
                      className="text-xs text-red-500 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      Remove Main
                    </button>
                  )}
                </div>

                <input
                  ref={mainFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleUploadMainImage}
                  className="hidden"
                />

                {mainImage ? (
                  <div className="flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={normalizeImageUrl(mainImage)} alt="Main product" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-zinc-900 dark:text-white truncate">{mainImage}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#18C729]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
                        Main Showcase Asset (Auto-Assigned)
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isUploadingMain}
                      onClick={() => mainFileInputRef.current?.click()}
                      className="rounded-lg border border-zinc-300 dark:border-white/15 bg-zinc-100 dark:bg-white/10 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20 transition-all cursor-pointer"
                    >
                      {isUploadingMain ? "Uploading..." : "Replace"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => mainFileInputRef.current?.click()}
                      disabled={isUploadingMain}
                      className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-white/20 bg-white dark:bg-white/5 p-6 text-center hover:border-[#18C729]/50 hover:bg-[#18C729]/5 transition-all cursor-pointer"
                    >
                      {isUploadingMain ? (
                        <span className="text-xs text-[#18C729]">Uploading image...</span>
                      ) : (
                        <>
                          <svg className="h-6 w-6 text-zinc-400 dark:text-white/50 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-semibold text-zinc-800 dark:text-white">Click to Upload Main Image</span>
                          <span className="text-[10px] text-zinc-500 dark:text-white/40 mt-0.5">JPG, PNG, WebP up to 5MB</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Images Section */}
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Additional Gallery Images</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-white/50">Secondary views, angles, and detail photography.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={isUploadingGallery}
                    className="rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-1 text-xs font-semibold text-[#18C729] hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer"
                  >
                    {isUploadingGallery ? "Uploading..." : "+ Add to Gallery"}
                  </button>
                </div>

                <input
                  ref={galleryFileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleUploadGalleryImage}
                  className="hidden"
                />

                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-white/15 bg-zinc-100 dark:bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={normalizeImageUrl(imgUrl)} alt={`Gallery view ${idx + 1}`} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="rounded-lg bg-red-500/80 p-1.5 text-white hover:bg-red-500 cursor-pointer"
                            title="Remove image"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-white/70">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-300 dark:border-white/10 p-6 text-center text-xs text-zinc-400 dark:text-white/40">
                    No gallery images uploaded. Click &quot;+ Add to Gallery&quot; to upload multiple product views.
                  </div>
                )}
              </div>

              {uploadError && <p className="text-xs text-red-500 dark:text-red-400">{uploadError}</p>}
            </div>
          )}

          {/* TAB: VARIANTS */}
          {activeTab === "variants" && (
            <VariantsManager
              productId={productToEdit?.id || null}
              baseSku={sku}
              basePrice={Number(price) || 0}
              availableImages={[mainImage, ...galleryImages].filter(Boolean)}
              initialVariants={productToEdit?.variants || []}
              onVariantsChanged={(v) => setStagedVariants(v)}
              onSaved={() => {
                onSuccess();
              }}
            />
          )}

          {/* TAB 4: SEO & ATTRIBUTES */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apex Studio"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-white/80">
                    Tags (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. outerwear, waterproof, techwear, winter"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-50 dark:bg-white/5 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 p-4 space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Search Engine Optimization (SEO)</h3>
                <div>
                  <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-white/70">
                    <label>SEO Title Tag</label>
                    <span className="text-[10px] text-zinc-400 dark:text-white/40">{seoTitle.length}/160</span>
                  </div>
                  <input
                    type="text"
                    maxLength={160}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom meta title for search engines"
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-white/70">
                    <label>SEO Meta Description</label>
                    <span className="text-[10px] text-zinc-400 dark:text-white/40">{seoDescription.length}/320</span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={320}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Brief snippet describing this product in search results"
                    className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/10">
            <div className="text-[11px] text-zinc-400 dark:text-white/40">
              * Required fields: Name, SKU, Regular Price, Main Image
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-white/70 hover:bg-zinc-200 dark:hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingMain || isUploadingGallery}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2.5 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving Product...
                  </>
                ) : productToEdit ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

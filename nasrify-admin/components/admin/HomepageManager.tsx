"use client";

import React, { useState, useEffect } from "react";
import { HomepageSectionRecord, HomepageSectionType } from "@/lib/homepage";
import { renderHomepageSection } from "@/components/homepage/HomepageSections";
import { fetchWithClientCache, invalidateClientCache } from "@/lib/client-cache";
import Toggle from "@/components/ui/Toggle";

export default function HomepageManager(): React.JSX.Element {
  const [sections, setSections] = useState<HomepageSectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingSection, setEditingSection] = useState<HomepageSectionRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null);

  // Fetch sections from API
  const fetchSections = async (forceRefresh: unknown = false) => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchWithClientCache<any>("/api/admin/homepage", { forceRefresh: forceRefresh === true });
      if (json.success) {
        setSections(json.data);
      } else {
        setError(json.error || "Failed to load sections.");
      }
    } catch (err) {
      setError("Network error loading homepage sections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Toggle active status
  const handleToggleActive = async (sec: HomepageSectionRecord) => {
    try {
      const updatedStatus = !sec.isActive;
      const res = await fetch(`/api/admin/homepage/${sec.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        invalidateClientCache("/api/admin/homepage");
        setSections((prev) =>
          prev.map((s) => (s.id === sec.id ? { ...s, isActive: updatedStatus } : s))
        );
        showNotification(`Section "${sec.title}" is now ${updatedStatus ? "Visible" : "Hidden"}.`);
      } else {
        alert(json.error || "Failed to toggle status");
      }
    } catch (err) {
      alert("Error toggling section status");
    }
  };

  // Move section Up or Down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    const updatedWithOrder = newSections.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setSections(updatedWithOrder);

    const orderedIds = updatedWithOrder.map((s) => s.id);

    try {
      const res = await fetch("/api/admin/homepage/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        invalidateClientCache("/api/admin/homepage");
        showNotification("Homepage section sequence updated in Cloudflare D1.");
      } else {
        fetchSections(true); // revert
      }
    } catch (err) {
      fetchSections(true);
    }
  };

  // Delete section
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the section "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/homepage/${id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as any;
      if (json.success) {
        invalidateClientCache("/api/admin/homepage");
        setSections((prev) => prev.filter((s) => s.id !== id));
        showNotification("Section deleted successfully.");
      } else {
        alert(json.error || "Failed to delete section.");
      }
    } catch (err) {
      alert("Error deleting section.");
    }
  };

  // Reset to defaults
  const handleResetDefaults = async () => {
    if (
      !confirm(
        "Are you sure you want to restore default Chronicles template sections? Current homepage sections in Cloudflare D1 will be replaced with the default purple layout."
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        invalidateClientCache("/api/admin/homepage");
        fetchSections(true);
        showNotification("Default Chronicles homepage sections restored successfully.");
      } else {
        alert(json.error || "Failed to restore defaults.");
      }
    } catch (err) {
      alert("Error restoring defaults.");
    }
  };

  // Upload main image to Cloudflare R2
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSection) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as any;
      if (json.success && json.data?.url) {
        setEditingSection({
          ...editingSection,
          imageUrl: json.data.url,
        });
        showNotification("Image uploaded to Cloudflare R2 successfully.");
      } else {
        alert(json.error || "Image upload failed.");
      }
    } catch (err) {
      alert("Error uploading image to R2.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload image for a specific carousel slide
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIdx: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingSection) return;

    setUploadingSlideIndex(slideIdx);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as any;
      if (json.success && json.data?.url) {
        const slides = Array.isArray(editingSection.content?.slides)
          ? [...editingSection.content.slides]
          : [];
        if (slides[slideIdx]) {
          slides[slideIdx] = { ...slides[slideIdx], imageUrl: json.data.url };
          setEditingSection({
            ...editingSection,
            content: { ...editingSection.content, slides },
          });
        }
        showNotification(`Slide #${slideIdx + 1} image uploaded to Cloudflare R2.`);
      } else {
        alert(json.error || "Image upload failed.");
      }
    } catch (err) {
      alert("Error uploading slide image to R2.");
    } finally {
      setUploadingSlideIndex(null);
    }
  };

  // Save changes to editing section
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setSaving(true);
    try {
      const isNew = editingSection.id.startsWith("new-");
      const url = isNew ? "/api/admin/homepage" : `/api/admin/homepage/${editingSection.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSection),
      });
      const json = (await res.json()) as any;

      if (json.success) {
        invalidateClientCache("/api/admin/homepage");
        showNotification(
          isNew ? "New homepage section created successfully!" : "Homepage section updated successfully!"
        );
        setEditingSection(null);
        fetchSections(true);
      } else {
        alert(json.error || "Failed to save section.");
      }
    } catch (err) {
      alert("Error saving section.");
    } finally {
      setSaving(false);
    }
  };

  // Hero Carousel Slide Helpers
  const handleAddSlide = () => {
    if (!editingSection) return;
    const slides = Array.isArray(editingSection.content?.slides)
      ? [...editingSection.content.slides]
      : [];
    slides.push({
      badge: "Special Offer",
      heading: "New Exclusive Drop",
      subheading: "High-performance precision athletic engineering crafted for superior velocity.",
      primaryButtonText: "Shop Collection",
      primaryButtonUrl: "/shop",
      secondaryButtonText: "Explore Categories",
      secondaryButtonUrl: "#category-cards",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
      imageAlt: "New Collection Drop",
    });
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, slides },
    });
  };

  const handleUpdateSlide = (idx: number, field: string, value: any) => {
    if (!editingSection) return;
    const slides = Array.isArray(editingSection.content?.slides)
      ? [...editingSection.content.slides]
      : [];
    slides[idx] = { ...slides[idx], [field]: value };
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, slides },
    });
  };

  const handleRemoveSlide = (idx: number) => {
    if (!editingSection) return;
    const slides = Array.isArray(editingSection.content?.slides)
      ? [...editingSection.content.slides]
      : [];
    slides.splice(idx, 1);
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, slides },
    });
  };

  // Trust Bar Item Helpers
  const handleAddTrustItem = () => {
    if (!editingSection) return;
    const items = Array.isArray(editingSection.content?.items)
      ? [...editingSection.content.items]
      : [];
    items.push({
      icon: "shipping",
      title: "New Trust Benefit",
      description: "Fast customer delivery and satisfaction guarantee",
    });
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, items },
    });
  };

  const handleUpdateTrustItem = (idx: number, field: string, value: any) => {
    if (!editingSection) return;
    const items = Array.isArray(editingSection.content?.items)
      ? [...editingSection.content.items]
      : [];
    items[idx] = { ...items[idx], [field]: value };
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, items },
    });
  };

  const handleRemoveTrustItem = (idx: number) => {
    if (!editingSection) return;
    const items = Array.isArray(editingSection.content?.items)
      ? [...editingSection.content.items]
      : [];
    items.splice(idx, 1);
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, items },
    });
  };

  // Brand Logo Helpers
  const handleAddLogo = () => {
    if (!editingSection) return;
    const logos = Array.isArray(editingSection.content?.logos)
      ? [...editingSection.content.logos]
      : [];
    logos.push({
      name: "Partner Brand",
      logoText: "BRAND",
    });
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, logos },
    });
  };

  const handleUpdateLogo = (idx: number, field: string, value: any) => {
    if (!editingSection) return;
    const logos = Array.isArray(editingSection.content?.logos)
      ? [...editingSection.content.logos]
      : [];
    logos[idx] = { ...logos[idx], [field]: value };
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, logos },
    });
  };

  const handleRemoveLogo = (idx: number) => {
    if (!editingSection) return;
    const logos = Array.isArray(editingSection.content?.logos)
      ? [...editingSection.content.logos]
      : [];
    logos.splice(idx, 1);
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, logos },
    });
  };

  // Add section preset helper
  const handleOpenAddModal = (presetType: HomepageSectionType = "hero") => {
    let initialContent: Record<string, any> = {};
    let initialImageUrl: string | null = null;

    switch (presetType) {
      case "hero":
      case "hero_carousel":
        initialContent = {
          slides: [
            {
              badge: "Special Offer • New Season",
              heading: "Elevate Your Motion with Pure Precision",
              subheading: "Explore the new Spring Purple Collection. Engineered with micro-knit breathable fabrics.",
              primaryButtonText: "Shop Collection",
              primaryButtonUrl: "/shop",
              secondaryButtonText: "Explore Categories",
              secondaryButtonUrl: "#category-cards",
              imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
            },
          ],
        };
        initialImageUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop";
        break;

      case "categories":
      case "category_cards":
        initialContent = {
          heading: "Featured Collections",
          badgeText: "Curated Categories",
          maxItems: 5,
        };
        break;

      case "trending_products":
      case "trending_tabs":
        initialContent = {
          heading: "Trending Products",
          badgeText: "Customer Favorites",
          maxItems: 10,
        };
        break;

      case "trust_bar":
        initialContent = {
          items: [
            { icon: "shipping", title: "Free Worldwide Shipping", description: "On all orders over $50 with live tracking" },
            { icon: "return", title: "30-Day Return Policy", description: "Hassle-free exchange & money back guarantee" },
            { icon: "secure", title: "Secure Payment", description: "256-bit encrypted checkout protection" },
            { icon: "support", title: "24/7 Customer Support", description: "Dedicated concierge team ready to help" },
          ],
        };
        break;

      case "new_arrivals":
        initialContent = {
          badge: "New Collection",
          heading: "New Arrivals Just For You",
          discountText: "Save up to 40% OFF",
          subheading: "Experience cutting-edge athletic engineering designed for fluid movement and modern luxury.",
          buttonText: "Shop Collection",
          buttonUrl: "/shop",
          imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
        };
        initialImageUrl = "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop";
        break;

      case "brand_logos":
        initialContent = {
          heading: "Trusted by World-Class Champions & Athletic Leaders",
          logos: [
            { name: "Vanguard Sport", logoText: "VANGUARD" },
            { name: "Apex Athletics", logoText: "APEX//LAB" },
            { name: "Kinetics Lab", logoText: "KINETICS" },
            { name: "Aero Velocity", logoText: "AERO VELOCITY" },
          ],
        };
        break;

      case "newsletter":
        initialContent = {
          badgeText: "VIP Membership",
          heading: "Subscribe to Our Newsletter",
          subheading: "Unlock private access codes, training insights, and limited-edition colorway launches.",
          buttonText: "Subscribe",
          placeholderText: "Enter your email address...",
          disclaimer: "We respect your privacy. Unsubscribe at any time with one click.",
        };
        break;

      case "promo_banner":
        initialContent = {
          badgeText: "Limited Time",
          heading: "Seasonal Flash Sale",
          subheading: "Take an extra 20% off all performance footwear and apparel this week.",
          buttonText: "Claim Discount",
          buttonUrl: "/shop",
        };
        break;

      case "custom_html":
        initialContent = {
          heading: "Custom Brand Banner",
          html: "<div style='padding: 24px; background: rgba(150, 13, 242, 0.08); border-radius: 16px; border: 1px solid rgba(150, 13, 242, 0.2); text-align: center;'><h3 style='color: #960DF2; font-weight: 700;'>⚡ Custom Purple Chronicles Block</h3><p style='color: #5A0891; font-size: 14px; margin-top: 8px;'>Safely rendered from Cloudflare D1 database.</p></div>",
        };
        break;

      default:
        initialContent = {
          heading: "Showcase Section",
          subheading: "Explore innovative new releases.",
          buttonText: "Explore More",
          buttonUrl: "/shop",
        };
    }

    setEditingSection({
      id: `new-${Date.now()}`,
      type: presetType,
      title: `New ${presetType.replace("_", " ")} Section`,
      imageUrl: initialImageUrl,
      sortOrder: sections.length + 1,
      isActive: true,
      content: initialContent,
      createdAt: "",
      updatedAt: "",
    });
    setActiveTab("edit");
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-purple-100">
            Homepage Layout Manager
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-purple-300/70">
            Control Chronicles purple storefront sections, hero carousel slides, products, and order in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 px-3 py-2 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all"
          >
            Restore Chronicles Layout
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal("hero")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-semibold shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Section
          </button>
        </div>
      </div>

      {/* Quick Add Presets Strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 p-3">
        <span className="text-xs font-semibold text-purple-900 dark:text-purple-200 mr-1">
          Quick Add:
        </span>
        <button
          type="button"
          onClick={() => handleOpenAddModal("hero")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + Hero Carousel
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("categories")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + Categories Row
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("trending_products")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + Trending Products
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("trust_bar")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + Trust Bar
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("new_arrivals")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + New Arrivals
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("brand_logos")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + Brand Logos
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("newsletter")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + Newsletter
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("custom_html")}
          className="rounded-lg border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-purple-950/60 px-2.5 py-1 text-xs text-purple-800 dark:text-purple-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
        >
          + Custom HTML
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-xl border border-purple-400/40 bg-purple-50 dark:bg-purple-950/60 p-3 text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchSections(true)}
            className="underline hover:text-red-700 dark:hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sections List */}
      {loading ? (
        <div className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-purple-950/30 p-12 text-center text-xs text-purple-700/60 dark:text-purple-300/50 animate-pulse">
          Loading Chronicles homepage sections from Cloudflare D1...
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 p-12 text-center">
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
            No sections currently configured in Cloudflare D1.
          </p>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="mt-4 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-purple-500/20"
          >
            Populate Default Chronicles Sections
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border transition-all p-4 ${
                sec.isActive
                  ? "border-purple-100 dark:border-purple-900/50 bg-white dark:bg-purple-950/30 hover:border-purple-400 shadow-sm"
                  : "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-purple-950/10 opacity-60"
              }`}
            >
              {/* Left Column: Sort controls + Index + Badge + Title */}
              <div className="flex items-center gap-3">
                {/* Reorder Up/Down arrows */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="h-6 w-6 rounded bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 disabled:opacity-20"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="h-6 w-6 rounded bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 disabled:opacity-20"
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>

                {/* Section Index */}
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/60 text-xs font-mono font-bold text-purple-700 dark:text-purple-200">
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      {sec.type}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        sec.isActive
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                          : "bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-white/40"
                      }`}
                    >
                      {sec.isActive ? "Visible" : "Hidden"}
                    </span>
                    {sec.type === "hero" && Array.isArray(sec.content?.slides) && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                        ({sec.content.slides.length} slides)
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-900 dark:text-purple-100">{sec.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-purple-300/70 truncate max-w-md">
                    {sec.content?.heading || sec.content?.subheading || "Custom dynamic content"}
                  </p>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleActive(sec)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                    sec.isActive
                      ? "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-100"
                      : "border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-white/50 hover:bg-zinc-200"
                  }`}
                >
                  {sec.isActive ? "Visible" : "Hidden"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(JSON.parse(JSON.stringify(sec)));
                    setActiveTab("edit");
                  }}
                  className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/30 px-3 py-1.5 text-xs font-medium text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/60 hover:border-purple-400 transition-all flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit / Preview
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sec.id, sec.title)}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs text-red-500 dark:text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-all"
                  title="Delete Section"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Section Modal with Live Preview */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-3xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950 p-6 sm:p-8 shadow-2xl my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-purple-100">
                  {editingSection.id.startsWith("new-") ? "Create New Section" : "Edit Section"}
                </h2>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Type: <span className="font-mono font-semibold uppercase">{editingSection.type}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/40 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      activeTab === "edit"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white"
                    }`}
                  >
                    Form Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      activeTab === "preview"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white"
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-purple-900/40 hover:text-zinc-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-4 pr-1">
              {activeTab === "preview" ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 p-4 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
                    <span>⚡ Live rendering of this section as it appears on the storefront:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 uppercase font-bold">
                      {editingSection.type}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-purple-100 dark:border-purple-900 bg-white dark:bg-[#3C0561] p-4 sm:p-6 overflow-hidden">
                    {renderHomepageSection(editingSection)}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveSection} id="section-form" className="space-y-5">
                  {/* Basic Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                        Section Title (Admin Reference)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingSection.title}
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                        Section Type
                      </label>
                      <select
                        value={editingSection.type}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, type: e.target.value as HomepageSectionType })
                        }
                        className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="hero">Hero Carousel</option>
                        <option value="categories">Category Cards Row</option>
                        <option value="trending_products">Trending Products Tabs</option>
                        <option value="trust_bar">Trust Bar</option>
                        <option value="new_arrivals">New Arrivals Section</option>
                        <option value="brand_logos">Brand Logos Row</option>
                        <option value="newsletter">Newsletter Subscription</option>
                        <option value="promo_banner">Promotional Banner</option>
                        <option value="brand_story">Brand Story & Stats</option>
                        <option value="testimonials">Testimonials Section</option>
                        <option value="custom_html">Custom HTML / Block</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="py-2">
                    <Toggle
                      checked={editingSection.isActive}
                      onChange={(checked) => setEditingSection({ ...editingSection, isActive: checked })}
                      label="Active (Visible on Storefront Homepage)"
                      description="Display or hide this section on the live homepage."
                    />
                  </div>

                  {/* =========================================================================
                      HERO CAROUSEL: Multi-Slide Management
                     ========================================================================= */}
                  {(editingSection.type === "hero" || editingSection.type === "hero_carousel") && (
                    <div className="space-y-4 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                            Hero Carousel Slides
                          </h4>
                          <p className="text-xs text-purple-700 dark:text-purple-300/80">
                            Manage each slide with heading, badge, CTA buttons, and high-res image.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSlide}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                        >
                          + Add Slide
                        </button>
                      </div>

                      {Array.isArray(editingSection.content?.slides) && editingSection.content.slides.length > 0 ? (
                        editingSection.content.slides.map((slide: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            className="space-y-3 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-purple-950/60 p-4 text-xs"
                          >
                            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900 pb-2">
                              <span className="font-bold text-purple-900 dark:text-purple-200">
                                Slide #{sIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSlide(sIdx)}
                                className="text-red-500 hover:text-red-700 font-medium"
                              >
                                Remove Slide
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Badge Text</label>
                                <input
                                  type="text"
                                  value={slide.badge || ""}
                                  onChange={(e) => handleUpdateSlide(sIdx, "badge", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Slide Heading</label>
                                <input
                                  type="text"
                                  value={slide.heading || ""}
                                  onChange={(e) => handleUpdateSlide(sIdx, "heading", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-medium text-zinc-700 dark:text-purple-200">Subheading / Description</label>
                              <textarea
                                rows={2}
                                value={slide.subheading || ""}
                                onChange={(e) => handleUpdateSlide(sIdx, "subheading", e.target.value)}
                                className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Primary CTA Text</label>
                                <input
                                  type="text"
                                  value={slide.primaryButtonText || ""}
                                  onChange={(e) => handleUpdateSlide(sIdx, "primaryButtonText", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                />
                              </div>
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Primary CTA URL</label>
                                <input
                                  type="text"
                                  value={slide.primaryButtonUrl || ""}
                                  onChange={(e) => handleUpdateSlide(sIdx, "primaryButtonUrl", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                />
                              </div>
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Secondary CTA Text</label>
                                <input
                                  type="text"
                                  value={slide.secondaryButtonText || ""}
                                  onChange={(e) => handleUpdateSlide(sIdx, "secondaryButtonText", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                />
                              </div>
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Secondary CTA URL</label>
                                <input
                                  type="text"
                                  value={slide.secondaryButtonUrl || ""}
                                  onChange={(e) => handleUpdateSlide(sIdx, "secondaryButtonUrl", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                />
                              </div>
                            </div>

                            {/* Slide Image + R2 Upload */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                              <div className="flex-1">
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Slide Image URL</label>
                                <input
                                  type="text"
                                  value={slide.imageUrl || ""}
                                  onChange={(e) => handleUpdateSlide(sIdx, "imageUrl", e.target.value)}
                                  placeholder="https://images.unsplash.com/..."
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                />
                              </div>
                              <label className="cursor-pointer self-start sm:self-end rounded-lg bg-purple-100 dark:bg-purple-900 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-200 hover:bg-purple-200 transition-colors">
                                {uploadingSlideIndex === sIdx ? "Uploading..." : "Upload R2"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSlideImageUpload(e, sIdx)}
                                  disabled={uploadingSlideIndex === sIdx}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          No slides added yet. Click &quot;+ Add Slide&quot; above.
                        </p>
                      )}
                    </div>
                  )}

                  {/* =========================================================================
                      TRUST BAR: 4 Columns
                     ========================================================================= */}
                  {editingSection.type === "trust_bar" && (
                    <div className="space-y-4 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                            Trust Bar Items (4 Columns)
                          </h4>
                          <p className="text-xs text-purple-700 dark:text-purple-300/80">
                            Configure trust assurances (shipping, returns, security, 24/7 support).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTrustItem}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                        >
                          + Add Benefit
                        </button>
                      </div>

                      {Array.isArray(editingSection.content?.items) &&
                        editingSection.content.items.map((item: any, tIdx: number) => (
                          <div
                            key={tIdx}
                            className="space-y-2 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-purple-950/60 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-900 dark:text-purple-200">
                                Column #{tIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTrustItem(tIdx)}
                                className="text-red-500 hover:text-red-700 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Icon Type</label>
                                <select
                                  value={item.icon || "shipping"}
                                  onChange={(e) => handleUpdateTrustItem(tIdx, "icon", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                >
                                  <option value="shipping">Shipping (Truck)</option>
                                  <option value="return">Return (30-Day Badge)</option>
                                  <option value="secure">Security (Shield Lock)</option>
                                  <option value="support">Support (Headset)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Title</label>
                                <input
                                  type="text"
                                  value={item.title || ""}
                                  onChange={(e) => handleUpdateTrustItem(tIdx, "title", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                />
                              </div>
                              <div>
                                <label className="block font-medium text-zinc-700 dark:text-purple-200">Description</label>
                                <input
                                  type="text"
                                  value={item.description || ""}
                                  onChange={(e) => handleUpdateTrustItem(tIdx, "description", e.target.value)}
                                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-zinc-50 dark:bg-purple-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-purple-100"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* =========================================================================
                      NEW ARRIVALS SECTION
                     ========================================================================= */}
                  {editingSection.type === "new_arrivals" && (
                    <div className="space-y-4 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 p-4 sm:p-5">
                      <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                        New Arrivals Showcase Settings
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-zinc-700 dark:text-purple-200">Badge Text</label>
                          <input
                            type="text"
                            value={editingSection.content?.badge || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, badge: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-zinc-700 dark:text-purple-200">Discount Pill</label>
                          <input
                            type="text"
                            value={editingSection.content?.discountText || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, discountText: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-zinc-700 dark:text-purple-200">Heading</label>
                          <input
                            type="text"
                            value={editingSection.content?.heading || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, heading: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-zinc-700 dark:text-purple-200">Button Text</label>
                          <input
                            type="text"
                            value={editingSection.content?.buttonText || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, buttonText: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      BRAND LOGOS ROW
                     ========================================================================= */}
                  {editingSection.type === "brand_logos" && (
                    <div className="space-y-4 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                            Partner / Brand Logos
                          </h4>
                          <p className="text-xs text-purple-700 dark:text-purple-300/80">
                            Displays marquee row of partner brands in grayscale.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddLogo}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                        >
                          + Add Brand
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.isArray(editingSection.content?.logos) &&
                          editingSection.content.logos.map((logo: any, lIdx: number) => (
                            <div
                              key={lIdx}
                              className="flex items-center gap-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950 p-2.5 text-xs"
                            >
                              <input
                                type="text"
                                value={logo.logoText || ""}
                                placeholder="Logo Monogram / Name"
                                onChange={(e) => handleUpdateLogo(lIdx, "logoText", e.target.value)}
                                className="flex-1 rounded-lg border border-zinc-300 dark:border-purple-850 bg-zinc-50 dark:bg-purple-950 px-2 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveLogo(lIdx)}
                                className="text-red-500 hover:text-red-700 font-bold px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      GENERIC / SHARED IMAGE & R2 UPLOAD (for sections with main image)
                     ========================================================================= */}
                  {editingSection.type !== "hero" && editingSection.type !== "hero_carousel" && (
                    <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-800 dark:text-purple-200">
                          Section Image (Cloudflare R2)
                        </label>
                        <label className="cursor-pointer rounded-lg bg-purple-100 dark:bg-purple-900 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-200 hover:bg-purple-200 transition-colors">
                          {uploadingImage ? "Uploading to R2..." : "Upload Image to R2"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="https://... or upload image directly"
                        value={editingSection.imageUrl || ""}
                        onChange={(e) => setEditingSection({ ...editingSection, imageUrl: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950/50 px-3 py-1.5 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                      />
                      {editingSection.imageUrl && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={editingSection.imageUrl}
                            alt="Preview"
                            className="h-14 w-24 rounded-lg object-cover border border-purple-200 dark:border-purple-800"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingSection({ ...editingSection, imageUrl: null })}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove image
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* =========================================================================
                      GENERAL COPY FIELDS (Heading, Subheading, Badge)
                     ========================================================================= */}
                  {editingSection.type !== "hero" && editingSection.type !== "hero_carousel" && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                        Content & Text Fields
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                            Main Heading
                          </label>
                          <input
                            type="text"
                            value={editingSection.content?.heading || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, heading: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                            Badge Text (Pill)
                          </label>
                          <input
                            type="text"
                            value={editingSection.content?.badgeText || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, badgeText: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                          Subheading / Description
                        </label>
                        <textarea
                          rows={2}
                          value={editingSection.content?.subheading || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, subheading: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950/50 px-3 py-2 text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      NEWSLETTER SPECIFIC FIELDS
                     ========================================================================= */}
                  {editingSection.type === "newsletter" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 p-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={editingSection.content?.buttonText || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, buttonText: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={editingSection.content?.placeholderText || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, placeholderText: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                          Privacy Disclaimer
                        </label>
                        <input
                          type="text"
                          value={editingSection.content?.disclaimer || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, disclaimer: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      CUSTOM HTML SPECIFIC FIELDS
                     ========================================================================= */}
                  {editingSection.type === "custom_html" && (
                    <div className="space-y-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 p-4">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-purple-200">
                        HTML Content
                      </label>
                      <textarea
                        rows={5}
                        value={editingSection.content?.html || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: { ...editingSection.content, html: e.target.value },
                          })
                        }
                        className="w-full rounded-xl border border-zinc-300 dark:border-purple-800 bg-white dark:bg-purple-950 p-3 font-mono text-xs text-zinc-900 dark:text-purple-100 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="mt-4 flex justify-between items-center border-t border-purple-100 dark:border-purple-900 pt-4">
              <div className="text-xs text-purple-700 dark:text-purple-300">
                {editingSection.isActive ? "🟣 Visible on storefront" : "⚪ Hidden from storefront"}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-xl border border-zinc-300 dark:border-purple-800 bg-zinc-100 dark:bg-purple-950/60 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-purple-200 hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSection}
                  disabled={saving}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-xs font-semibold shadow-lg shadow-purple-500/25 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving to D1..." : "Save Section"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

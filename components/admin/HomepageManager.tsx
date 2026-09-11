"use client";

import React, { useState, useEffect } from "react";
import { HomepageSectionRecord, HomepageSectionType } from "@/lib/homepage";
import { renderHomepageSection } from "@/components/homepage/HomepageSections";

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

  // Fetch sections from API
  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/homepage");
      const json = (await res.json()) as any;
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

    // Optimistically update order
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
        showNotification("Homepage section sequence updated in Cloudflare D1.");
      } else {
        fetchSections(); // revert
      }
    } catch (err) {
      fetchSections();
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
        "Are you sure you want to restore default template sections? Default sections will be populated into Cloudflare D1."
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
        fetchSections();
        showNotification("Default homepage sections restored successfully.");
      } else {
        alert(json.error || "Failed to restore defaults.");
      }
    } catch (err) {
      alert("Error restoring defaults.");
    }
  };

  // Upload image to Cloudflare R2
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
        showNotification(
          isNew ? "New homepage section created successfully!" : "Homepage section updated successfully!"
        );
        setEditingSection(null);
        fetchSections();
      } else {
        alert(json.error || "Failed to save section.");
      }
    } catch (err) {
      alert("Error saving section.");
    } finally {
      setSaving(false);
    }
  };

  // Testimonial Item helpers
  const handleAddTestimonial = () => {
    if (!editingSection) return;
    const currentList = Array.isArray(editingSection.content?.testimonials)
      ? [...editingSection.content.testimonials]
      : [];
    currentList.push({
      quote: "Outstanding athletic performance and edge speed.",
      author: "Alex Rivera",
      role: "Pro Athlete",
      rating: 5,
      avatar: "",
    });
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, testimonials: currentList },
    });
  };

  const handleUpdateTestimonial = (idx: number, field: string, value: any) => {
    if (!editingSection) return;
    const currentList = Array.isArray(editingSection.content?.testimonials)
      ? [...editingSection.content.testimonials]
      : [];
    currentList[idx] = { ...currentList[idx], [field]: value };
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, testimonials: currentList },
    });
  };

  const handleRemoveTestimonial = (idx: number) => {
    if (!editingSection) return;
    const currentList = Array.isArray(editingSection.content?.testimonials)
      ? [...editingSection.content.testimonials]
      : [];
    currentList.splice(idx, 1);
    setEditingSection({
      ...editingSection,
      content: { ...editingSection.content, testimonials: currentList },
    });
  };

  // Add section preset helper
  const handleOpenAddModal = (presetType: HomepageSectionType = "promo_banner") => {
    let initialContent: Record<string, any> = {};

    switch (presetType) {
      case "hero":
        initialContent = {
          heading: "Engineered for Peak Athletic Velocity",
          subheading: "Discover precision athletic gear crafted for high-intensity training and endurance.",
          badgeText: "New Season Collection",
          buttonText: "Shop Featured Gear",
          buttonUrl: "#featured-products",
          secondaryButtonText: "Explore Collections",
          secondaryButtonUrl: "#categories-section",
          alignment: "left",
        };
        break;
      case "testimonials":
        initialContent = {
          badgeText: "Athlete Endorsements",
          heading: "Proven by Elite Competitors",
          subheading: "Real feedback from world-class athletes training with Apex gear.",
          testimonials: [
            {
              quote: "The lightness and energy return shaved seconds off my sprint times.",
              author: "Taylor Reed",
              role: "Track & Field Sprinter",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
            },
            {
              quote: "Hyper-durable materials that withstand daily high-intensity workouts.",
              author: "Samir Patel",
              role: "Olympic Lifting Coach",
              rating: 5,
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
            },
          ],
        };
        break;
      case "newsletter":
        initialContent = {
          badgeText: "VIP Access",
          heading: "Unlock Early Access to Limited Edition Drops",
          subheading: "Subscribe to receive private launch alerts and member discounts.",
          buttonText: "Join Apex VIP",
          placeholderText: "Enter your email address...",
          disclaimer: "No spam. Unsubscribe anytime with one click.",
        };
        break;
      case "custom_html":
        initialContent = {
          heading: "Custom Brand Showcase",
          subheading: "Special dynamic content block.",
          html: "<div style='padding: 20px; background: rgba(24,199,41,0.08); border-radius: 12px; border: 1px solid rgba(24,199,41,0.2);'><p style='color: #18C729; font-weight: bold;'>⚡ Custom HTML section rendered safely with edge performance.</p></div>",
          buttonText: "Learn More",
          buttonUrl: "/search",
        };
        break;
      default:
        initialContent = {
          heading: "New Showcase Announcement",
          subheading: "Discover innovative new releases.",
          badgeText: "New Arrival",
          buttonText: "Shop Now",
          buttonUrl: "/search",
        };
    }

    setEditingSection({
      id: `new-${Date.now()}`,
      type: presetType,
      title: `New ${presetType.replace("_", " ")} Section`,
      imageUrl: "",
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Dynamic Homepage Manager</h1>
          <p className="mt-1 text-xs text-white/60">
            Control storefront sections, content, images, reordering, and visibility in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            Restore Default Templates
          </button>

          <div className="relative group">
            <button
              type="button"
              onClick={() => handleOpenAddModal("promo_banner")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Section
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Presets Strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        <span className="text-xs font-semibold text-white/70 mr-1">Quick Add:</span>
        <button
          type="button"
          onClick={() => handleOpenAddModal("testimonials")}
          className="rounded-lg border border-white/10 bg-[#0d1611] px-2.5 py-1 text-xs text-white hover:border-[#18C729] hover:text-[#18C729] transition-colors"
        >
          + Testimonials
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("newsletter")}
          className="rounded-lg border border-white/10 bg-[#0d1611] px-2.5 py-1 text-xs text-white hover:border-[#18C729] hover:text-[#18C729] transition-colors"
        >
          + Newsletter
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("promo_banner")}
          className="rounded-lg border border-white/10 bg-[#0d1611] px-2.5 py-1 text-xs text-white hover:border-[#18C729] hover:text-[#18C729] transition-colors"
        >
          + Promo Banner
        </button>
        <button
          type="button"
          onClick={() => handleOpenAddModal("custom_html")}
          className="rounded-lg border border-white/10 bg-[#0d1611] px-2.5 py-1 text-xs text-white hover:border-[#18C729] hover:text-[#18C729] transition-colors"
        >
          + Custom HTML
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-xl border border-[#18C729]/40 bg-[#18C729]/10 p-3 text-xs font-medium text-[#18C729] flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchSections}
            className="underline hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sections List */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d1611] p-12 text-center text-xs text-white/50 animate-pulse">
          Loading homepage sections from Cloudflare D1...
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0c140f]/60 p-12 text-center">
          <p className="text-sm font-semibold text-white">No sections currently configured.</p>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="mt-4 rounded-xl bg-[#18C729] px-4 py-2 text-xs font-semibold text-black"
          >
            Populate Default Templates
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border transition-all p-4 ${
                sec.isActive
                  ? "border-white/15 bg-[#0d1611] hover:border-white/25"
                  : "border-white/5 bg-[#090e0b]/60 opacity-60"
              }`}
            >
              {/* Left Column: Sort controls + Badge + Title */}
              <div className="flex items-center gap-3">
                {/* Reorder Up/Down arrows */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="h-6 w-6 rounded bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="h-6 w-6 rounded bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5"
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>

                {/* Section Index */}
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-bold text-[#18C729]">
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#FEF500]">
                      {sec.type}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        sec.isActive
                          ? "bg-[#18C729]/15 text-[#18C729]"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {sec.isActive ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-white">{sec.title}</h3>
                  <p className="text-xs text-white/50 truncate max-w-md">
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
                      ? "border-[#18C729]/30 bg-[#18C729]/10 text-[#18C729] hover:bg-[#18C729]/20"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
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
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit / Preview
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sec.id, sec.title)}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-all"
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
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/20 bg-[#0d1611] p-6 sm:p-8 shadow-2xl my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header with Edit / Live Preview Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingSection.id.startsWith("new-") ? "Create New Section" : "Edit Homepage Section"}
                </h2>
                <p className="text-xs text-white/50">
                  Type: <span className="font-mono text-[#FEF500] uppercase">{editingSection.type}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      activeTab === "edit"
                        ? "bg-[#18C729] text-black"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Form Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                      activeTab === "preview"
                        ? "bg-[#18C729] text-black"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-4 pr-1">
              {activeTab === "preview" ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/60 flex items-center justify-between">
                    <span>⚡ Live rendering of this section as it appears on the storefront:</span>
                    <span className="font-mono text-[#18C729] uppercase font-bold">{editingSection.type}</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#080e0a] p-4 sm:p-6 overflow-hidden">
                    {renderHomepageSection(editingSection)}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveSection} id="section-form" className="space-y-5">
                  {/* Basic Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70">Section Title (Admin Reference)</label>
                      <input
                        type="text"
                        required
                        value={editingSection.title}
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70">Section Type</label>
                      <select
                        value={editingSection.type}
                        onChange={(e) => setEditingSection({ ...editingSection, type: e.target.value as HomepageSectionType })}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-[#0d1611] px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                      >
                        <option value="hero">Hero Showcase</option>
                        <option value="categories">Categories Grid</option>
                        <option value="featured_products">Featured Products</option>
                        <option value="promo_banner">Promotional Banner</option>
                        <option value="brand_story">Brand Story & Stats</option>
                        <option value="testimonials">Testimonials Section</option>
                        <option value="newsletter">Newsletter Subscription</option>
                        <option value="custom_html">Custom HTML / Block</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center gap-3 py-1">
                    <input
                      type="checkbox"
                      id="modal-active"
                      checked={editingSection.isActive}
                      onChange={(e) => setEditingSection({ ...editingSection, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#18C729] focus:ring-[#18C729]"
                    />
                    <label htmlFor="modal-active" className="text-xs text-white font-medium cursor-pointer">
                      Active (Visible on Storefront Homepage)
                    </label>
                  </div>

                  {/* Image URL & R2 Upload */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Section Image (Cloudflare R2)</label>
                      <label className="cursor-pointer rounded-lg bg-[#18C729]/20 px-2.5 py-1 text-[11px] font-semibold text-[#18C729] hover:bg-[#18C729]/30 transition-colors">
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
                      className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#18C729] focus:outline-none"
                    />
                    {editingSection.imageUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={editingSection.imageUrl}
                          alt="Preview"
                          className="h-14 w-24 rounded-lg object-cover border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingSection({ ...editingSection, imageUrl: null })}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Remove image
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Common Heading & Subheading Fields */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#FEF500]">
                      Content & Copy Fields
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70">Main Heading</label>
                        <input
                          type="text"
                          value={editingSection.content?.heading || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, heading: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/70">Badge Text (Tag / Pill)</label>
                        <input
                          type="text"
                          value={editingSection.content?.badgeText || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, badgeText: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70">Subheading / Description</label>
                      <textarea
                        rows={2}
                        value={editingSection.content?.subheading || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: { ...editingSection.content, subheading: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                      />
                    </div>

                    {/* Hero Specific Fields */}
                    {editingSection.type === "hero" && (
                      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                        <h5 className="text-xs font-bold text-white">Hero Buttons & Alignment</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-white/70">Primary Button Label</label>
                            <input
                              type="text"
                              value={editingSection.content?.buttonText || ""}
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  content: { ...editingSection.content, buttonText: e.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-white/70">Primary Button URL</label>
                            <input
                              type="text"
                              value={editingSection.content?.buttonUrl || ""}
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  content: { ...editingSection.content, buttonUrl: e.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-white/70">Secondary Button Label</label>
                            <input
                              type="text"
                              value={editingSection.content?.secondaryButtonText || ""}
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  content: { ...editingSection.content, secondaryButtonText: e.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-white/70">Secondary Button URL</label>
                            <input
                              type="text"
                              value={editingSection.content?.secondaryButtonUrl || ""}
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  content: { ...editingSection.content, secondaryButtonUrl: e.target.value },
                                })
                              }
                              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Promo Banner Fields */}
                    {editingSection.type === "promo_banner" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                        <div>
                          <label className="block text-xs font-semibold text-white/70">Button Label</label>
                          <input
                            type="text"
                            value={editingSection.content?.buttonText || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, buttonText: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-white/70">Button URL</label>
                          <input
                            type="text"
                            value={editingSection.content?.buttonUrl || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, buttonUrl: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Testimonials Fields */}
                    {editingSection.type === "testimonials" && (
                      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white">Testimonial Quotes</h5>
                          <button
                            type="button"
                            onClick={handleAddTestimonial}
                            className="rounded-lg bg-[#18C729]/20 px-2.5 py-1 text-xs font-semibold text-[#18C729] hover:bg-[#18C729]/30"
                          >
                            + Add Testimonial
                          </button>
                        </div>

                        {Array.isArray(editingSection.content?.testimonials) &&
                          editingSection.content.testimonials.map((t: any, idx: number) => (
                            <div
                              key={idx}
                              className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-3 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">Item #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTestimonial(idx)}
                                  className="text-red-400 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Quote statement..."
                                value={t.quote || ""}
                                onChange={(e) => handleUpdateTestimonial(idx, "quote", e.target.value)}
                                className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white focus:border-[#18C729] focus:outline-none"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="Author Name"
                                  value={t.author || ""}
                                  onChange={(e) => handleUpdateTestimonial(idx, "author", e.target.value)}
                                  className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Role / Sport"
                                  value={t.role || ""}
                                  onChange={(e) => handleUpdateTestimonial(idx, "role", e.target.value)}
                                  className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Avatar Image URL"
                                  value={t.avatar || ""}
                                  onChange={(e) => handleUpdateTestimonial(idx, "avatar", e.target.value)}
                                  className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Newsletter Specific Fields */}
                    {editingSection.type === "newsletter" && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                        <div>
                          <label className="block text-xs font-semibold text-white/70">Button Text</label>
                          <input
                            type="text"
                            value={editingSection.content?.buttonText || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, buttonText: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-white/70">Placeholder Text</label>
                          <input
                            type="text"
                            value={editingSection.content?.placeholderText || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, placeholderText: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-white/70">Disclaimer</label>
                          <input
                            type="text"
                            value={editingSection.content?.disclaimer || ""}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                content: { ...editingSection.content, disclaimer: e.target.value },
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Custom HTML Specific Fields */}
                    {editingSection.type === "custom_html" && (
                      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                        <label className="block text-xs font-semibold text-white/70">HTML Content</label>
                        <textarea
                          rows={5}
                          value={editingSection.content?.html || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, html: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 font-mono text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="mt-4 flex justify-between items-center border-t border-white/10 pt-4">
              <div className="text-xs text-white/50">
                {editingSection.isActive ? "🟢 Visible on storefront" : "⚪ Hidden from storefront"}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSection}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
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

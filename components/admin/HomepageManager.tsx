"use client";

import React, { useState, useEffect } from "react";
import { HomepageSectionRecord, HomepageSectionType } from "@/lib/homepage";

export default function HomepageManager(): React.JSX.Element {
  const [sections, setSections] = useState<HomepageSectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingSection, setEditingSection] = useState<HomepageSectionRecord | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load sections from admin API
  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/homepage/sections");
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
      const res = await fetch(`/api/admin/homepage/sections/${sec.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setSections((prev) =>
          prev.map((s) => (s.id === sec.id ? { ...s, isActive: updatedStatus } : s))
        );
        showNotification(`Section "${sec.title}" is now ${updatedStatus ? "Active" : "Hidden"}.`);
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

    const orderedIds = newSections.map((s) => s.id);
    setSections(newSections);

    try {
      const res = await fetch("/api/admin/homepage/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        showNotification("Homepage section order updated.");
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
      const res = await fetch(`/api/admin/homepage/sections/${id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as any;
      if (json.success) {
        setSections((prev) => prev.filter((s) => s.id !== id));
        showNotification("Section deleted.");
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
        "Are you sure you want to restore default template sections? Any custom sections will remain but default sections will be re-added."
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/homepage/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const json = (await res.json()) as any;
      if (json.success) {
        fetchSections();
        showNotification("Default homepage sections restored.");
      }
    } catch (err) {
      alert("Error restoring defaults.");
    }
  };

  // Upload image to R2
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
      const url = isNew
        ? "/api/admin/homepage/sections"
        : `/api/admin/homepage/sections/${editingSection.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSection),
      });
      const json = (await res.json()) as any;

      if (json.success) {
        showNotification(
          isNew ? "New section created successfully!" : "Section updated successfully!"
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

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Homepage Manager</h1>
          <p className="mt-1 text-xs text-white/60">
            Control dynamic storefront sections, reorder layouts, and edit banners saved directly in Cloudflare D1.
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
          <button
            type="button"
            onClick={() =>
              setEditingSection({
                id: `new-${Date.now()}`,
                type: "promo_banner",
                title: "New Promotional Banner",
                imageUrl: "",
                sortOrder: sections.length + 1,
                isActive: true,
                content: {
                  heading: "Special Feature Announcement",
                  subheading: "Discover our newest collection designed for ultimate velocity.",
                  badgeText: "New Arrival",
                  buttonText: "Shop Collection",
                  buttonUrl: "/search",
                },
                createdAt: "",
                updatedAt: "",
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Section
          </button>
        </div>
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
                      {sec.isActive ? "Active" : "Hidden"}
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
                  onClick={() => setEditingSection(JSON.parse(JSON.stringify(sec)))}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Content
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

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-[#0d1611] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingSection.id.startsWith("new-") ? "Create New Section" : "Edit Homepage Section"}
                </h2>
                <p className="text-xs text-white/50">
                  Type: <span className="font-mono text-[#FEF500] uppercase">{editingSection.type}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70">Section Title (Admin Internal)</label>
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
                    <option value="custom">Custom Content</option>
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="modal-active"
                  checked={editingSection.isActive}
                  onChange={(e) => setEditingSection({ ...editingSection, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#18C729] focus:ring-[#18C729]"
                />
                <label htmlFor="modal-active" className="text-xs text-white font-medium">
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

              {/* Dynamic Content Fields Based on Section Type */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FEF500]">
                  {editingSection.type.replace("_", " ")} Content Settings
                </h4>

                {/* Heading & Subheading (Common to almost all sections) */}
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
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70">Badge Text</label>
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
                      <div>
                        <label className="block text-xs font-semibold text-white/70">Alignment</label>
                        <select
                          value={editingSection.content?.alignment || "left"}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, alignment: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-white/15 bg-[#0d1611] px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        >
                          <option value="left">Left Aligned</option>
                          <option value="center">Centered</option>
                        </select>
                      </div>
                    </div>

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
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
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
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
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
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Promo Banner Fields */}
                {editingSection.type === "promo_banner" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70">Badge Text</label>
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
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
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
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Brand Story Fields */}
                {editingSection.type === "brand_story" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-white/70">Narrative Manifesto</label>
                      <textarea
                        rows={4}
                        value={editingSection.content?.narrativeText || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: { ...editingSection.content, narrativeText: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70">CTA Label</label>
                        <input
                          type="text"
                          value={editingSection.content?.ctaText || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, ctaText: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/70">CTA URL</label>
                        <input
                          type="text"
                          value={editingSection.content?.ctaUrl || ""}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              content: { ...editingSection.content, ctaUrl: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Categories & Products settings */}
                {(editingSection.type === "categories" || editingSection.type === "featured_products") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70">Max Items to Display</label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={editingSection.content?.maxItems || 6}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: {
                              ...editingSection.content,
                              maxItems: parseInt(e.target.value) || 6,
                            },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70">View All URL</label>
                      <input
                        type="text"
                        value={editingSection.content?.viewAllUrl || "/search"}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            content: { ...editingSection.content, viewAllUrl: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving to D1..." : "Save Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

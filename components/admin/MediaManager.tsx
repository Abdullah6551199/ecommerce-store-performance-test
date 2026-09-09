"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { normalizeImageUrl } from "@/lib/utils";

export interface MediaItem {
  id: string;
  url: string;
  type: string;
  altText: string | null;
  size: number;
  createdAt: string;
}

export interface MediaSummary {
  totalFiles: number;
  filteredCount?: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
}

export default function MediaManager(): React.JSX.Element {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [summary, setSummary] = useState<MediaSummary>({
    totalFiles: 0,
    totalSizeBytes: 0,
    totalSizeFormatted: "0 B",
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async (searchQuery = "", type = "all") => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (type && type !== "all") params.set("type", type);

      const url = `/api/admin/media${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const json = (await res.json()) as {
        success: boolean;
        data?: { items: MediaItem[]; summary: MediaSummary };
        error?: string;
      };

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load media assets.");
      }

      if (json.data) {
        setItems(json.data.items || []);
        if (!searchQuery && type === "all") {
          setSummary(json.data.summary);
        }
      }
    } catch (err) {
      console.error("[MediaManager] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia(search, typeFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadMessage(null);

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "uploads");

        try {
          const res = await fetch("/api/media", {
            method: "POST",
            body: formData,
          });
          const json = (await res.json()) as { success?: boolean; error?: string };
          if (res.ok && json.success) {
            successCount++;
          } else {
            failCount++;
            console.error(`Failed uploading ${file.name}:`, json.error);
          }
        } catch (err) {
          failCount++;
          console.error(`Upload error for ${file.name}:`, err);
        }
      }

      if (successCount > 0) {
        setUploadMessage({
          type: "success",
          text: `Successfully uploaded ${successCount} file${successCount > 1 ? "s" : ""} to Cloudflare R2!`,
        });
        fetchMedia(search, typeFilter);
      } else {
        setUploadMessage({
          type: "error",
          text: "Upload failed. Please check file type (JPEG, PNG, WEBP, SVG) and file size (under 10MB).",
        });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => {
        setUploadMessage(null);
      }, 5000);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const formatDate = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const getFileName = (url: string): string => {
    try {
      const clean = url.split("?")[0];
      const parts = clean.split("/");
      return parts[parts.length - 1] || "asset";
    } catch {
      return "asset";
    }
  };

  const getTypeLabel = (mimeType: string): string => {
    if (!mimeType) return "FILE";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "JPG";
    if (mimeType.includes("png")) return "PNG";
    if (mimeType.includes("webp")) return "WEBP";
    if (mimeType.includes("svg")) return "SVG";
    if (mimeType.includes("gif")) return "GIF";
    if (mimeType.includes("avif")) return "AVIF";
    return mimeType.split("/")[1]?.toUpperCase() || "FILE";
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Media Library</h1>
          <p className="mt-1 text-xs text-white/60">
            Cloudflare R2 object storage asset management and high-resolution image repository.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchMedia(search, typeFilter)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-[#18C729]" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a321] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-[#18C729]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Uploading to R2...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Assets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Status Toast / Banner */}
      {uploadMessage && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
            uploadMessage.type === "success"
              ? "border-[#18C729]/30 bg-[#18C729]/10 text-[#18C729]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{uploadMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadMessage(null)}
            className="text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Total Assets Stored</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18C729]/15 text-[#18C729]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-white">{summary.totalFiles}</div>
          <p className="mt-1 text-[11px] text-white/40">Synchronized in D1 database</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Storage Volume</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF500]/15 text-[#FEF500]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-white">{summary.totalSizeFormatted}</div>
          <p className="mt-1 text-[11px] text-white/40">Cloudflare R2 object storage</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c140f] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Storage Provider</span>
            <span className="rounded-lg border border-[#18C729]/30 bg-[#18C729]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#18C729]">
              ACTIVE
            </span>
          </div>
          <div className="mt-3 text-lg font-bold text-white">Cloudflare R2</div>
          <p className="mt-1 text-[11px] text-white/40">Bucket: ecommerce-store-assets</p>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0c140f] p-3 shadow-lg lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by filename, URL, or alt text..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-1 focus:ring-[#18C729]"
          />
        </div>

        {/* Type Filter & View Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
          >
            <option value="all">All File Types</option>
            <option value="image/jpeg">JPEG Images</option>
            <option value="image/png">PNG Images</option>
            <option value="image/webp">WebP Images</option>
            <option value="image/svg">SVG Graphics</option>
            <option value="image/gif">GIF Animations</option>
          </select>

          <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-[#18C729] text-black font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
              title="Grid View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-[#18C729] text-black font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
              title="Table View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div>
          {isLoading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0c140f] p-16 text-white/40">
              <svg className="h-8 w-8 animate-spin text-[#18C729] mb-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Loading media assets from Cloudflare R2...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0c140f]/60 p-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 mb-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">No media assets found</p>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                {search || typeFilter !== "all"
                  ? "No images matched your filter parameters."
                  : "Upload image assets to Cloudflare R2 to see them appear here."}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all"
              >
                Upload First Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((item) => {
                const normUrl = normalizeImageUrl(item.url);
                const fileName = getFileName(item.url);
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c140f] hover:border-[#18C729]/50 transition-all shadow-md hover:shadow-xl hover:shadow-[#18C729]/5"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative aspect-square w-full cursor-pointer overflow-hidden bg-black/40"
                      onClick={() => setSelectedItem(item)}
                    >
                      <img
                        src={normUrl}
                        alt={item.altText || fileName}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback icon visual on error
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector(".fallback-icon")) {
                            const div = document.createElement("div");
                            div.className =
                              "fallback-icon flex h-full w-full items-center justify-center text-white/30 text-xs font-mono";
                            div.innerText = "Preview N/A";
                            parent.appendChild(div);
                          }
                        }}
                      />

                      {/* Format Badge */}
                      <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white backdrop-blur-sm">
                        {getTypeLabel(item.type)}
                      </span>

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(normUrl, item.id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-[#18C729] hover:text-black transition-all"
                          title="Copy Image URL"
                        >
                          {copiedId === item.id ? (
                            <span className="text-xs font-bold">✓</span>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>

                        <a
                          href={normUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/40 transition-all"
                          title="Open Full Image"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* Meta Card */}
                    <div className="flex flex-1 flex-col justify-between p-2.5 text-[11px]">
                      <div className="truncate font-medium text-white/90" title={fileName}>
                        {fileName}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-white/40">
                        <span>{formatBytes(item.size)}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c140f] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead className="border-b border-white/10 bg-black/30 text-[11px] uppercase tracking-wider text-white/50">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Preview</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">File Name / URL</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Type</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Size</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Uploaded</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading && items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-white/40">
                      Loading media assets...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-white/40">
                      No media files found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const normUrl = normalizeImageUrl(item.url);
                    const fileName = getFileName(item.url);
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Thumbnail */}
                        <td className="px-5 py-3">
                          <div
                            className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40"
                            onClick={() => setSelectedItem(item)}
                          >
                            <img
                              src={normUrl}
                              alt={item.altText || fileName}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>

                        {/* File Name / URL */}
                        <td className="px-5 py-3">
                          <div className="font-semibold text-white truncate max-w-xs">{fileName}</div>
                          <div className="truncate max-w-md font-mono text-[10px] text-white/40">
                            {item.url}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3">
                          <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                            {getTypeLabel(item.type)}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="px-5 py-3 font-mono text-white/70">
                          {formatBytes(item.size)}
                        </td>

                        {/* Uploaded */}
                        <td className="px-5 py-3 text-[11px] text-white/50">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(normUrl, item.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/15 hover:text-white transition-all"
                            >
                              {copiedId === item.id ? (
                                <span className="text-[#18C729] font-bold">Copied!</span>
                              ) : (
                                <span>Copy URL</span>
                              )}
                            </button>

                            <a
                              href={normUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 hover:bg-white/15 hover:text-white transition-all"
                              title="Open Original"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
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
      )}

      {/* Asset Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0c140f] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h3 className="font-bold text-white">{getFileName(selectedItem.url)}</h3>
                <p className="text-xs text-white/50">{selectedItem.type} • {formatBytes(selectedItem.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 overflow-y-auto md:grid-cols-2">
              {/* Image Preview */}
              <div className="flex items-center justify-center bg-black/60 p-6">
                <img
                  src={normalizeImageUrl(selectedItem.url)}
                  alt={selectedItem.altText || "Preview"}
                  className="max-h-80 w-auto rounded-xl object-contain shadow-lg"
                />
              </div>

              {/* Details & Copy Snippets */}
              <div className="space-y-4 p-6 text-xs text-white/80">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40">Resolved Image URL</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={normalizeImageUrl(selectedItem.url)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(normalizeImageUrl(selectedItem.url), "modal-url")}
                      className="rounded-xl bg-[#18C729] px-3 py-2 font-bold text-black hover:brightness-110"
                    >
                      {copiedId === "modal-url" ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40">Markdown Snippet</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`![${selectedItem.altText || "Image"}](${normalizeImageUrl(selectedItem.url)})`}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white/70"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(`![${selectedItem.altText || "Image"}](${normalizeImageUrl(selectedItem.url)})`, "modal-md")
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10"
                    >
                      {copiedId === "modal-md" ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/40">Asset ID</span>
                    <span className="font-mono text-white/90">{selectedItem.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Uploaded At</span>
                    <span className="text-white/90">{formatDate(selectedItem.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Storage Bucket</span>
                    <span className="font-mono text-[#18C729]">ecommerce-store-assets</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={normalizeImageUrl(selectedItem.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    <span>Open High-Res Original</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

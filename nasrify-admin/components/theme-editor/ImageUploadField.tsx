"use client";

import React, { useState, useRef } from "react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  description?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  description,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "themes");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const json: any = await res.json();
      if (json.success && (json.url || json.data?.url)) {
        onChange(json.url || json.data.url);
      } else {
        setError(json.error || json.message || "Failed to upload image");
      }
    } catch (err: any) {
      setError(err.message || "Upload network error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] text-red-500 hover:text-red-700 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-gray-500">{description}</p>
      )}

      {/* Preview box */}
      {value && (
        <div className="relative aspect-video w-full rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center group">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-medium text-xs whitespace-nowrap transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export { ImageUploadField };

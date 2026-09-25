"use client";

import React, { useState, useRef } from "react";

export interface CropData {
  aspectRatio?: "free" | "1:1" | "16:9" | "4:3" | "3:2";
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  zoom?: number; // 100-200
  fit?: "cover" | "contain" | "fill";
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  cropData?: CropData;
  onCropChange?: (cropData: CropData) => void;
  description?: string;
}

const POSITIONS: Array<{ id: CropData["position"]; label: string }> = [
  { id: "top-left", label: "TL" },
  { id: "top-center", label: "TC" },
  { id: "top-right", label: "TR" },
  { id: "center-left", label: "CL" },
  { id: "center", label: "C" },
  { id: "center-right", label: "CR" },
  { id: "bottom-left", label: "BL" },
  { id: "bottom-center", label: "BC" },
  { id: "bottom-right", label: "BR" },
];

export function ImageUploadField({
  label,
  value,
  onChange,
  cropData,
  onCropChange,
  description,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop local state
  const [localCrop, setLocalCrop] = useState<CropData>(
    cropData || {
      aspectRatio: "16:9",
      position: "center",
      zoom: 100,
      fit: "cover",
    }
  );

  const handleOpenCrop = () => {
    setLocalCrop(
      cropData || {
        aspectRatio: "16:9",
        position: "center",
        zoom: 100,
        fit: "cover",
      }
    );
    setIsCropOpen(true);
  };

  const handleSaveCrop = () => {
    if (onCropChange) {
      onCropChange(localCrop);
    }
    setIsCropOpen(false);
  };

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
        <label className="font-semibold text-slate-300">{label}</label>
        {value && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCrop}
              className="text-[11px] text-[#25D366] hover:underline flex items-center gap-1"
            >
              <span>✂️</span> Crop & Position
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      {/* Preview box */}
      {value && (
        <div className="relative aspect-video w-full rounded-lg border border-slate-800 overflow-hidden bg-slate-950 flex items-center justify-center group">
          <img
            src={value}
            alt={label}
            style={{
              objectFit: cropData?.fit || "cover",
              objectPosition: cropData?.position?.replace("-", " ") || "center",
              transform: cropData?.zoom ? `scale(${cropData.zoom / 100})` : undefined,
            }}
            className="w-full h-full transition-transform"
          />
          <button
            type="button"
            onClick={handleOpenCrop}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity"
          >
            Adjust Crop & Fit
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:ring-1 focus:ring-[#25D366] focus:outline-hidden"
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
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs whitespace-nowrap transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <p className="text-[11px] text-rose-400">{error}</p>}

      {/* Crop & Position Modal */}
      {isCropOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>✂️</span> Image Crop & Position
              </h3>
              <button
                type="button"
                onClick={() => setIsCropOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Live Preview */}
            <div
              className={`w-full overflow-hidden bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center ${
                localCrop.aspectRatio === "1:1"
                  ? "aspect-square max-w-[240px] mx-auto"
                  : localCrop.aspectRatio === "4:3"
                  ? "aspect-4/3"
                  : localCrop.aspectRatio === "3:2"
                  ? "aspect-3/2"
                  : "aspect-video"
              }`}
            >
              <img
                src={value}
                alt="Preview"
                style={{
                  objectFit: localCrop.fit || "cover",
                  objectPosition: localCrop.position?.replace("-", " ") || "center",
                  transform: localCrop.zoom ? `scale(${localCrop.zoom / 100})` : undefined,
                }}
                className="w-full h-full transition-all"
              />
            </div>

            {/* Aspect Ratio Presets */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">Aspect Ratio</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(["free", "1:1", "16:9", "4:3", "3:2"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setLocalCrop({ ...localCrop, aspectRatio: ratio })}
                    className={`py-1 rounded text-xs font-medium border transition-colors ${
                      localCrop.aspectRatio === ratio
                        ? "bg-[#25D366]/20 border-[#25D366] text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Mode */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">Fit Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(["cover", "contain", "fill"] as const).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setLocalCrop({ ...localCrop, fit })}
                    className={`py-1 rounded text-xs font-medium capitalize border transition-colors ${
                      localCrop.fit === fit
                        ? "bg-[#25D366]/20 border-[#25D366] text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            {/* 9-Grid Position */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-400">Focal Position (9-Grid)</label>
              <div className="grid grid-cols-3 gap-1.5 max-w-[180px]">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setLocalCrop({ ...localCrop, position: pos.id })}
                    className={`h-7 rounded text-[11px] font-mono border transition-colors ${
                      localCrop.position === pos.id
                        ? "bg-[#25D366] border-[#25D366] text-slate-950 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Zoom Scale</span>
                <span className="font-mono text-slate-200">{localCrop.zoom || 100}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="200"
                step="5"
                value={localCrop.zoom || 100}
                onChange={(e) =>
                  setLocalCrop({ ...localCrop, zoom: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#25D366]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() =>
                  setLocalCrop({
                    aspectRatio: "16:9",
                    position: "center",
                    zoom: 100,
                    fit: "cover",
                  })
                }
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsCropOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                className="px-4 py-1.5 bg-[#25D366] hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploadField;

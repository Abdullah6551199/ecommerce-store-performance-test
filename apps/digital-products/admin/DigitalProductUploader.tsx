"use client";

import React, { useState, useRef } from "react";
import type { DigitalFile } from "../shared/types";

interface DigitalProductUploaderProps {
  productId?: string;
  onFileUploaded: (file: DigitalFile) => void;
}

export function DigitalProductUploader({
  productId = "general",
  onFileUploaded,
}: DigitalProductUploaderProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  async function uploadFile(file: File) {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    // 500MB limit
    if (file.size > 500 * 1024 * 1024) {
      setUploadError(`File size (${formatFileSize(file.size)}) exceeds maximum limit of 500MB.`);
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const res = await fetch("/api/apps/digital-products/upload", {
        method: "POST",
        body: formData,
      });

      const data: any = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadSuccess(`Uploaded ${data.file.name} (${formatFileSize(data.file.size)}) successfully.`);
      onFileUploaded(data.file);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload file to Cloudflare R2.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-[#25D366] bg-[#F4F4F5]/50 dark:bg-[#18181B]/20 scale-[1.01]"
            : "border-zinc-300 dark:border-zinc-700 hover:border-[#25D366] dark:hover:border-[#1EA855] bg-zinc-50/60 dark:bg-zinc-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.zip,.mp3,.mp4,.webm,.jpg,.jpeg,.png,.epub,.docx,.xlsx,.txt"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              uploadFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#25D366] dark:text-zinc-400 flex items-center justify-center text-2xl shadow-inner">
            {isUploading ? "⏳" : "☁️"}
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {isUploading ? "Uploading file to Cloudflare R2..." : "Click or drag file to upload"}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              PDF, ZIP, MP3, MP4, WEBM, JPG, PNG, EPUB, DOCX, XLSX (Max 500MB)
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {uploadSuccess}
        </div>
      )}
    </div>
  );
}

export default DigitalProductUploader;

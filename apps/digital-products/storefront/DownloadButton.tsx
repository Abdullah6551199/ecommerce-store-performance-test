"use client";

import React, { useState } from "react";

interface DownloadButtonProps {
  token: string;
  fileName: string;
  downloadedCount?: number;
  maxDownloads?: number;
  buttonText?: string;
  className?: string;
}

export function DownloadButton({
  token,
  fileName,
  downloadedCount = 0,
  maxDownloads = 5,
  buttonText = "Download File",
  className = "",
}: DownloadButtonProps): React.JSX.Element {
  const [currentCount, setCurrentCount] = useState(downloadedCount);
  const [downloading, setDownloading] = useState(false);

  const isLimitReached = currentCount >= maxDownloads;

  const handleDownload = () => {
    if (isLimitReached || downloading) return;
    setDownloading(true);

    // Direct browser navigation to download endpoint triggers file download
    window.location.href = `/api/apps/digital-products/download?token=${encodeURIComponent(token)}`;

    // Optimistically update count
    setTimeout(() => {
      setCurrentCount((prev) => Math.min(maxDownloads, prev + 1));
      setDownloading(false);
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isLimitReached || downloading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
        isLimitReached
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
          : "bg-[#25D366] hover:bg-[#1EA855] text-white shadow-sm shadow-emerald-500/20 active:scale-95"
      } ${className}`}
    >
      <span>{isLimitReached ? "🔒" : downloading ? "⏳" : "⬇️"}</span>
      <span>
        {isLimitReached
          ? "Limit Reached"
          : downloading
          ? "Starting Download..."
          : buttonText}
      </span>
      <span className="text-[10px] opacity-80 font-mono">
        ({currentCount}/{maxDownloads})
      </span>
    </button>
  );
}

export default DownloadButton;

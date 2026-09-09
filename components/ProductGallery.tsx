"use client";

import React, { useState } from "react";
import type { ProductImageRecord } from "@/lib/products";
import { normalizeImageUrl } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImageRecord[];
  productName: string;
  defaultMain: string | null;
}

export default function ProductGallery({
  images,
  productName,
  defaultMain,
}: ProductGalleryProps): React.JSX.Element {
  const allImageUrls = React.useMemo(() => {
    const urls: string[] = [];
    if (defaultMain) {
      const norm = normalizeImageUrl(defaultMain);
      if (norm) urls.push(norm);
    }
    images.forEach((img) => {
      const norm = normalizeImageUrl(img.imageUrl);
      if (norm && !urls.includes(norm)) {
        urls.push(norm);
      }
    });
    return urls;
  }, [images, defaultMain]);

  const [activeImage, setActiveImage] = useState<string>(allImageUrls[0] || "");

  if (allImageUrls.length === 0) {
    return (
      <div className="aspect-square w-full rounded-3xl border border-white/10 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
        <svg className="h-16 w-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="mt-3 text-xs text-white/40 font-mono">No Product Images Provided</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Active Featured Image Viewer */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/15 bg-black/50 shadow-2xl group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={productName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Gallery Thumbnail Strip */}
      {allImageUrls.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {allImageUrls.map((url, idx) => {
            const isCurrent = url === activeImage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(url)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition-all ${
                  isCurrent
                    ? "border-[#18C729] ring-2 ring-[#18C729]/30 scale-105"
                    : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";

export interface ProductGallerySettings {
  layout?: "grid" | "carousel" | "stack";
  thumbnails_position?: "left" | "bottom";
  zoom?: "on" | "off";
}

export default function ProductGallery({
  variant = "classic",
  settings = {},
  storeData,
}: SectionProps<ProductGallerySettings>) {
  const product = storeData?.product || {
    name: "Sample Luxury Product",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1000&auto=format&fit=crop",
    ],
  };

  const images: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const layout = settings.layout || "carousel";
  const thumbPos = settings.thumbnails_position || "bottom";
  const isZoom = settings.zoom === "on";

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        className={`flex ${
          thumbPos === "left" && layout !== "grid"
            ? "flex-col-reverse md:flex-row gap-4"
            : "flex-col gap-3"
        }`}
      >
        {/* Thumbnails (Left position) */}
        {thumbPos === "left" && images.length > 1 && layout !== "grid" && (
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px] shrink-0 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                style={{
                  borderRadius: "var(--theme-radius, 8px)",
                  borderColor:
                    activeIndex === idx
                      ? "var(--theme-primary, #25D366)"
                      : "var(--theme-border, #E4E4E7)",
                }}
                className={`relative w-16 h-16 shrink-0 overflow-hidden border-2 transition-all bg-[var(--theme-surface,#F4F4F5)] ${
                  activeIndex === idx ? "ring-2 ring-emerald-500/20" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Display */}
        {layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{ borderRadius: "var(--theme-radius, 8px)" }}
                className="relative aspect-square w-full overflow-hidden bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)]"
              >
                <Image
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  className={`object-cover ${isZoom ? "hover:scale-110 transition-transform duration-300" : ""}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{ borderRadius: "var(--theme-radius, 8px)" }}
            className="relative aspect-square w-full overflow-hidden bg-[var(--theme-surface,#F4F4F5)] border border-[var(--theme-border,#E4E4E7)]"
          >
            <Image
              src={images[activeIndex] || images[0]}
              alt={product.name || "Product image"}
              fill
              priority
              className={`object-cover object-center ${
                isZoom ? "hover:scale-110 transition-transform duration-300 cursor-crosshair" : ""
              }`}
            />
          </div>
        )}

        {/* Thumbnails (Bottom position) */}
        {thumbPos === "bottom" && images.length > 1 && layout !== "grid" && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                style={{
                  borderRadius: "var(--theme-radius, 8px)",
                  borderColor:
                    activeIndex === idx
                      ? "var(--theme-primary, #25D366)"
                      : "var(--theme-border, #E4E4E7)",
                }}
                className={`relative w-16 h-16 shrink-0 overflow-hidden border-2 transition-all bg-[var(--theme-surface,#F4F4F5)] ${
                  activeIndex === idx ? "ring-2 ring-emerald-500/20" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { renderRich } from "@/lib/themes/render-rich";

interface ImageGalleryProps {
  settings?: Record<string, any>;
  variant?: string;
}

export default function ImageGallery({
  settings = {},
  variant = "grid_3col",
}: ImageGalleryProps) {
  const currentVariant = variant || settings.variant || "grid_3col";

  const heading = settings.heading || "Visual Lookbook";
  const lightboxEnabled = settings.lightbox_enabled !== false;
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const images =
    Array.isArray(settings.images) && settings.images.length > 0
      ? settings.images
      : [
          {
            url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
            caption: "Studio Masterpiece",
          },
          {
            url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
            caption: "Winter Collection Atelier",
          },
          {
            url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
            caption: "Minimalist Silhouette",
          },
          {
            url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
            caption: "Runway Highlights",
          },
          {
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
            caption: "Organic Fibers",
          },
          {
            url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
            caption: "Golden Hour Editorial",
          },
        ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {heading && (
        <div className="text-center max-w-2xl mx-auto">
          <h2
            data-editable="heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
        </div>
      )}

      {/* Grid or Masonry */}
      <div
        className={`grid gap-4 sm:gap-6 ${
          currentVariant === "masonry"
            ? "grid-cols-2 md:grid-cols-3 auto-rows-[200px]"
            : "grid-cols-2 md:grid-cols-3"
        }`}
      >
        {images.map((img: any, idx: number) => {
          const isLarge = currentVariant === "masonry" && (idx === 0 || idx === 3);

          return (
            <div
              key={idx}
              onClick={() => lightboxEnabled && setActiveImage(img.url)}
              className={`group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 ${
                lightboxEnabled ? "cursor-pointer" : ""
              } ${isLarge ? "row-span-2" : "aspect-square"}`}
            >
              <img
                src={img.url}
                alt={img.caption || "Gallery lookbook photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-sm font-semibold text-white">
                  {img.caption || "View image"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 text-white text-3xl font-light hover:text-emerald-400"
          >
            ✕
          </button>
          <img
            src={activeImage}
            alt="Enlarged gallery view"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { EditableComponent } from "../EditableComponent";

export interface LightboxImageProps {
  id?: string;
  sectionId?: string;
  settings?: {
    image_url?: string;
    alt?: string;
    caption?: string;
  };
}

export function LightboxImage({
  id = "lightbox_image",
  sectionId,
  settings = {},
}: LightboxImageProps) {
  const imageUrl =
    settings.image_url ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop";
  const alt = settings.alt || "Zoomable product showcase";
  const caption = settings.caption;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <EditableComponent
        id={id}
        type="lightbox_image"
        sectionId={sectionId}
        className="my-3"
      >
        <div
          onClick={() => setIsOpen(true)}
          className="relative aspect-16/10 rounded-2xl overflow-hidden cursor-zoom-in group shadow-md"
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 1024px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-xs font-semibold">
              🔍 Click to Zoom
            </span>
          </div>
          {caption && (
            <p className="absolute bottom-2 left-3 text-[11px] text-white/90 bg-black/40 px-2 py-0.5 rounded">
              {caption}
            </p>
          )}
        </div>
      </EditableComponent>

      {/* Modal Lightbox */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white text-3xl font-light hover:scale-110 transition-transform p-2 z-10"
              aria-label="Close zoom"
            >
              ✕
            </button>
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            {caption && <p className="text-white text-xs mt-3 text-center">{caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default LightboxImage;

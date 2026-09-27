import React from "react";
import Image from "next/image";
import { EditableComponent } from "../EditableComponent";

export interface GalleryGridProps {
  id?: string;
  sectionId?: string;
  settings?: {
    images?: Array<{ url: string; caption?: string }>;
    columns?: number;
  };
}

export function GalleryGrid({
  id = "gallery_grid",
  sectionId,
  settings = {},
}: GalleryGridProps) {
  const images = settings.images?.length
    ? settings.images
    : [
        {
          url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
          caption: "Athletic Collection",
        },
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
          caption: "Footwear Series",
        },
        {
          url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
          caption: "Accessories",
        },
      ];

  const columns = settings.columns ?? 3;
  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-3";

  return (
    <EditableComponent
      id={id}
      type="gallery_grid"
      sectionId={sectionId}
      className={`grid ${colClass} gap-4 my-4`}
    >
      {images.map((img, idx) => (
        <div
          key={idx}
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-xs group"
        >
          <Image
            src={img.url}
            alt={img.caption || `Gallery ${idx + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          {img.caption && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {img.caption}
            </div>
          )}
        </div>
      ))}
    </EditableComponent>
  );
}

export default GalleryGrid;

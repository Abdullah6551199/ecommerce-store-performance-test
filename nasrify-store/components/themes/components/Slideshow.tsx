"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { EditableComponent } from "../EditableComponent";

export interface SlideshowProps {
  id?: string;
  sectionId?: string;
  settings?: {
    slides?: Array<{ image_url: string; heading?: string }>;
    autoplay?: boolean;
  };
}

export function Slideshow({
  id = "slideshow",
  sectionId,
  settings = {},
}: SlideshowProps) {
  const slides = settings.slides?.length
    ? settings.slides
    : [
        {
          image_url:
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
          heading: "Modern Streetwear",
        },
        {
          image_url:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
          heading: "Peak Performance",
        },
      ];

  const autoplay = settings.autoplay !== false;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoplay, slides.length]);

  return (
    <EditableComponent
      id={id}
      type="slideshow"
      sectionId={sectionId}
      className="relative aspect-16/9 rounded-3xl overflow-hidden shadow-xl my-4 group"
    >
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${
            current === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={s.image_url}
            alt={s.heading || `Slide ${idx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          {s.heading && (
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white">
              <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">{s.heading}</h3>
            </div>
          )}
        </div>
      ))}

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                current === idx ? "w-6 bg-white shadow-sm" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </EditableComponent>
  );
}

export default Slideshow;

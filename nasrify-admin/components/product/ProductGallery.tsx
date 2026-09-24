"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";
import type { ProductImageRecord } from "@/lib/products";
import type { ProductVariantRecord } from "@/lib/variants";

interface ProductGalleryProps {
  mainImage: string | null;
  images?: ProductImageRecord[];
  variants?: ProductVariantRecord[];
  productName: string;
  discountPercent?: number;
  videoUrl?: string | null;
  activeVariantImage?: string | null;
}

/**
 * Stage 18.3 Product Gallery
 * Features:
 * - Vertical desktop thumbnails (left), horizontal mobile strip (below)
 * - Walmart-style 2.5x cursor-following hover zoom on desktop
 * - Fullscreen interactive Lightbox with pan, zoom controls, next/prev, and keyboard nav
 * - LCP prioritized image rendering with high fetch priority
 */
export default function ProductGallery({
  mainImage,
  images = [],
  variants = [],
  productName,
  discountPercent = 0,
  videoUrl,
  activeVariantImage,
}: ProductGalleryProps): React.JSX.Element {
  // Consolidate unique images in ordered sequence
  const allImages = useMemo(() => {
    const urls: string[] = [];
    if (mainImage) {
      const norm = normalizeImageUrl(mainImage, { width: 900, quality: 80 });
      if (norm) urls.push(norm);
    }
    images.forEach((img) => {
      const norm = normalizeImageUrl(img.imageUrl, { width: 900, quality: 80 });
      if (norm && !urls.includes(norm)) {
        urls.push(norm);
      }
    });
    variants.forEach((v) => {
      if (v.imageUrl) {
        const norm = normalizeImageUrl(v.imageUrl, { width: 900, quality: 80 });
        if (norm && !urls.includes(norm)) {
          urls.push(norm);
        }
      }
    });
    return urls;
  }, [mainImage, images, variants]);

  const [activeImage, setActiveImage] = useState<string>(() => allImages[0] || "");
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Update active image if variant image changes
  useEffect(() => {
    if (activeVariantImage) {
      const norm = normalizeImageUrl(activeVariantImage, { width: 900, quality: 80 });
      if (norm) {
        setActiveImage(norm);
      }
    }
  }, [activeVariantImage]);

  // Sync if allImages changes and activeImage isn't in it
  useEffect(() => {
    if (!activeImage && allImages.length > 0) {
      setActiveImage(allImages[0]);
    }
  }, [allImages, activeImage]);

  // Walmart-style hover zoom coordinate tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.5)",
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
    });
  };

  // Lightbox navigation
  const currentIndex = useMemo(() => {
    const idx = allImages.indexOf(activeImage);
    return idx >= 0 ? idx : 0;
  }, [allImages, activeImage]);

  const goToNextImage = useCallback(() => {
    if (allImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIdx]);
    setLightboxZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [currentIndex, allImages]);

  const goToPrevImage = useCallback(() => {
    if (allImages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIdx]);
    setLightboxZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [currentIndex, allImages]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setLightboxZoom(1);
        setPanOffset({ x: 0, y: 0 });
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "ArrowLeft") {
        goToPrevImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToNextImage, goToPrevImage]);

  // Lightbox pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (lightboxZoom > 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (isPanning && lightboxZoom > 1) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 sm:gap-6 items-start">
      {/* 1. Thumbnails Column (Vertical on Desktop, Horizontal Strip on Mobile) */}
      {allImages.length > 1 && (
        <div className="flex lg:flex-col flex-row gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[580px] w-full lg:w-20 shrink-0 pb-2 lg:pb-0 scrollbar-thin">
          {allImages.slice(0, 8).map((url, idx) => {
            const isCurrent = url === activeImage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveImage(url);
                  setZoomStyle({});
                }}
                className={`relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer bg-[#F4F4F5]/40 dark:bg-[#18181B]/30 ${
                  isCurrent
                    ? "border-[#25D366] ring-2 ring-[#25D366]/20 scale-105 shadow-md shadow-[#25D366]/20"
                    : "border-[#E4E4E7] dark:border-zinc-800/60 opacity-70 hover:opacity-100 hover:border-[#E4E4E7] dark:hover:border-[#1EA855]"
                }`}
                aria-label={`Select product image ${idx + 1}`}
              >
                <Image
                  src={url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Image Viewer with Walmart-Style Hover Zoom */}
      <div className="relative flex-1 w-full">
        <div
          id="product-main-image-card"
          className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E4E4E7] dark:border-zinc-700/60 bg-[#F4F4F5]/30 dark:bg-[#2b0346]/40 cursor-crosshair group shadow-inner"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setLightboxOpen(true)}
          title="Click to view full screen or hover to zoom"
        >
          {activeImage ? (
            <div
              className="relative h-full w-full transition-transform duration-150 ease-out will-change-transform"
              style={isHovered ? zoomStyle : undefined}
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                priority={true}
                fetchPriority="high"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 45vw"
                className="h-full w-full object-cover select-none"
              />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-zinc-400 dark:text-[#25D366]">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="mt-3 text-xs font-mono text-zinc-400">No Product Image</span>
            </div>
          )}

          {/* Discount Badge (Top-Left) */}
          {discountPercent > 0 && (
            <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
              <span className="inline-flex items-center rounded-full bg-[#25D366] text-white px-3 py-1 text-xs font-extrabold shadow-lg shadow-[#25D366]/20 tracking-wider">
                -{discountPercent}% OFF
              </span>
            </div>
          )}

          {/* Zoom Indicator Icon (Top-Right) */}
          <div className="absolute top-3.5 right-3.5 z-10 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-[#18181B] dark:text-[#DCFCE7] shadow-md border border-[#E4E4E7]/50 dark:border-zinc-700/50">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              <span className="hidden sm:inline">Zoom</span>
            </span>
          </div>

          {/* Video Play Button (Bottom-Left, if video exists) */}
          {videoUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(videoUrl, "_blank");
              }}
              className="absolute bottom-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-[#18181B]/95 px-3 py-1.5 text-xs font-bold text-[#18181B] dark:text-[#DCFCE7] shadow-lg border border-[#E4E4E7] dark:border-zinc-700 hover:scale-105 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4 text-[#25D366] fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Watch Video</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image viewer"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={() => {
            setLightboxOpen(false);
            setLightboxZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
        >
          {/* Top Control Bar */}
          <div
            className="absolute top-4 inset-x-4 z-20 flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/10">
              <span>
                {currentIndex + 1} / {allImages.length}
              </span>
              <span className="text-white/40">•</span>
              <span className="truncate max-w-xs text-white/80">{productName}</span>
            </div>

            {/* Zoom controls & Close button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.max(1, z - 0.5))}
                disabled={lightboxZoom <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white disabled:opacity-30 border border-white/10 transition cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-xs font-mono px-1">{Math.round(lightboxZoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => Math.min(3.5, z + 0.5))}
                disabled={lightboxZoom >= 3.5}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white disabled:opacity-30 border border-white/10 transition cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setLightboxZoom(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white border border-white/10 transition cursor-pointer ml-2"
                title="Close (ESC)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Left / Right Nav Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-[#25D366]/80 text-white shadow-xl border border-white/15 transition-all cursor-pointer"
                title="Previous Image (Left Arrow)"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-[#25D366]/80 text-white shadow-xl border border-white/15 transition-all cursor-pointer"
                title="Next Image (Right Arrow)"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Lightbox Center Image with Pan & Zoom */}
          <div
            className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleLightboxMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: lightboxZoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
          >
            <div
              className="relative max-w-full max-h-full aspect-square w-full transition-transform duration-75"
              style={{
                transform: `scale(${lightboxZoom}) translate(${panOffset.x / lightboxZoom}px, ${panOffset.y / lightboxZoom}px)`,
              }}
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                sizes="(max-width: 1200px) 90vw, 1200px"
                className="object-contain pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

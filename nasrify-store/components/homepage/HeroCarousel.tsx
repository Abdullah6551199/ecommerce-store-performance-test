"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/utils";

export interface HeroSlide {
  badge?: string;
  heading: string;
  subheading?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    badge: "Special Offer • New Season",
    heading: "Elevate Your Motion with Pure Precision",
    subheading: "Explore the new Spring Purple Collection. Engineered with micro-knit breathable fabrics and ultra-responsive lightweight foam soles.",
    primaryButtonText: "Shop Collection",
    primaryButtonUrl: "/shop",
    secondaryButtonText: "Explore Categories",
    secondaryButtonUrl: "#category-cards",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Spring Purple Collection Showcase",
  },
  {
    badge: "Limited Edition Drop",
    heading: "Carbon Velocity Racing Series",
    subheading: "Tested by world-class marathoners. Feel 32% enhanced energy return on every stride with carbon-infused composite plates.",
    primaryButtonText: "Discover Velocity",
    primaryButtonUrl: "/shop",
    secondaryButtonText: "View Top Rated",
    secondaryButtonUrl: "#trending-products",
    imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Carbon Velocity Footwear",
  },
  {
    badge: "Trending Worldwide",
    heading: "Uncompromising Everyday Elegance",
    subheading: "Minimalist luxury athletic wear designed for seamless transition from high-intensity training to urban streetwear.",
    primaryButtonText: "Explore Now",
    primaryButtonUrl: "/shop",
    secondaryButtonText: "About Our Story",
    secondaryButtonUrl: "/about",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Everyday Luxury Athletics",
  },
];

export default function HeroCarousel({ slides = DEFAULT_SLIDES }: HeroCarouselProps): React.JSX.Element {
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate every 5 seconds unless hovered
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, activeSlides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex];

  return (
    <section
      id="hero-carousel"
      className="group relative overflow-hidden rounded-3xl border border-purple-200/80 dark:border-purple-800/60 bg-gradient-to-br from-[#D59EFA]/35 via-[#EACFFC]/40 to-white dark:from-[#3C0561] dark:via-[#5A0891] dark:to-[#3C0561] shadow-xl shadow-purple-500/10 transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero Highlights"
    >
      {/* Decorative subtle ambient lights */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#C06EF7]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#960DF2]/20 blur-3xl" />

      {/* Main Slide Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 p-6 sm:p-10 lg:p-16 min-h-[460px] lg:min-h-[520px]">
        {/* Left Side: Copy and CTAs */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
          {currentSlide.badge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/80 dark:border-purple-500/50 bg-[#EACFFC] dark:bg-[#780AC2]/50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#5A0891] dark:text-[#EACFFC] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#960DF2] animate-pulse" />
              <span>{currentSlide.badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#3C0561] dark:text-white leading-[1.15]">
            {currentSlide.heading}
          </h1>

          {currentSlide.subheading && (
            <p className="text-sm sm:text-base text-[#5A0891]/90 dark:text-purple-100/80 max-w-xl leading-relaxed font-normal">
              {currentSlide.subheading}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {currentSlide.primaryButtonText && currentSlide.primaryButtonUrl && (
              <Link
                href={currentSlide.primaryButtonUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-[#960DF2] hover:bg-[#780AC2] text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-95 transition-all"
              >
                <span>{currentSlide.primaryButtonText}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            )}

            {currentSlide.secondaryButtonText && currentSlide.secondaryButtonUrl && (
              <Link
                href={currentSlide.secondaryButtonUrl}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-[#960DF2] dark:border-purple-400 bg-transparent text-[#5A0891] dark:text-purple-200 hover:bg-purple-100/50 dark:hover:bg-purple-900/40 px-5 py-3 text-xs sm:text-sm font-bold transition-all"
              >
                <span>{currentSlide.secondaryButtonText}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Right Side: Showcase Image */}
        <div className="lg:col-span-5 relative w-full aspect-[4/3] lg:aspect-square overflow-hidden rounded-2xl border border-purple-200/80 dark:border-purple-700/50 shadow-2xl bg-purple-100/50 dark:bg-purple-950/50">
          {currentSlide.imageUrl && (
            <Image
              src={normalizeImageUrl(currentSlide.imageUrl, { hero: true, width: 900, quality: 80 })}
              alt={currentSlide.imageAlt || currentSlide.heading}
              fill
              priority={currentIndex === 0}
              {...(currentIndex === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Prev / Next Arrows (Visible on Hover) */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-[#3C0561]/90 border border-purple-200 dark:border-purple-700 text-[#3C0561] dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 cursor-pointer z-20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-[#3C0561]/90 border border-purple-200 dark:border-purple-700 text-[#3C0561] dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 cursor-pointer z-20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={currentIndex === idx}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? "w-8 bg-[#960DF2] dark:bg-[#C06EF7]"
                  : "w-2.5 bg-purple-300/80 dark:bg-purple-700 hover:bg-purple-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

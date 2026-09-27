import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import {
  getHeadingSizeClass,
  getSubheadingSizeClass,
  getButtonSizeClass,
  renderRich,
  getImageCropStyle,
  CropData,
} from "@/lib/themes/utils";

export interface HeroSettings {
  heading?: string;
  subheading?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  height?: string;
  overlay_opacity?: number;
  alignment?: "left" | "center" | "right";
  heading_size?: string;
  subheading_size?: string;
  button_size?: string;
  crop_data?: CropData;
}

export default function Hero({
  variant = "full_image",
  settings = {},
  themeSettings,
}: SectionProps<HeroSettings>) {
  const compSettings = (settings as any)?._components;
  const heading =
    compSettings?.heading?.settings?.text ||
    settings.heading ||
    "Elevate Your Lifestyle with Modern Essentials";
  const subheading =
    compSettings?.subheading?.settings?.text ||
    settings.subheading ||
    "Premium craftsmanship, minimalist design, and uncompromised quality engineered for everyday elegance.";
  const ctaText =
    compSettings?.button?.settings?.label ||
    compSettings?.button?.settings?.text ||
    compSettings?.cta?.settings?.text ||
    settings.cta_text ||
    "Explore Collection";
  const ctaLink =
    compSettings?.button?.settings?.link ||
    compSettings?.cta?.settings?.link ||
    settings.cta_link ||
    "/shop";
  const explicitImage =
    compSettings?.image?.settings?.url ||
    compSettings?.image?.settings?.image_url ||
    settings.image_url;
  const hasCustomBg = Boolean((settings as any)?._advanced?.style?.background);
  const hasExplicitImage = Boolean(explicitImage && explicitImage.trim() !== "" && explicitImage !== "none");
  const imageUrl =
    explicitImage ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop";
  const height = settings.height || "600px";
  const overlayOpacity = settings.overlay_opacity !== undefined ? settings.overlay_opacity : 0.45;
  const alignment = settings.alignment || "center";

  const headingSizeClass = getHeadingSizeClass(settings.heading_size);
  const subheadingSizeClass = getSubheadingSizeClass(settings.subheading_size);
  const buttonSizeClass = getButtonSizeClass(settings.button_size);
  const cropStyle = getImageCropStyle(settings.crop_data);

  const alignClass =
    alignment === "left"
      ? "text-left items-start"
      : alignment === "right"
      ? "text-right items-end ml-auto"
      : "text-center items-center mx-auto";

  if (variant === "split") {
    return (
      <section className="relative overflow-hidden bg-[var(--theme-surface,#F4F4F5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start space-y-6">
            <h1
              data-editable="heading"
              className={`${headingSizeClass} font-black tracking-tight text-[var(--theme-text,#18181B)] leading-tight font-[family-name:var(--theme-font-heading)]`}
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <div
              data-editable="subheading"
              className={`${subheadingSizeClass} text-[var(--theme-text-muted,#71717A)] max-w-xl font-[family-name:var(--theme-font-body)]`}
              dangerouslySetInnerHTML={renderRich(subheading)}
            />
            {ctaText && (
              <Link
                href={ctaLink}
                data-editable="cta_text"
                className={`inline-flex items-center justify-center ${buttonSizeClass} rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white font-semibold hover:bg-[var(--theme-accent,#2563EB)] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5`}
              >
                {ctaText}
              </Link>
            )}
          </div>
          <div className="relative h-[400px] sm:h-[500px] rounded-[var(--theme-radius,8px)] overflow-hidden shadow-xl">
            <Image
              src={imageUrl}
              alt={heading}
              fill
              priority
              style={cropStyle}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "text_only") {
    return (
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[var(--theme-surface,#F4F4F5)] text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1
            data-editable="heading"
            className={`${headingSizeClass} font-black tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]`}
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <div
            data-editable="subheading"
            className={`${subheadingSizeClass} text-[var(--theme-text-muted,#71717A)] max-w-2xl mx-auto font-[family-name:var(--theme-font-body)]`}
            dangerouslySetInnerHTML={renderRich(subheading)}
          />
          {ctaText && (
            <div className="pt-4">
              <Link
                href={ctaLink}
                data-editable="cta_text"
                className={`inline-flex items-center justify-center ${buttonSizeClass} rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white font-semibold hover:bg-[var(--theme-accent,#2563EB)] transition-all shadow-md hover:-translate-y-0.5`}
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Variant: split_minimal (50/50 clean minimalist, no overlay)
  if (variant === "split_minimal") {
    return (
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1
              data-editable="heading"
              className={`${headingSizeClass} font-black tracking-tight text-white leading-tight font-[family-name:var(--theme-font-heading)]`}
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <div
              data-editable="subheading"
              className={`${subheadingSizeClass} text-gray-300 font-[family-name:var(--theme-font-body)] leading-relaxed`}
              dangerouslySetInnerHTML={renderRich(subheading)}
            />
            {ctaText && (
              <div className="pt-2">
                <Link
                  href={ctaLink}
                  data-editable="cta_text"
                  className={`inline-flex items-center justify-center ${buttonSizeClass} rounded-[var(--theme-radius,8px)] bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all`}
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            <Image
              src={imageUrl}
              alt={heading}
              fill
              priority
              style={cropStyle}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    );
  }

  // Variant: product_focus (Prominent product focus hero with buy CTA)
  if (variant === "product_focus") {
    return (
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Featured Flagship
            </span>
            <h1
              data-editable="heading"
              className={`${headingSizeClass} font-black tracking-tight text-white leading-tight font-[family-name:var(--theme-font-heading)]`}
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <div
              data-editable="subheading"
              className={`${subheadingSizeClass} text-gray-300 font-[family-name:var(--theme-font-body)] leading-relaxed max-w-xl`}
              dangerouslySetInnerHTML={renderRich(subheading)}
            />
            {ctaText && (
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={ctaLink}
                  data-editable="cta_text"
                  className={`inline-flex items-center justify-center ${buttonSizeClass} rounded-full bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/20`}
                >
                  {ctaText} — Instant Order
                </Link>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 relative aspect-square rounded-3xl overflow-hidden p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={heading}
              fill
              priority
              style={cropStyle}
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>
    );
  }

  // Variant: video (video background hero)
  if (variant === "video") {
    const heroVideoUrl = (settings as any).video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    return (
      <section className="relative w-full overflow-hidden flex items-center justify-center bg-black" style={{ minHeight: height }}>
        <video
          src={heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className={`relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white space-y-6 ${alignClass}`}>
          <h1
            data-editable="heading"
            className={`${headingSizeClass} font-black tracking-tight leading-tight drop-shadow-md font-[family-name:var(--theme-font-heading)]`}
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <div
            data-editable="subheading"
            className={`${subheadingSizeClass} text-gray-200 drop-shadow max-w-2xl mx-auto font-[family-name:var(--theme-font-body)]`}
            dangerouslySetInnerHTML={renderRich(subheading)}
          />
          {ctaText && (
            <div className="pt-4">
              <Link
                href={ctaLink}
                data-editable="cta_text"
                className={`inline-flex items-center justify-center ${buttonSizeClass} rounded-[var(--theme-radius,8px)] bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all`}
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default: full_image / slider / video fallback
  const renderBackground = hasExplicitImage || !hasCustomBg;

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: height }}
    >
      {renderBackground && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={heading}
            fill
            priority
            style={cropStyle}
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        </div>
      )}

      <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 ${renderBackground ? "text-white" : "text-inherit"}`}>
        <div className={`flex flex-col ${alignClass} space-y-6 max-w-3xl`}>
          <h1
            data-editable="heading"
            className={`${headingSizeClass} font-black tracking-tight leading-tight drop-shadow-sm font-[family-name:var(--theme-font-heading)]`}
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <div
            data-editable="subheading"
            className={`${subheadingSizeClass} drop-shadow-sm font-[family-name:var(--theme-font-body)] ${renderBackground ? "text-gray-200" : "text-inherit opacity-90"}`}
            dangerouslySetInnerHTML={renderRich(subheading)}
          />
          {ctaText && (
            <div className="pt-4">
              <Link
                href={ctaLink}
                data-editable="cta_text"
                className={`inline-flex items-center justify-center ${buttonSizeClass} rounded-[var(--theme-radius,8px)] bg-white text-gray-900 font-bold hover:bg-[var(--theme-accent,#2563EB)] hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

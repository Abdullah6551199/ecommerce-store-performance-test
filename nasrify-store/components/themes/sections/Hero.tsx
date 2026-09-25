import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import {
  getHeadingSizeClass,
  getSubheadingSizeClass,
  getButtonSizeClass,
  sanitizeRichText,
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
  const heading = settings.heading || "Elevate Your Lifestyle with Modern Essentials";
  const subheading =
    settings.subheading ||
    "Premium craftsmanship, minimalist design, and uncompromised quality engineered for everyday elegance.";
  const ctaText = settings.cta_text || "Explore Collection";
  const ctaLink = settings.cta_link || "/shop";
  const imageUrl =
    settings.image_url ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop";
  const height = settings.height || "600px";
  const overlayOpacity = settings.overlay_opacity !== undefined ? settings.overlay_opacity : 0.45;
  const alignment = settings.alignment || "center";

  const headingSizeClass = getHeadingSizeClass(settings.heading_size);
  const subheadingSizeClass = getSubheadingSizeClass(settings.subheading_size);
  const buttonSizeClass = getButtonSizeClass(settings.button_size);
  const cropStyle = getImageCropStyle(settings.crop_data);
  const sanitizedSubheading = sanitizeRichText(subheading);

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
            >
              {heading}
            </h1>
            <div
              data-editable="subheading"
              className={`${subheadingSizeClass} text-[var(--theme-text-muted,#71717A)] max-w-xl font-[family-name:var(--theme-font-body)]`}
              dangerouslySetInnerHTML={{ __html: sanitizedSubheading }}
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
          >
            {heading}
          </h1>
          <div
            data-editable="subheading"
            className={`${subheadingSizeClass} text-[var(--theme-text-muted,#71717A)] max-w-2xl mx-auto font-[family-name:var(--theme-font-body)]`}
            dangerouslySetInnerHTML={{ __html: sanitizedSubheading }}
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

  // Default: full_image / slider / video fallback
  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: height }}
    >
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white">
        <div className={`flex flex-col ${alignClass} space-y-6 max-w-3xl`}>
          <h1
            data-editable="heading"
            className={`${headingSizeClass} font-black tracking-tight leading-tight drop-shadow-sm font-[family-name:var(--theme-font-heading)]`}
          >
            {heading}
          </h1>
          <div
            data-editable="subheading"
            className={`${subheadingSizeClass} text-gray-200 drop-shadow-sm font-[family-name:var(--theme-font-body)]`}
            dangerouslySetInnerHTML={{ __html: sanitizedSubheading }}
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

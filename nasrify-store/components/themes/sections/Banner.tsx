import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";

export interface BannerSettings {
  heading?: string;
  text?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  overlay?: number;
  height?: string;
}

export default function Banner({
  variant = "full_width",
  settings = {},
  themeSettings,
}: SectionProps<BannerSettings>) {
  const heading = settings.heading || "Summer Sale — 30% Off";
  const text =
    settings.text ||
    "Discover selected premium items at limited-time promotional pricing. Use code SUMMER30 at checkout.";
  const ctaText = settings.cta_text || "Claim Discount";
  const ctaLink = settings.cta_link || "/shop";
  const imageUrl =
    settings.image_url ||
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop";
  const overlay = settings.overlay !== undefined ? settings.overlay : 0.5;
  const height = settings.height || "400px";

  const isBoxed = variant === "boxed";

  if (variant === "side_by_side") {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[var(--theme-surface,#F4F4F5)] rounded-[var(--theme-radius,8px)] p-8 sm:p-12 overflow-hidden shadow-sm">
          <div className="space-y-4">
            <h2
              data-editable="heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
            >
              {heading}
            </h2>
            <p
              data-editable="text"
              className="text-base text-[var(--theme-text-muted,#71717A)] max-w-md font-[family-name:var(--theme-font-body)]"
            >
              {text}
            </p>
            {ctaText && (
              <div className="pt-2">
                <Link
                  href={ctaLink}
                  data-editable="cta_text"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white font-bold hover:bg-[var(--theme-accent,#2563EB)] transition-all shadow-md hover:-translate-y-0.5"
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
          <div className="relative h-64 sm:h-80 w-full rounded-[var(--theme-radius,8px)] overflow-hidden shadow-md">
            <Image
              src={imageUrl}
              alt={heading}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={isBoxed ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12" : "w-full my-8"}>
      <div
        className={`relative overflow-hidden flex items-center justify-center ${
          isBoxed ? "rounded-[var(--theme-radius,8px)]" : ""
        }`}
        style={{ minHeight: height }}
      >
        <Image
          src={imageUrl}
          alt={heading}
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-12 text-white space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-[family-name:var(--theme-font-heading)]">
            {heading}
          </h2>
          <p className="text-base sm:text-lg text-gray-200 max-w-xl mx-auto font-[family-name:var(--theme-font-body)]">
            {text}
          </p>
          {ctaText && (
            <div className="pt-2">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--theme-radius,8px)] bg-white text-gray-900 font-bold hover:bg-[var(--theme-accent,#2563EB)] hover:text-white transition-all shadow-md hover:-translate-y-0.5"
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

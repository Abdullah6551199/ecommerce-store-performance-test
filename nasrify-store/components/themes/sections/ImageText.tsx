import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";

export interface ImageTextSettings {
  heading?: string;
  text?: string;
  image_url?: string;
  image_position?: "left" | "right";
  cta_text?: string;
  cta_link?: string;
}

export default function ImageText({
  variant = "left_image",
  settings = {},
  themeSettings,
}: SectionProps<ImageTextSettings>) {
  const heading = settings.heading || "Engineered for Supreme Performance";
  const text =
    settings.text ||
    "Every thread, stitch, and contour is calculated to provide unmatched movement, breathability, and aesthetic impact. Experience the difference of true craftsmanship.";
  const imageUrl =
    settings.image_url ||
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop";
  const imagePosition =
    settings.image_position || (variant === "right_image" ? "right" : "left");
  const ctaText = settings.cta_text || "Learn More";
  const ctaLink = settings.cta_link || "/about";

  const isRight = imagePosition === "right";

  return (
    <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Image */}
        <div
          className={`relative aspect-4/3 sm:aspect-16/10 rounded-[var(--theme-radius,8px)] overflow-hidden shadow-lg ${
            isRight ? "lg:order-2" : "lg:order-1"
          }`}
        >
          <Image
            src={imageUrl}
            alt={heading}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Content */}
        <div className={`space-y-6 ${isRight ? "lg:order-1" : "lg:order-2"}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
            {heading}
          </h2>
          <p className="text-base sm:text-lg text-[var(--theme-text-muted,#71717A)] leading-relaxed font-[family-name:var(--theme-font-body)]">
            {text}
          </p>
          {ctaText && (
            <div className="pt-2">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white font-semibold hover:bg-[var(--theme-accent,#2563EB)] transition-colors shadow-xs"
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

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import { renderRich } from "@/lib/themes/utils";

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

  if (variant === "overlay_card") {
    return (
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[480px] sm:min-h-[560px] rounded-3xl overflow-hidden flex items-center p-6 sm:p-12 lg:p-16 shadow-xl">
          <Image
            src={imageUrl}
            alt={heading}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 max-w-xl bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/50 space-y-4">
            <h2
              data-editable="heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <p
              data-editable="text"
              className="text-sm sm:text-base text-[var(--theme-text-muted,#71717A)] leading-relaxed font-[family-name:var(--theme-font-body)]"
              dangerouslySetInnerHTML={renderRich(text)}
            />
            {ctaText && (
              <div className="pt-2">
                <Link
                  href={ctaLink}
                  data-editable="cta_text"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white font-semibold hover:bg-[var(--theme-accent,#2563EB)] transition-colors shadow-xs text-sm"
                >
                  <span dangerouslySetInnerHTML={renderRich(ctaText)} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "quote_block") {
    return (
      <section className="py-14 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="md:col-span-5 relative aspect-square rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={imageUrl}
              alt={heading}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="md:col-span-7 space-y-6 border-l-4 border-[var(--theme-accent,#2563EB)] pl-6 sm:pl-8">
            <h2
              data-editable="heading"
              className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[var(--theme-accent,#2563EB)]"
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <blockquote
              data-editable="text"
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[var(--theme-text,#18181B)] leading-snug"
              dangerouslySetInnerHTML={renderRich(`“${text}”`)}
            />
            {ctaText && (
              <div className="pt-2">
                <Link
                  href={ctaLink}
                  data-editable="cta_text"
                  className="inline-flex items-center gap-2 font-bold text-sm text-[var(--theme-text,#18181B)] hover:text-[var(--theme-accent,#2563EB)] transition-colors group"
                >
                  <span dangerouslySetInnerHTML={renderRich(ctaText)} />
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

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
          <h2
            data-editable="heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <p
            data-editable="text"
            className="text-base sm:text-lg text-[var(--theme-text-muted,#71717A)] leading-relaxed font-[family-name:var(--theme-font-body)]"
            dangerouslySetInnerHTML={renderRich(text)}
          />
          {ctaText && (
            <div className="pt-2">
              <Link
                href={ctaLink}
                data-editable="cta_text"
                className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white font-semibold hover:bg-[var(--theme-accent,#2563EB)] transition-colors shadow-xs"
              >
                <span dangerouslySetInnerHTML={renderRich(ctaText)} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

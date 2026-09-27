import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";
import { renderRich } from "@/lib/themes/utils";

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
  const hasCustomBg = Boolean((settings as any)?._advanced?.style?.background);
  const hasExplicitImage = Boolean(settings.image_url && settings.image_url.trim() !== "" && settings.image_url !== "none");
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
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <p
              data-editable="text"
              className="text-base text-[var(--theme-text-muted,#71717A)] max-w-md font-[family-name:var(--theme-font-body)]"
              dangerouslySetInnerHTML={renderRich(text)}
            />
            {ctaText && (
              <div className="pt-2">
                <Link
                  href={ctaLink}
                  data-editable="cta_text"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--theme-radius,8px)] bg-[var(--theme-primary,#18181B)] text-white font-bold hover:bg-[var(--theme-accent,#2563EB)] transition-all shadow-md hover:-translate-y-0.5"
                >
                  <span dangerouslySetInnerHTML={renderRich(ctaText)} />
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

  // Variant: stacked (Vertical stack with large image)
  if (variant === "stacked") {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 my-12 text-center space-y-6">
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
          <Image src={imageUrl} alt={heading} fill className="object-cover" />
        </div>
        <div className="space-y-3">
          <h2
            data-editable="heading"
            className="text-3xl sm:text-4xl font-black tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <p
            data-editable="text"
            className="text-base text-gray-300 max-w-xl mx-auto font-[family-name:var(--theme-font-body)]"
            dangerouslySetInnerHTML={renderRich(text)}
          />
          {ctaText && (
            <div className="pt-2">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-lg"
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Variant: diagonal (Angled diagonal split)
  if (variant === "diagonal") {
    return (
      <section className="relative overflow-hidden bg-slate-950 border-y border-slate-800 my-8 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
              Seasonal Exclusive
            </span>
            <h2
              data-editable="heading"
              className="text-3xl sm:text-5xl font-black text-white leading-tight font-[family-name:var(--theme-font-heading)]"
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <p
              data-editable="text"
              className="text-base text-gray-300 max-w-md font-[family-name:var(--theme-font-body)]"
              dangerouslySetInnerHTML={renderRich(text)}
            />
            {ctaText && (
              <div className="pt-2">
                <Link
                  href={ctaLink}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-md"
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
          <div className="lg:col-span-6 relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <Image src={imageUrl} alt={heading} fill className="object-cover" />
          </div>
        </div>
      </section>
    );
  }

  const renderBackground = hasExplicitImage || !hasCustomBg;

  return (
    <section className={isBoxed ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12" : "w-full my-8"}>
      <div
        className={`relative overflow-hidden flex items-center justify-center ${
          isBoxed ? "rounded-[var(--theme-radius,8px)]" : ""
        }`}
        style={{ minHeight: height }}
      >
        {renderBackground && (
          <>
            <Image
              src={imageUrl}
              alt={heading}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
          </>
        )}

        <div className={`relative z-10 max-w-3xl mx-auto text-center px-6 py-12 space-y-4 ${renderBackground ? "text-white" : "text-inherit"}`}>
          <h2
            data-editable="heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <p
            data-editable="text"
            className={`text-base sm:text-lg max-w-xl mx-auto font-[family-name:var(--theme-font-body)] ${renderBackground ? "text-gray-200" : "text-inherit opacity-90"}`}
            dangerouslySetInnerHTML={renderRich(text)}
          />
          {ctaText && (
            <div className="pt-2">
              <Link
                href={ctaLink}
                data-editable="cta_text"
                className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--theme-radius,8px)] bg-white text-gray-900 font-bold hover:bg-[var(--theme-accent,#2563EB)] hover:text-white transition-all shadow-md hover:-translate-y-0.5"
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

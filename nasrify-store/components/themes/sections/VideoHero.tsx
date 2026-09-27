import React from "react";
import Link from "next/link";
import { renderRich } from "@/lib/themes/render-rich";

interface VideoHeroProps {
  settings?: Record<string, any>;
  variant?: string;
}

export default function VideoHero({
  settings = {},
  variant = "fullscreen",
}: VideoHeroProps) {
  const currentVariant = variant || settings.variant || "fullscreen";

  const videoUrl =
    settings.video_url ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const heading = settings.heading || "Experience the Next Generation of Commerce";
  const subheading =
    settings.subheading ||
    "Engineered for breathtaking speed, modern aesthetics, and fluid elegance.";
  const ctaText = settings.cta_text || "Explore Catalog";
  const ctaLink = settings.cta_link || "/shop";
  const overlayOpacity = settings.overlay_opacity ?? 0.45;
  const autoplay = settings.autoplay !== false;
  const muted = settings.muted !== false;
  const loop = settings.loop !== false;

  // Variant 2: Split 50/50 Video & Text
  if (currentVariant === "split_with_text") {
    return (
      <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1
              data-editable="heading"
              className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white font-[family-name:var(--theme-font-heading)]"
              dangerouslySetInnerHTML={renderRich(heading)}
            />
            <div
              data-editable="subheading"
              className="text-lg text-gray-300 font-[family-name:var(--theme-font-body)] leading-relaxed"
              dangerouslySetInnerHTML={renderRich(subheading)}
            />
            {ctaText && (
              <div className="pt-2">
                <Link
                  href={ctaLink}
                  data-editable="cta_text"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-[var(--theme-radius,8px)] bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video bg-black">
            <video
              src={videoUrl}
              autoPlay={autoplay}
              muted={muted}
              loop={loop}
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    );
  }

  // Variant 3: Centered Minimalist
  if (currentVariant === "centered_minimal") {
    return (
      <section className="relative w-full py-20 px-4 text-center max-w-4xl mx-auto">
        <div className="space-y-6">
          <h1
            data-editable="heading"
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <div
            data-editable="subheading"
            className="text-lg sm:text-xl text-gray-300 font-[family-name:var(--theme-font-body)] max-w-2xl mx-auto"
            dangerouslySetInnerHTML={renderRich(subheading)}
          />
          {ctaText && (
            <div className="pt-4">
              <Link
                href={ctaLink}
                data-editable="cta_text"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-slate-900 font-bold hover:bg-emerald-400 hover:text-slate-950 transition-all shadow-md"
              >
                {ctaText}
              </Link>
            </div>
          )}
          <div className="mt-8 rounded-xl overflow-hidden aspect-video max-w-3xl mx-auto shadow-2xl border border-slate-800">
            <video
              src={videoUrl}
              autoPlay={autoplay}
              muted={muted}
              loop={loop}
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    );
  }

  // Variant 1: Fullscreen Hero Background
  return (
    <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden bg-black">
      <video
        src={videoUrl}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div
        className="absolute inset-0 bg-black z-10 pointer-events-none"
        style={{ opacity: overlayOpacity }}
      />
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white space-y-6">
        <h1
          data-editable="heading"
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight drop-shadow-md font-[family-name:var(--theme-font-heading)]"
          dangerouslySetInnerHTML={renderRich(heading)}
        />
        <div
          data-editable="subheading"
          className="text-lg sm:text-xl text-gray-200 drop-shadow max-w-2xl mx-auto font-[family-name:var(--theme-font-body)]"
          dangerouslySetInnerHTML={renderRich(subheading)}
        />
        {ctaText && (
          <div className="pt-6">
            <Link
              href={ctaLink}
              data-editable="cta_text"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[var(--theme-radius,8px)] bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-xl hover:-translate-y-0.5"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

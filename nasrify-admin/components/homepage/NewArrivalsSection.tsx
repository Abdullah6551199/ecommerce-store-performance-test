import React from "react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";

interface NewArrivalsSectionProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  discountText?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
}

export default function NewArrivalsSection({
  badge = "New Collection",
  heading = "New Arrivals Just For You",
  subheading = "Experience cutting-edge athletic engineering designed for fluid movement and modern luxury.",
  discountText = "Save up to 40% OFF on first order",
  buttonText = "Shop Now",
  buttonUrl = "/shop",
  imageUrl = "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
}: NewArrivalsSectionProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-gradient-to-r from-[#F4F4F5] via-[#1EA855] to-[#F4F4F5] dark:from-[#18181B] dark:via-[#18181B] dark:to-[#18181B] p-6 sm:p-10 lg:p-14 shadow-xl shadow-[#25D366]/20 transition-colors">
      {/* Decorative ambient spots */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#1EA855]/20 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
        {/* Left Copy */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
          {badge && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
              <span>{badge}</span>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#18181B] dark:text-white leading-[1.15]">
            {heading}
          </h2>

          <p className="text-base sm:text-lg font-bold text-[#1EA855] dark:text-[#DCFCE7]">
            {discountText}
          </p>

          <p className="text-sm text-[#15803D]/90 dark:text-zinc-200/80 max-w-xl leading-relaxed">
            {subheading}
          </p>

          <div className="pt-2">
            <Link
              href={buttonUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/20 active:scale-95 transition-all"
            >
              <span>{buttonText}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="lg:col-span-5 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-square w-full overflow-hidden rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-700/60 shadow-xl bg-[#DCFCE7]/40 dark:bg-[#18181B]/40">
          <Image
            src={normalizeImageUrl(imageUrl, { width: 900, quality: 80 })}
            alt={heading}
            fill
            sizes="(max-width: 1024px) 100vw, 42vw"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";
import type { BundleWithItems } from "../shared/types";

interface BundleCardProps {
  bundle: BundleWithItems;
  badgeText?: string;
}

export default function BundleCard({ bundle, badgeText }: BundleCardProps): React.JSX.Element {
  const resolvedImage = bundle.imageUrl
    ? normalizeImageUrl(bundle.imageUrl, { width: 640, quality: 80 })
    : bundle.items[0]?.product?.mainImage
    ? normalizeImageUrl(bundle.items[0].product.mainImage, { width: 640, quality: 80 })
    : null;

  const savings = Math.max(0, bundle.originalPrice - bundle.bundlePrice);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-200/80 dark:border-purple-800/50 bg-white dark:bg-[#3C0561]/85 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-500/15">
      {/* 1. Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-purple-50/50 dark:bg-purple-950/40">
        <Link href={`/bundles/${bundle.slug}`} className="relative block h-full w-full">
          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={bundle.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-purple-400 text-xs font-bold">
              Product Bundle
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
          {bundle.discountPercentage && bundle.discountPercentage > 0 ? (
            <span className="rounded-full bg-[#960DF2] text-white px-2.5 py-0.5 text-[10px] font-bold shadow-md tracking-wider">
              {badgeText ? `${badgeText} (${Math.round(bundle.discountPercentage)}%)` : `Save ${Math.round(bundle.discountPercentage)}%`}
            </span>
          ) : badgeText ? (
            <span className="rounded-full bg-[#960DF2] text-white px-2.5 py-0.5 text-[10px] font-bold shadow-md tracking-wider">
              {badgeText}
            </span>
          ) : null}
          <span className="rounded-full bg-[#3C0561]/90 dark:bg-purple-950/90 text-purple-200 px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
            {bundle.items.length} Products Included
          </span>
        </div>
      </div>

      {/* 2. Bundle Content */}
      <div className="pt-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/bundles/${bundle.slug}`} className="block">
            <h3 className="font-bold text-sm text-[#3C0561] dark:text-white group-hover:text-[#960DF2] transition-colors line-clamp-1">
              {bundle.name}
            </h3>
          </Link>
          {bundle.description && (
            <p className="text-xs text-zinc-500 dark:text-purple-200/70 line-clamp-2 mt-1 leading-relaxed">
              {bundle.description}
            </p>
          )}

          {/* Included Mini Product Badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {bundle.items.slice(0, 3).map((it) => (
              <span
                key={it.id}
                className="rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-800/40 px-1.5 py-0.5 text-[9px] font-medium text-purple-700 dark:text-purple-300 truncate max-w-[120px]"
              >
                {it.product?.name || "Item"}
              </span>
            ))}
            {bundle.items.length > 3 && (
              <span className="text-[9px] text-purple-400 font-bold self-center">
                +{bundle.items.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-purple-100 dark:border-purple-800/40 flex items-center justify-between gap-2 mt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-[#960DF2] dark:text-[#C06EF7]">
                ${bundle.bundlePrice.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400 line-through">
                ${bundle.originalPrice.toFixed(2)}
              </span>
            </div>
            {savings > 0 && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Save ${savings.toFixed(2)}
              </p>
            )}
          </div>

          <Link
            href={`/bundles/${bundle.slug}`}
            className="inline-flex items-center gap-1 rounded-xl bg-purple-100 dark:bg-purple-900/50 hover:bg-[#960DF2] hover:text-white text-[#960DF2] dark:text-[#EACFFC] px-3 py-1.5 text-xs font-bold transition-colors"
          >
            <span>View Bundle</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";
import type { BundleWithItems } from "@/lib/bundles";

interface ProductBundleCrossSellProps {
  bundles: BundleWithItems[];
}

export default function ProductBundleCrossSell({
  bundles,
}: ProductBundleCrossSellProps): React.JSX.Element | null {
  if (!bundles || bundles.length === 0) return null;

  return (
    <div
      aria-label="Also available in bundle"
      className="rounded-2xl border border-[#E4E4E7]/90 dark:border-zinc-800/60 bg-gradient-to-br from-[#F4F4F5]/70 to-white dark:from-[#18181B]/90 dark:to-[#18181B]/90 p-5 shadow-md space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#25D366] text-white text-xs">
            🎁
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-zinc-300">
            Also Available in Bundle
          </h3>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
          Save up to {Math.round(Math.max(...bundles.map((b) => b.discountPercentage || 0)))}%
        </span>
      </div>

      <div className="space-y-2.5">
        {bundles.map((b) => {
          const img = b.imageUrl
            ? normalizeImageUrl(b.imageUrl, { width: 120, quality: 75 })
            : b.items[0]?.product?.mainImage
            ? normalizeImageUrl(b.items[0].product.mainImage, { width: 120, quality: 75 })
            : null;

          return (
            <div
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#E4E4E7]/60 dark:border-zinc-800/40 bg-white/90 dark:bg-[#18181B]/90 p-3 hover:border-[#25D366] transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-[#F4F4F5] border border-[#E4E4E7]/50">
                  {img && (
                    <Image src={img} alt={b.name} fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[#18181B] dark:text-white truncate">
                    {b.name}
                  </p>
                  <p className="text-[11px] text-[#25D366] dark:text-zinc-400 font-semibold">
                    {b.items.length} items for{" "}
                    <strong className="text-[#25D366] dark:text-[#1EA855]">
                      ${b.bundlePrice.toFixed(2)}
                    </strong>{" "}
                    <span className="text-zinc-400 line-through text-[10px]">
                      ${b.originalPrice.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <Link
                href={`/bundles/${b.slug}`}
                className="shrink-0 rounded-lg bg-[#25D366] hover:bg-[#1EA855] text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
              >
                View Bundle
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

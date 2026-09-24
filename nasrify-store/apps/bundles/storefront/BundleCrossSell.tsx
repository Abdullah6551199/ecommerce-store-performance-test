import React from "react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";
import { getProductBundles, getBundlesSettings } from "../lib/bundles";
import type { BundleWithItems } from "../shared/types";

interface Props {
  productId?: string;
  bundles?: BundleWithItems[];
}

export default async function BundleCrossSell({
  productId,
  bundles: propBundles,
}: Props): Promise<React.JSX.Element | null> {
  const settings = await getBundlesSettings();
  if (!settings.enableProductCrossSell) {
    return null;
  }

  let bundles = propBundles;
  if (!bundles && productId) {
    bundles = await getProductBundles(productId);
  }

  if (!bundles || bundles.length === 0) return null;

  return (
    <div
      aria-label="Also available in bundle"
      className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#FFFFFF)] p-5 shadow-sm space-y-3 w-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--theme-primary,#25D366)] text-white text-xs">
            🎁
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)]">
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
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-3 hover:border-[var(--theme-primary,#25D366)] transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-[var(--theme-surface,#FFFFFF)] border border-[var(--theme-border,#E4E4E7)]">
                  {img && (
                    <Image src={img} alt={b.name} fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[var(--theme-text,#18181B)] truncate">
                    {b.name}
                  </p>
                  <p className="text-[11px] text-[var(--theme-text-muted,#71717A)] font-semibold">
                    {b.items.length} items for{" "}
                    <strong className="text-[var(--theme-text,#18181B)]">
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
                className="shrink-0 rounded-lg bg-[var(--theme-primary,#25D366)] hover:bg-[var(--theme-primary-hover,#1eb956)] text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
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

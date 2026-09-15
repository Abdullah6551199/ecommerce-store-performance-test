"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCompare, MAX_COMPARE_LIMIT } from "@/components/CompareContext";
import { normalizeImageUrl } from "@/lib/utils";

interface MiniCompareProduct {
  id: string;
  name: string;
  image: string | null;
}

export default function CompareBar(): React.JSX.Element | null {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState<MiniCompareProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (compareList.length === 0) {
      setProducts([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/products/compare?ids=${compareList.join(",")}`)
      .then((res) => res.json() as Promise<any>)
      .then((data: any) => {
        if (isMounted && data?.success && Array.isArray(data?.products)) {
          setProducts(
            data.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              image: p.image,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Error fetching compare bar thumbnails:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [compareList]);

  if (compareList.length === 0) {
    return null;
  }

  const compareUrl = `/compare?ids=${compareList.join(",")}`;

  return (
    <div
      role="region"
      aria-label="Product comparison bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#3C0561]/95 dark:bg-[#200236]/95 border-t border-purple-500/40 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Info & Thumbnails */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#960DF2] shadow-md shadow-purple-900/50">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                Compare Products
              </p>
              <p className="text-[11px] text-purple-200">
                {compareList.length} of {MAX_COMPARE_LIMIT} products selected
              </p>
            </div>
          </div>

          {/* Mini Thumbnails (hidden on very small screens, visible from sm) */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-purple-400/30">
            {products.map((p) => {
              const imgUrl = p.image ? normalizeImageUrl(p.image, { width: 96, quality: 75 }) : null;
              return (
                <div
                  key={p.id}
                  className="group relative h-10 w-10 overflow-hidden rounded-lg border border-purple-400/50 bg-purple-950/60 p-0.5"
                  title={p.name}
                >
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover rounded"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-purple-900/50 text-[9px] text-purple-300">
                      IMG
                    </div>
                  )}
                  {/* Remove pill button on thumbnail */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromCompare(p.id);
                    }}
                    aria-label={`Remove ${p.name} from compare`}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {/* Empty placeholder slots up to 4 */}
            {Array.from({ length: Math.max(0, MAX_COMPARE_LIMIT - products.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-purple-400/30 bg-purple-950/20 text-[10px] text-purple-400/60"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs font-semibold text-purple-300 hover:text-white transition-colors cursor-pointer px-2.5 py-1.5"
          >
            Clear All
          </button>
          <Link
            href={compareUrl}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#960DF2] hover:bg-[#AB3DF5] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-950/50 transition-all hover:scale-105"
          >
            <span>Compare Now</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

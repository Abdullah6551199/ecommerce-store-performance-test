"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCompare } from "@/components/CompareContext";
import { normalizeImageUrl } from "@/lib/utils";

const MAX_COMPARE_LIMIT = 4;

interface CompareProductPreview {
  id: string;
  name: string;
  image?: string | null;
}

export default function CompareBar(): React.JSX.Element | null {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState<CompareProductPreview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareList.length === 0) {
      setProducts([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(`/api/compare/products?ids=${compareList.join(",")}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (!isMounted) return;
        if (data?.success && Array.isArray(data.data)) {
          setProducts(
            data.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              image: p.imageUrl || p.images?.[0]?.url || null,
            }))
          );
        } else {
          setProducts(compareList.map((id) => ({ id, name: "Product" })));
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts(compareList.map((id) => ({ id, name: "Product" })));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--theme-accent,#18181B)] border-t border-[var(--theme-border,#E4E4E7)] shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 text-white font-[family-name:var(--theme-font-body)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Info & Thumbnails */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--theme-primary,#25D366)] text-white shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                Compare Products
              </p>
              <p className="text-[11px] text-zinc-300">
                {compareList.length} of {MAX_COMPARE_LIMIT} products selected
              </p>
            </div>
          </div>

          {/* Mini Thumbnails */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-700">
            {products.map((p) => {
              const imgUrl = p.image ? normalizeImageUrl(p.image, { width: 96, quality: 75 }) : null;
              return (
                <div
                  key={p.id}
                  className="group relative h-10 w-10 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 p-0.5"
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
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-[9px] text-zinc-400">
                      IMG
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromCompare(p.id);
                    }}
                    aria-label={`Remove ${p.name} from compare`}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {/* Placeholder slots */}
            {Array.from({ length: Math.max(0, MAX_COMPARE_LIMIT - products.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/50 text-[10px] text-zinc-500"
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
            className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer px-2.5 py-1.5"
          >
            Clear All
          </button>
          <Link
            href={compareUrl}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--theme-primary,#25D366)] hover:brightness-95 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
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

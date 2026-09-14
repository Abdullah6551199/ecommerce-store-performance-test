import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBundleBySlug, listBundles } from "@/lib/bundles";
import { normalizeImageUrl } from "@/lib/utils";
import BundleAddToCartButton from "@/components/bundles/BundleAddToCartButton";
import BundleCard from "@/components/bundles/BundleCard";

export const revalidate = 300;

interface BundlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);

  if (!bundle) {
    return { title: "Bundle Not Found | Apex Store" };
  }

  return {
    title: `${bundle.name} — Bundle Deal | Apex Store`,
    description:
      bundle.description ||
      `Save ${bundle.discountPercentage}% with the ${bundle.name}. Package price $${bundle.bundlePrice.toFixed(
        2
      )} including free shipping and 30-day returns.`,
  };
}

export default async function BundleDetailPage({ params }: BundlePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);

  if (!bundle || bundle.status !== "active") {
    notFound();
  }

  // Load related bundles
  const allBundles = await listBundles({ status: "active", limit: 6 });
  const relatedBundles = allBundles.filter((b) => b.id !== bundle.id).slice(0, 3);

  const savings = Math.max(0, bundle.originalPrice - bundle.bundlePrice);
  const mainImage = bundle.imageUrl
    ? normalizeImageUrl(bundle.imageUrl, { width: 900, quality: 85 })
    : bundle.items[0]?.product?.mainImage
    ? normalizeImageUrl(bundle.items[0].product.mainImage, { width: 900, quality: 85 })
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-purple-700/80 dark:text-purple-300">
        <Link href="/" className="hover:text-purple-950 dark:hover:text-white transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/bundles" className="hover:text-purple-950 dark:hover:text-white transition">
          Bundles
        </Link>
        <span>/</span>
        <span className="font-bold text-[#960DF2] dark:text-[#EACFFC] truncate max-w-xs">
          {bundle.name}
        </span>
      </nav>

      {/* Main Big White Card Layout (Chronicles Style) */}
      <div className="rounded-3xl border border-purple-200/80 dark:border-purple-800/60 bg-white dark:bg-[#3C0561] p-6 sm:p-10 shadow-xl shadow-purple-500/5 backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (6 cols): Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/40">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={bundle.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-purple-400">
                  Bundle Package
                </div>
              )}

              {bundle.discountPercentage && bundle.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="rounded-full bg-[#960DF2] text-white px-3 py-1 text-xs font-black shadow-lg tracking-wider">
                    SAVE {Math.round(bundle.discountPercentage)}%
                  </span>
                </div>
              )}
            </div>

            {/* Included product mini gallery pills */}
            <div className="grid grid-cols-3 gap-3">
              {bundle.items.map((item) => {
                const itemImg = item.product?.mainImage
                  ? normalizeImageUrl(item.product.mainImage, { width: 160, quality: 75 })
                  : null;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center rounded-xl border border-purple-100 dark:border-purple-800/50 bg-purple-50/30 dark:bg-purple-950/30 p-2 text-center"
                  >
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden mb-1">
                      {itemImg && (
                        <Image src={itemImg} alt={item.product?.name || "Product"} fill className="object-cover" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[#3C0561] dark:text-purple-200 line-clamp-1">
                      {item.product?.name}
                    </span>
                    <span className="text-[9px] text-purple-400 font-mono">
                      Qty: {item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (6 cols): Pricing & Details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/50 px-3 py-1 text-xs font-bold text-[#960DF2] dark:text-[#EACFFC]">
                <span>Bundle Package</span>
                <span>•</span>
                <span>{bundle.items.length} Products Included</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[#3C0561] dark:text-white leading-tight">
                {bundle.name}
              </h1>

              {bundle.description && (
                <p className="text-sm text-zinc-600 dark:text-purple-200/80 leading-relaxed pt-1">
                  {bundle.description}
                </p>
              )}
            </div>

            {/* Products Included List */}
            <div className="space-y-2.5 rounded-2xl border border-purple-100 dark:border-purple-800/50 bg-purple-50/40 dark:bg-purple-950/30 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">
                Products in this Bundle:
              </h3>
              <div className="divide-y divide-purple-100 dark:divide-purple-800/40">
                {bundle.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-purple-50 border border-purple-200/60">
                        {item.product?.mainImage && (
                          <Image
                            src={normalizeImageUrl(item.product.mainImage, { width: 80, quality: 75 })}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.product?.slug || ""}`}
                          className="font-bold text-xs text-[#3C0561] dark:text-white hover:text-[#960DF2] transition truncate block"
                        >
                          {item.product?.name || item.productId}
                        </Link>
                        <p className="text-[10px] text-purple-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-700 dark:text-purple-200 shrink-0">
                      ${Number(item.product?.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Card & Savings Highlight */}
            <div className="space-y-3 rounded-2xl border border-purple-200 dark:border-purple-700/80 bg-purple-50/50 dark:bg-purple-950/40 p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#960DF2] dark:text-[#C06EF7]">
                  ${bundle.bundlePrice.toFixed(2)}
                </span>
                <span className="text-lg text-zinc-400 line-through">
                  ${bundle.originalPrice.toFixed(2)}
                </span>
                {bundle.discountPercentage && (
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-extrabold">
                    {Math.round(bundle.discountPercentage)}% OFF
                  </span>
                )}
              </div>

              {savings > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>You Save ${savings.toFixed(2)} when purchasing as a bundle!</span>
                </div>
              )}

              {/* Add Bundle to Cart Button */}
              <div className="pt-2">
                <BundleAddToCartButton bundle={bundle} />
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] font-semibold text-purple-700 dark:text-purple-300 border-t border-purple-200/50 dark:border-purple-800/40">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[#960DF2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free Standard Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[#960DF2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>30-Day Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Bundles Carousel / Grid */}
      {relatedBundles.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-purple-200/70 dark:border-purple-800/50 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#3C0561] dark:text-white">
              Related Product Bundles
            </h2>
            <Link href="/bundles" className="text-xs font-bold text-[#960DF2] dark:text-[#C06EF7] hover:underline">
              View All Bundles →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBundles.map((rel) => (
              <BundleCard key={rel.id} bundle={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

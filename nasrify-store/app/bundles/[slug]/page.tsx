import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBundleBySlug, listBundles } from "@/lib/bundles";
import { normalizeImageUrl } from "@/lib/utils";
import BundleAddToCartButton from "@/components/bundles/BundleAddToCartButton";
import BundleCard from "@/components/bundles/BundleCard";

interface BundlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);

  if (!bundle) {
    return {
      title: "Bundle Not Found | ApexStore",
    };
  }

  const metaTitle = `${bundle.name} - Bundle Deal | ApexStore`;
  const metaDesc =
    bundle.description ||
    `Save on ${bundle.name}. Get ${bundle.items.length} items bundled together at special pricing.`;

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: bundle.imageUrl ? [{ url: bundle.imageUrl }] : undefined,
    },
  };
}

export default async function BundleDetailPage({ params }: BundlePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const [bundle, allBundlesResult] = await Promise.all([
    getBundleBySlug(slug),
    listBundles({ status: "active", limit: 10 }).catch(() => ({ bundles: [] })),
  ]);
  const allBundles = Array.isArray(allBundlesResult) ? allBundlesResult : (allBundlesResult?.bundles || []);

  if (!bundle) {
    notFound();
  }

  const relatedBundles = allBundles.filter((b) => b.id !== bundle.id).slice(0, 3);
  const savings = bundle.originalPrice - bundle.bundlePrice;
  const mainImage = bundle.imageUrl
    ? normalizeImageUrl(bundle.imageUrl, { width: 800, quality: 85 })
    : bundle.items[0]?.product?.mainImage
    ? normalizeImageUrl(bundle.items[0].product.mainImage, { width: 800, quality: 85 })
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 font-[family-name:var(--theme-font-body)] text-[var(--theme-text,#18181B)]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[var(--theme-text-muted,#71717A)]">
        <Link href="/" className="hover:text-[var(--theme-primary,#25D366)] transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/bundles" className="hover:text-[var(--theme-primary,#25D366)] transition">
          Bundles
        </Link>
        <span>/</span>
        <span className="font-bold text-[var(--theme-text,#18181B)] truncate max-w-xs">
          {bundle.name}
        </span>
      </nav>

      {/* Main Card Layout */}
      <div className="rounded-2xl border border-[var(--theme-border,#E4E4E7)] bg-white p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (6 cols): Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)]">
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
                <div className="flex h-full w-full items-center justify-center text-[var(--theme-text-muted,#71717A)]">
                  Bundle Package
                </div>
              )}

              {bundle.discountPercentage && bundle.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="rounded-full bg-[var(--theme-primary,#25D366)] text-white px-3 py-1 text-xs font-black shadow-sm tracking-wider">
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
                    className="flex flex-col items-center rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-2 text-center"
                  >
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden mb-1">
                      {itemImg && (
                        <Image src={itemImg} alt={item.product?.name || "Product"} fill className="object-cover" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[var(--theme-text,#18181B)] line-clamp-1">
                      {item.product?.name}
                    </span>
                    <span className="text-[9px] text-[var(--theme-text-muted,#71717A)] font-mono">
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
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-primary-light,#DCFCE7)] px-3 py-1 text-xs font-bold text-[var(--theme-accent,#18181B)]">
                <span>Bundle Package</span>
                <span>•</span>
                <span>{bundle.items.length} Products Included</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--theme-text,#18181B)] leading-tight font-[family-name:var(--theme-font-heading)]">
                {bundle.name}
              </h1>

              {bundle.description && (
                <p className="text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed pt-1">
                  {bundle.description}
                </p>
              )}
            </div>

            {/* Products Included List */}
            <div className="space-y-2.5 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                Products in this Bundle:
              </h3>
              <div className="divide-y divide-[var(--theme-border,#E4E4E7)]">
                {bundle.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-white border border-[var(--theme-border,#E4E4E7)]">
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
                          className="font-bold text-xs text-[var(--theme-text,#18181B)] hover:text-[var(--theme-primary,#25D366)] transition truncate block"
                        >
                          {item.product?.name || item.productId}
                        </Link>
                        <p className="text-[10px] text-[var(--theme-text-muted,#71717A)]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--theme-text,#18181B)] shrink-0">
                      ${Number(item.product?.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Card & Savings Highlight */}
            <div className="space-y-3 rounded-xl border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-surface,#F4F4F5)] p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
                  ${bundle.bundlePrice.toFixed(2)}
                </span>
                <span className="text-lg text-[var(--theme-text-muted,#71717A)] line-through">
                  ${bundle.originalPrice.toFixed(2)}
                </span>
                {bundle.discountPercentage && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                    {Math.round(bundle.discountPercentage)}% OFF
                  </span>
                )}
              </div>

              {savings > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
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
              <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] font-semibold text-[var(--theme-text-muted,#71717A)] border-t border-[var(--theme-border,#E4E4E7)]">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[var(--theme-primary,#25D366)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free Standard Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-[var(--theme-primary,#25D366)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>30-Day Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Bundles */}
      {relatedBundles.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[var(--theme-border,#E4E4E7)] pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
              Related Product Bundles
            </h2>
            <Link href="/bundles" className="text-xs font-bold text-[var(--theme-primary,#25D366)] hover:underline">
              View All Bundles &rarr;
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

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getCategoryWithHierarchy } from "@/lib/categories";
import { getProductsByCategoryPaginated } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { getAbsoluteUrl, generateCategoryJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { normalizeImageUrl } from "@/lib/utils";

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category || category.status !== "active") {
    return {
      title: "Category Not Found",
    };
  }

  const title = category.seoTitle || `${category.name} | ApexStore`;
  const description =
    category.seoDescription ||
    category.description ||
    `Browse our curated collection of ${category.name} items.`;
  const canonicalUrl = getAbsoluteUrl(`/category/${category.slug}`);
  const ogImage = category.imageUrl
    ? category.imageUrl.startsWith("http")
      ? category.imageUrl
      : getAbsoluteUrl(category.imageUrl)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  let sp: { page?: string } = {};
  try {
    if (searchParams) {
      sp = (await searchParams) || {};
    }
  } catch {
    sp = {};
  }
  const currentPage = sp?.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const PAGE_SIZE = 12;

  // Fetch category, parent, and direct children via unified cached hierarchy
  let hierarchy = { category: null as any, parent: null as any, children: [] as any[] };
  try {
    hierarchy = await getCategoryWithHierarchy(slug);
  } catch (err) {
    console.warn("[CategoryPage] getCategoryWithHierarchy failed:", err);
  }

  const category = hierarchy.category || (await getCategoryBySlug(slug));

  if (!category || category.status !== "active") {
    notFound();
  }

  const parent = hierarchy.parent;
  const children = hierarchy.children || [];

  // Fetch paginated products directly for this category
  const paginatedResult = await getProductsByCategoryPaginated(
    category.id,
    currentPage,
    PAGE_SIZE
  );
  const categoryProducts = paginatedResult?.products || [];
  const total = paginatedResult?.total || 0;
  const totalPages = paginatedResult?.totalPages || 1;
  const page = paginatedResult?.page || currentPage;

  // Structured Data (JSON-LD)
  const categoryJsonLd = generateCategoryJsonLd(category, categoryProducts);
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/shop" },
    ...(parent ? [{ name: parent.name, url: `/category/${parent.slug}` }] : []),
    { name: category.name, url: `/category/${category.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);
  const categoryBannerUrl = category.imageUrl
    ? normalizeImageUrl(category.imageUrl, { width: 600, quality: 75 })
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#3C0561]">
      {categoryBannerUrl && (
        <link
          rel="preload"
          as="image"
          href={categoryBannerUrl}
          fetchPriority="high"
        />
      )}

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-purple-300/70">
          <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
            Categories
          </Link>
          <span>/</span>
          {parent && (
            <>
              <Link href={`/category/${parent.slug}`} className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
                {parent.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-purple-600 dark:text-purple-400 font-semibold">{category.name}</span>
        </nav>

        {/* Category Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-purple-100 dark:border-purple-800/80 bg-gradient-to-r from-purple-700 via-purple-800 to-[#3C0561] p-8 sm:p-12 text-white shadow-xl shadow-purple-500/10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-400/15 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-200 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-300 animate-pulse" />
                {parent ? `Subcategory of ${parent.name}` : "Core Collection"}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {category.name}
              </h1>

              {category.description ? (
                <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed max-w-xl">
                  {category.description}
                </p>
              ) : (
                <p className="text-xs text-purple-200/60 italic">
                  Curated performance gear engineered for athletic excellence and fluid movement.
                </p>
              )}

              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-purple-200/70">
                <span className="rounded-full bg-purple-900/60 px-2.5 py-0.5 border border-purple-400/30">
                  {total} {total === 1 ? "Product" : "Products"} Available
                </span>
                <span>•</span>
                <span>Category ID: /{category.slug}</span>
              </div>
            </div>

            {/* Category Image Preview if available */}
            {category.imageUrl && (
              <div className="relative h-48 w-full sm:w-72 lg:h-56 shrink-0 overflow-hidden rounded-2xl border border-purple-300/30 shadow-2xl">
                <Image
                  src={categoryBannerUrl || normalizeImageUrl(category.imageUrl, { width: 500, quality: 75 })}
                  alt={category.name}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            )}
          </div>
        </section>

        {/* Subcategories (if any exist) */}
        {children.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <h2 className="text-base font-bold text-purple-950 dark:text-purple-100 flex items-center gap-2">
                <span>Explore Subcategories</span>
                <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 text-xs text-purple-700 dark:text-purple-300 font-mono font-bold">
                  {children.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="group rounded-2xl border border-purple-100 dark:border-purple-800/80 bg-white dark:bg-purple-950/30 p-4 shadow-sm transition-all hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {child.name}
                    </span>
                    <svg
                      className="h-4 w-4 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {child.description && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-purple-300/70 line-clamp-1">
                      {child.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Products in this Category */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-4">
            <h2 className="text-xl font-extrabold text-purple-950 dark:text-purple-100">
              Products in {category.name}
            </h2>
            <span className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/40 px-3 py-1 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
              {total} Items
            </span>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-purple-200 dark:border-purple-800/80 bg-purple-50/30 dark:bg-purple-950/20 p-12 sm:p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-purple-950 dark:text-purple-100">
                No Products In This Category Yet
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-purple-300/70 max-w-md mx-auto">
                Explore our full catalog of high-performance gear or check out other collections.
              </p>
              <div className="mt-6">
                <Link
                  href="/shop"
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/25 transition-all"
                >
                  Explore All Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categoryProducts.map((prod, idx) => (
                  <ProductCard key={prod.id} product={prod} isPriority={!category.imageUrl && idx === 0} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-purple-100 dark:border-purple-900/60">
                  <p className="text-xs text-zinc-500 dark:text-purple-300/70">
                    Showing <span className="text-purple-900 dark:text-purple-100 font-bold">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
                    <span className="text-purple-900 dark:text-purple-100 font-bold">{Math.min(page * PAGE_SIZE, total)}</span> of{" "}
                    <span className="text-purple-900 dark:text-purple-100 font-bold">{total}</span> products
                  </p>

                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Link
                        href={`/category/${category.slug}?page=${page - 1}`}
                        prefetch={false}
                        className="rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/60 px-3.5 py-1.5 text-xs font-semibold text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all"
                      >
                        ← Previous
                      </Link>
                    ) : (
                      <span className="rounded-xl border border-zinc-200 dark:border-purple-900/40 bg-zinc-100/50 dark:bg-purple-950/20 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 dark:text-purple-400/30 cursor-not-allowed">
                        ← Previous
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                        <Link
                          key={pNum}
                          href={`/category/${category.slug}?page=${pNum}`}
                          prefetch={false}
                          className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                            pNum === page
                              ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                              : "border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 hover:bg-purple-50"
                          }`}
                        >
                          {pNum}
                        </Link>
                      ))}
                    </div>

                    {page < totalPages ? (
                      <Link
                        href={`/category/${category.slug}?page=${page + 1}`}
                        prefetch={false}
                        className="rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/60 px-3.5 py-1.5 text-xs font-semibold text-purple-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-all"
                      >
                        Next →
                      </Link>
                    ) : (
                      <span className="rounded-xl border border-zinc-200 dark:border-purple-900/40 bg-zinc-100/50 dark:bg-purple-950/20 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 dark:text-purple-400/30 cursor-not-allowed">
                        Next →
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Category SEO Content Card */}
        {category.description && (
          <section className="rounded-3xl border border-purple-100 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 p-6 sm:p-8 space-y-2">
            <h3 className="text-sm font-bold text-purple-950 dark:text-purple-100">
              About {category.name}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-purple-300/80 leading-relaxed">
              {category.description}
            </p>
            {category.seoDescription && category.seoDescription !== category.description && (
              <p className="text-xs text-zinc-500 dark:text-purple-300/60 leading-relaxed pt-2">
                {category.seoDescription}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

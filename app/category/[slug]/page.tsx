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

export async function generateStaticParams() {
  try {
    const { getActiveCategories } = await import("@/lib/categories");
    const cats = await getActiveCategories();
    return cats.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

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

  const title = category.seoTitle || `${category.name} | Apex Store`;
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
  const sp = searchParams ? await searchParams : {};
  const currentPage = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const PAGE_SIZE = 12;

  // Fetch category, parent, and direct children via unified cached hierarchy
  const { category, parent, children } = await getCategoryWithHierarchy(slug);

  if (!category || category.status !== "active") {
    notFound();
  }

  // Fetch paginated products directly for this category
  const { products: categoryProducts, total, totalPages, page } = await getProductsByCategoryPaginated(
    category.id,
    currentPage,
    PAGE_SIZE
  );

  // Structured Data (JSON-LD)
  const categoryJsonLd = generateCategoryJsonLd(category, categoryProducts);
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    ...(parent ? [{ name: parent.name, url: `/category/${parent.slug}` }] : []),
    { name: category.name, url: `/category/${category.slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        {parent && (
          <>
            <Link href={`/category/${parent.slug}`} className="hover:text-white transition-colors">
              {parent.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#18C729] font-medium">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1611]/90 to-[#080e0a]/90 p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-3 py-1 text-[11px] font-semibold text-[#18C729]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
              {parent ? `Subcategory of ${parent.name}` : "Core Collection"}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {category.name}
            </h1>

            {category.description ? (
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                {category.description}
              </p>
            ) : (
              <p className="text-xs text-white/40 italic">
                Dynamic category catalog powered by Cloudflare D1.
              </p>
            )}

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-white/40">
              <span>Slug: /{category.slug}</span>
              <span>•</span>
              <span>{categoryProducts.length} Products Available</span>
            </div>
          </div>

          {/* Category Image Preview if available */}
          {category.imageUrl && (
            <div className="relative h-48 w-full sm:w-64 lg:h-56 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-xl">
              <Image
                src={normalizeImageUrl(category.imageUrl, { width: 800, quality: 75 })}
                alt={category.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 256px"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
        </div>
      </section>

      {/* Subcategories (if any exist) */}
      {children.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Explore Subcategories</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
              {children.length}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="group rounded-2xl border border-white/10 bg-[#0c140f]/60 p-4 backdrop-blur-md transition-all hover:border-[#18C729]/40 hover:shadow-lg hover:shadow-[#18C729]/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white group-hover:text-[#18C729] transition-colors">
                    {child.name}
                  </span>
                  <svg
                    className="h-4 w-4 text-white/40 group-hover:text-[#18C729] group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {child.description && (
                  <p className="mt-1 text-xs text-white/50 line-clamp-1">
                    {child.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Products in this Category */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white">Products in {category.name}</h2>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-[#18C729]">
            {total} Items
          </span>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-black/30 p-12 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[#18C729]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">No Products In This Category Yet</h3>
            <p className="mt-1 text-xs text-white/50 max-w-md mx-auto">
              Products assigned to &quot;{category.name}&quot; will automatically display here when published.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/products"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
              >
                Add Product to Category
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categoryProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
                <p className="text-xs text-white/50">
                  Showing <span className="text-white font-medium">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
                  <span className="text-white font-medium">{Math.min(page * PAGE_SIZE, total)}</span> of{" "}
                  <span className="text-white font-medium">{total}</span> products
                </p>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/category/${category.slug}?page=${page - 1}`}
                      prefetch={false}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-white/20 cursor-not-allowed">
                      ← Previous
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                      <Link
                        key={pNum}
                        href={`/category/${category.slug}?page=${pNum}`}
                        prefetch={false}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                          pNum === page
                            ? "bg-[#18C729] text-black font-bold shadow-md shadow-[#18C729]/20"
                            : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
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
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-white/20 cursor-not-allowed">
                      Next →
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

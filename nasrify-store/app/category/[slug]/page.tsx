import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getCategoryWithHierarchy } from "@/lib/categories";
import { getProductsByCategoryPaginated } from "@/lib/products";
import { getAbsoluteUrl, generateCategoryJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { normalizeImageUrl } from "@/lib/utils";
import { getActiveTheme } from "@/lib/themes/loader";
import { renderPageTheme } from "@/lib/themes/engine";
import { StoreData } from "@/lib/themes/types";

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
      title: "Category Not Found | Nasrify Store",
    };
  }

  const title = category.seoTitle || `${category.name} | Nasrify Store`;
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

  const [theme, paginatedResult] = await Promise.all([
    getActiveTheme(),
    getProductsByCategoryPaginated(category.id, currentPage, PAGE_SIZE),
  ]);

  const categoryProducts = paginatedResult?.products || [];
  const total = paginatedResult?.total || 0;
  const totalPages = paginatedResult?.totalPages || 1;
  const parent = hierarchy.parent;

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

  const storeData: StoreData = {
    category: {
      ...category,
      image: category.imageUrl,
    },
    products: categoryProducts,
    categories: hierarchy.children && hierarchy.children.length > 0 ? hierarchy.children : [],
    total,
    page: currentPage,
    totalPages,
  };

  return (
    <>
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-[family-name:var(--theme-font-body)]">
        {renderPageTheme(theme, "category", storeData)}
      </div>
    </>
  );
}

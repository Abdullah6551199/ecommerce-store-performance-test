import React from "react";
import Link from "next/link";
import { listHomepageSections, seedDefaultSectionsIfEmpty, HomepageSectionRecord } from "@/lib/homepage";
import { getActiveCategories, CategoryRecord } from "@/lib/categories";
import { getFeaturedProducts, ProductWithImagesAndCategory } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

/**
 * Stage 7 Storefront Homepage (Server Component)
 * Fully dynamic layout driven 100% by Cloudflare D1 `homepage_sections`, `categories`, and `products`.
 * Zero hardcoded marketing copy.
 */
export default async function HomePage(): Promise<React.JSX.Element> {
  // Query active sections ordered by sortOrder
  let sections = await listHomepageSections({ activeOnly: true });
  if (sections.length === 0) {
    sections = await seedDefaultSectionsIfEmpty();
    sections = sections.filter((s) => s.isActive);
  }

  // Pre-fetch catalog data for sections that require relational records
  const [categories, featuredProducts] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-24">
      {sections.map((section) => (
        <React.Fragment key={section.id}>
          {renderHomepageSection(section, categories, featuredProducts)}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Dispatcher to render the appropriate section component based on its dynamic type
 */
function renderHomepageSection(
  section: HomepageSectionRecord,
  categories: CategoryRecord[],
  featuredProducts: ProductWithImagesAndCategory[]
): React.JSX.Element {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} />;
    case "categories":
      return <CategoriesSection section={section} categories={categories} />;
    case "featured_products":
      return <FeaturedProductsSection section={section} products={featuredProducts} />;
    case "promo_banner":
      return <PromoBannerSection section={section} />;
    case "brand_story":
      return <BrandStorySection section={section} />;
    default:
      return <GenericSection section={section} />;
  }
}

/**
 * 1. Dynamic Hero Showcase Section
 */
function HeroSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, imageUrl } = section;
  const isCentered = content?.alignment === "center";

  return (
    <section
      id="hero-section"
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1611]/85 to-[#080e0a]/90 p-8 sm:p-14 backdrop-blur-xl shadow-2xl"
    >
      {/* Glow orb ambient decorations */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#18C729]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[#FEF500]/10 blur-3xl" />

      <div className={`relative grid grid-cols-1 ${imageUrl ? "lg:grid-cols-12 gap-10 items-center" : "max-w-4xl"}`}>
        <div className={`space-y-6 ${imageUrl ? "lg:col-span-7" : ""} ${isCentered ? "mx-auto text-center" : ""}`}>
          {content?.badgeText && (
            <div className={`inline-flex items-center gap-2 rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#18C729]`}>
              <span className="h-2 w-2 rounded-full bg-[#18C729] animate-pulse" />
              <span>{content.badgeText}</span>
            </div>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
            {content?.heading}
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
            {content?.subheading}
          </p>

          <div className={`flex flex-wrap items-center gap-4 pt-2 ${isCentered ? "justify-center" : ""}`}>
            {content?.buttonText && content?.buttonUrl && (
              <a
                href={content.buttonUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-6 py-3.5 text-xs sm:text-sm font-semibold text-black shadow-lg shadow-[#18C729]/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <span>{content.buttonText}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            )}

            {content?.secondaryButtonText && content?.secondaryButtonUrl && (
              <a
                href={content.secondaryButtonUrl}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                {content.secondaryButtonText}
              </a>
            )}
          </div>
        </div>

        {/* Optional hero image showcase */}
        {imageUrl && (
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-2xl">
              <img
                src={imageUrl}
                alt={content?.heading || "Hero Showcase"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * 2. Dynamic Categories Grid Section
 */
function CategoriesSection({
  section,
  categories,
}: {
  section: HomepageSectionRecord;
  categories: CategoryRecord[];
}): React.JSX.Element {
  const { content } = section;
  const maxItems = typeof content?.maxItems === "number" ? content.maxItems : 6;
  const displayedCategories = categories.slice(0, maxItems);

  return (
    <section id="categories-section" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          {content?.badgeText && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FEF500]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FEF500]" />
              <span>{content.badgeText}</span>
            </div>
          )}
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {content?.heading || section.title}
          </h2>
          {content?.subheading && (
            <p className="mt-1 text-xs text-white/50">{content.subheading}</p>
          )}
        </div>

        {content?.viewAllUrl && (
          <Link
            href={content.viewAllUrl}
            className="text-xs font-semibold text-[#18C729] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Categories &rarr;</span>
          </Link>
        )}
      </div>

      {displayedCategories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-[#0c140f]/60 p-12 text-center backdrop-blur-md">
          <p className="text-sm font-semibold text-white">No Categories Available Yet</p>
          <div className="mt-4">
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FEF500] px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
            >
              Add Categories in Admin
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${encodeURIComponent(category.slug)}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0c140f]/80 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#18C729]/50 hover:shadow-2xl hover:shadow-[#18C729]/15"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] p-4 text-center">
                    <span className="text-xl font-bold uppercase text-[#18C729]">
                      {category.name.substring(0, 2)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md">
                    Collection
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-1 flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#18C729] transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-xs text-white/60 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-semibold text-[#18C729]">
                  <span className="group-hover:underline">Explore Collection</span>
                  <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * 3. Dynamic Featured Products Section
 */
function FeaturedProductsSection({
  section,
  products,
}: {
  section: HomepageSectionRecord;
  products: ProductWithImagesAndCategory[];
}): React.JSX.Element {
  const { content } = section;
  const maxItems = typeof content?.maxItems === "number" ? content.maxItems : 4;
  const displayedProducts = products.slice(0, maxItems);

  return (
    <section id="featured-products" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          {content?.badgeText && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#18C729]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
              <span>{content.badgeText}</span>
            </div>
          )}
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {content?.heading || section.title}
          </h2>
          {content?.subheading && (
            <p className="mt-1 text-xs text-white/50">{content.subheading}</p>
          )}
        </div>

        {content?.viewAllUrl && (
          <Link
            href={content.viewAllUrl}
            className="text-xs font-semibold text-[#18C729] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Products &rarr;</span>
          </Link>
        )}
      </div>

      {displayedProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-[#0c140f]/60 p-12 text-center backdrop-blur-md">
          <p className="text-sm font-semibold text-white">No Products Published Yet</p>
          <div className="mt-4">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#18C729] px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
            >
              Add Products in Admin
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * 4. Dynamic Promotional Banner Section
 */
function PromoBannerSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, imageUrl } = section;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-[#0d1611] via-[#09110c] to-[#121c14] p-8 sm:p-12 shadow-2xl">
      {/* Decorative Glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#18C729]/15 blur-3xl" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-64 w-64 rounded-full bg-[#FEF500]/10 blur-3xl" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className={`${imageUrl ? "lg:col-span-7" : "lg:col-span-12"} space-y-5`}>
          {content?.badgeText && (
            <span className="inline-block rounded-full border border-[#FEF500]/30 bg-[#FEF500]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FEF500]">
              {content.badgeText}
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-snug">
            {content?.heading}
          </h2>

          <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
            {content?.subheading}
          </p>

          {content?.buttonText && content?.buttonUrl && (
            <div className="pt-2">
              <a
                href={content.buttonUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18C729] to-[#12a822] px-6 py-3 text-xs sm:text-sm font-semibold text-black shadow-lg shadow-[#18C729]/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <span>{content.buttonText}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-xl">
              <img
                src={imageUrl}
                alt={content?.heading || "Promotional Banner"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * 5. Dynamic Brand Story & Stats Section
 */
function BrandStorySection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, imageUrl } = section;
  const statItems = Array.isArray(content?.statItems) ? content.statItems : [];

  return (
    <section id="brand-story" className="relative space-y-10 rounded-3xl border border-white/10 bg-[#090e0b]/90 p-8 sm:p-14 backdrop-blur-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className={`${imageUrl ? "lg:col-span-7" : "lg:col-span-12"} space-y-6`}>
          {content?.subheading && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#18C729]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
              <span>{content.subheading}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {content?.heading}
          </h2>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl whitespace-pre-line">
            {content?.narrativeText}
          </p>

          {content?.ctaText && content?.ctaUrl && (
            <div className="pt-2">
              <a
                href={content.ctaUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all"
              >
                <span>{content.ctaText}</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-xl">
              <img
                src={imageUrl}
                alt={content?.heading || "Brand Story"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Stats Grid */}
      {statItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/10 pt-8">
          {statItems.map((stat: { label: string; value: string; desc?: string }, idx: number) => (
            <div key={`${stat.label}-${idx}`} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#18C729]">{stat.value}</span>
              <p className="mt-1 text-xs font-semibold text-white">{stat.label}</p>
              {stat.desc && <p className="mt-0.5 text-[10px] text-white/40">{stat.desc}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * 6. Generic / Custom Fallback Section
 */
function GenericSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, title, imageUrl } = section;

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0c140f]/80 p-8 backdrop-blur-md space-y-4">
      <h2 className="text-xl font-bold text-white">{content?.heading || title}</h2>
      {content?.subheading && <p className="text-xs text-white/60">{content.subheading}</p>}
      {imageUrl && (
        <div className="overflow-hidden rounded-xl max-h-80">
          <img src={imageUrl} alt={title} className="w-full object-cover" />
        </div>
      )}
      {content?.buttonText && content?.buttonUrl && (
        <div>
          <a
            href={content.buttonUrl}
            className="inline-block rounded-xl bg-[#18C729] px-4 py-2 text-xs font-semibold text-black"
          >
            {content.buttonText}
          </a>
        </div>
      )}
    </section>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { HomepageSectionRecord } from "@/lib/homepage";
import { CategoryRecord } from "@/lib/categories";
import { ProductWithImagesAndCategory } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { normalizeImageUrl } from "@/lib/utils";

const NewsletterForm = dynamic(() => import("./NewsletterForm"), { ssr: true });


/**
 * 1. Hero Showcase Section
 */
export function HeroSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, imageUrl } = section;
  const isCentered = content?.alignment === "center";

  return (
    <section
      id="hero-section"
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1611]/85 to-[#080e0a]/90 p-8 sm:p-14 backdrop-blur-xl shadow-2xl"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      {/* Ambient ambient glow decorations */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: "var(--color-primary, #18C729)" }}
      />
      <div
        className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full blur-3xl opacity-15"
        style={{ backgroundColor: "var(--color-accent, #FEF500)" }}
      />

      <div className={`relative grid grid-cols-1 ${imageUrl ? "lg:grid-cols-12 gap-10 items-center" : "max-w-4xl"}`}>
        <div className={`space-y-6 ${imageUrl ? "lg:col-span-7" : ""} ${isCentered ? "mx-auto text-center" : ""}`}>
          {content?.badgeText && (
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                borderColor: "color-mix(in srgb, var(--color-primary, #18C729) 30%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--color-primary, #18C729) 10%, transparent)",
                color: "var(--color-primary, #18C729)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--color-primary, #18C729)" }}
              />
              <span>{content.badgeText}</span>
            </div>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
            {content?.heading || section.title}
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
            {content?.subheading}
          </p>

          <div className={`flex flex-wrap items-center gap-4 pt-2 ${isCentered ? "justify-center" : ""}`}>
            {content?.buttonText && content?.buttonUrl && (
              <a
                href={content.buttonUrl}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold text-black shadow-lg hover:brightness-110 active:scale-95 transition-all"
                style={{
                  borderRadius: "var(--radius-btn, 0.75rem)",
                  background: "linear-gradient(135deg, var(--color-primary, #18C729), var(--color-secondary, #12a822))",
                }}
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
                style={{ borderRadius: "var(--radius-btn, 0.75rem)" }}
              >
                {content.secondaryButtonText}
              </a>
            )}
          </div>
        </div>

        {/* Optional hero image showcase (LCP priority) */}
        {imageUrl && (
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-2xl">
              <Image
                src={normalizeImageUrl(imageUrl, { hero: true, width: 700, quality: 72 })}
                alt={content?.heading || "Hero Showcase"}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 42vw"
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
 * 2. Categories Grid Section
 */
export function CategoriesSection({
  section,
  categories,
}: {
  section: HomepageSectionRecord;
  categories: CategoryRecord[];
}): React.JSX.Element {
  const { content } = section;
  const maxItems = typeof content?.maxItems === "number" ? content.maxItems : 6;
  const displayedCategories = (categories || []).slice(0, maxItems);

  return (
    <section id="categories-section" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          {content?.badgeText && (
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-accent, #FEF500)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-accent, #FEF500)" }}
              />
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
            className="text-xs font-semibold hover:underline flex items-center gap-1 shrink-0"
            style={{ color: "var(--color-primary, #18C729)" }}
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
              style={{
                backgroundColor: "var(--color-accent, #FEF500)",
                borderRadius: "var(--radius-btn, 0.75rem)",
              }}
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
              className="group relative flex flex-col overflow-hidden border border-white/10 bg-[#0c140f]/80 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                borderRadius: "var(--radius-card, 1.5rem)",
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                {category.imageUrl ? (
                  <Image
                    src={normalizeImageUrl(category.imageUrl, { width: 600, quality: 75 })}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] p-4 text-center">
                    <span
                      className="text-xl font-bold uppercase"
                      style={{ color: "var(--color-primary, #18C729)" }}
                    >
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

                <div
                  className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-semibold"
                  style={{ color: "var(--color-primary, #18C729)" }}
                >
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
 * 3. Featured Products Section
 */
export function FeaturedProductsSection({
  section,
  products,
}: {
  section: HomepageSectionRecord;
  products: ProductWithImagesAndCategory[];
}): React.JSX.Element {
  const { content } = section;
  const maxItems = typeof content?.maxItems === "number" ? content.maxItems : 4;
  const displayedProducts = (products || []).slice(0, maxItems);

  return (
    <section id="featured-products" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          {content?.badgeText && (
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-primary, #18C729)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-primary, #18C729)" }}
              />
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
            className="text-xs font-semibold hover:underline flex items-center gap-1 shrink-0"
            style={{ color: "var(--color-primary, #18C729)" }}
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
              style={{
                backgroundColor: "var(--color-primary, #18C729)",
                borderRadius: "var(--radius-btn, 0.75rem)",
              }}
            >
              Add Products in Admin
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} isPriority={false} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * 4. Promotional Banner Section
 */
export function PromoBannerSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, imageUrl } = section;

  return (
    <section
      className="relative overflow-hidden border border-white/15 bg-gradient-to-r from-[#0d1611] via-[#09110c] to-[#121c14] p-8 sm:p-12 shadow-2xl"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      {/* Decorative Glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full blur-3xl opacity-15"
        style={{ backgroundColor: "var(--color-primary, #18C729)" }}
      />
      <div
        className="pointer-events-none absolute left-0 bottom-0 h-64 w-64 rounded-full blur-3xl opacity-15"
        style={{ backgroundColor: "var(--color-accent, #FEF500)" }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className={`${imageUrl ? "lg:col-span-7" : "lg:col-span-12"} space-y-5`}>
          {content?.badgeText && (
            <span
              className="inline-block rounded-full border px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{
                borderColor: "color-mix(in srgb, var(--color-accent, #FEF500) 30%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--color-accent, #FEF500) 10%, transparent)",
                color: "var(--color-accent, #FEF500)",
              }}
            >
              {content.badgeText}
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-snug">
            {content?.heading || section.title}
          </h2>

          <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
            {content?.subheading}
          </p>

          {content?.buttonText && content?.buttonUrl && (
            <div className="pt-2">
              <a
                href={content.buttonUrl}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-black shadow-lg hover:brightness-110 active:scale-95 transition-all"
                style={{
                  borderRadius: "var(--radius-btn, 0.75rem)",
                  background: "linear-gradient(135deg, var(--color-primary, #18C729), var(--color-secondary, #12a822))",
                }}
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
              <Image
                src={normalizeImageUrl(imageUrl, { width: 1200, quality: 75 })}
                alt={content?.heading || "Promotional Banner"}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                loading="lazy"
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
 * 5. Brand Story & Stats Section
 */
export function BrandStorySection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, imageUrl } = section;
  const statItems = Array.isArray(content?.statItems) ? content.statItems : [];

  return (
    <section
      id="brand-story"
      className="relative space-y-10 border border-white/10 bg-[#090e0b]/90 p-8 sm:p-14 backdrop-blur-lg"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className={`${imageUrl ? "lg:col-span-7" : "lg:col-span-12"} space-y-6`}>
          {content?.subheading && (
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-primary, #18C729)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-primary, #18C729)" }}
              />
              <span>{content.subheading}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {content?.heading || section.title}
          </h2>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl whitespace-pre-line">
            {content?.narrativeText}
          </p>

          {content?.ctaText && content?.ctaUrl && (
            <div className="pt-2">
              <a
                href={content.ctaUrl}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all"
                style={{ borderRadius: "var(--radius-btn, 0.75rem)" }}
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
              <Image
                src={normalizeImageUrl(imageUrl, { width: 1200, quality: 75 })}
                alt={content?.heading || "Brand Story"}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                loading="lazy"
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
              <span
                className="text-2xl sm:text-3xl font-extrabold"
                style={{ color: "var(--color-primary, #18C729)" }}
              >
                {stat.value}
              </span>
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
 * 6. Testimonials Section
 */
export function TestimonialsSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content } = section;
  const testimonials = Array.isArray(content?.testimonials) ? content.testimonials : [];

  return (
    <section
      id="testimonials-section"
      className="space-y-8 rounded-3xl border border-white/10 bg-[#080d09]/80 p-8 sm:p-12 backdrop-blur-md"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      <div className="text-center max-w-2xl mx-auto space-y-2">
        {content?.badgeText && (
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-accent, #FEF500)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-accent, #FEF500)" }}
            />
            <span>{content.badgeText}</span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {content?.heading || section.title}
        </h2>
        {content?.subheading && (
          <p className="text-xs sm:text-sm text-white/60">{content.subheading}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {(testimonials as Array<{ quote?: string; author?: string; role?: string; avatar?: string; rating?: number }>).map((t, idx: number) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-all"
            style={{ borderRadius: "var(--radius-base, 1rem)" }}
          >
            <div className="space-y-3">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-[#FEF500]">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/10">
              {t.avatar ? (
                <Image
                  src={normalizeImageUrl(t.avatar, { width: 80, quality: 80 })}
                  alt={t.author || "Testimonial Avatar"}
                  width={40}
                  height={40}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-black text-xs"
                  style={{ backgroundColor: "var(--color-primary, #18C729)" }}
                >
                  {t.author?.substring(0, 2) || "AP"}
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-white">{t.author}</h4>
                <p className="text-[11px] text-white/50">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 7. Newsletter Subscription Section
 */
export function NewsletterSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content } = section;

  return (
    <section
      id="newsletter-section"
      className="relative overflow-hidden border border-white/15 bg-gradient-to-br from-[#0c150e] via-[#09100c] to-[#121c13] p-8 sm:p-14 text-center shadow-2xl"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      <div
        className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: "var(--color-primary, #18C729)" }}
      />

      <div className="relative max-w-2xl mx-auto space-y-4">
        {content?.badgeText && (
          <span
            className="inline-block rounded-full border px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{
              borderColor: "color-mix(in srgb, var(--color-primary, #18C729) 30%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--color-primary, #18C729) 10%, transparent)",
              color: "var(--color-primary, #18C729)",
            }}
          >
            {content.badgeText}
          </span>
        )}

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {content?.heading || section.title}
        </h2>

        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
          {content?.subheading}
        </p>

        <NewsletterForm
          placeholderText={content?.placeholderText}
          buttonText={content?.buttonText}
        />

        {content?.disclaimer && (
          <p className="text-[10px] text-white/40 pt-2">{content.disclaimer}</p>
        )}
      </div>
    </section>
  );
}

/**
 * 8. Custom HTML / Content Section
 */
export function CustomHtmlSection({ section }: { section: HomepageSectionRecord }): React.JSX.Element {
  const { content, title, imageUrl } = section;

  return (
    <section
      className="border border-white/10 bg-[#0c140f]/80 p-8 backdrop-blur-md space-y-4"
      style={{ borderRadius: "var(--radius-card, 1.5rem)" }}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white">{content?.heading || title}</h2>
      {content?.subheading && <p className="text-xs sm:text-sm text-white/60">{content.subheading}</p>}

      {imageUrl && (
        <div className="relative overflow-hidden rounded-xl h-64 sm:h-96 w-full">
          <Image
            src={normalizeImageUrl(imageUrl, { width: 1200, quality: 75 })}
            alt={title}
            fill
            sizes="100vw"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {content?.html && (
        <div
          className="prose prose-invert max-w-none text-xs sm:text-sm text-white/80"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      )}

      {content?.buttonText && content?.buttonUrl && (
        <div className="pt-2">
          <a
            href={content.buttonUrl}
            className="inline-block px-5 py-2.5 text-xs font-semibold text-black hover:brightness-110"
            style={{
              borderRadius: "var(--radius-btn, 0.75rem)",
              backgroundColor: "var(--color-primary, #18C729)",
            }}
          >
            {content.buttonText}
          </a>
        </div>
      )}
    </section>
  );
}

/**
 * Dispatcher to render the appropriate section component based on its dynamic type
 */
export function renderHomepageSection(
  section: HomepageSectionRecord,
  categories: CategoryRecord[] = [],
  featuredProducts: ProductWithImagesAndCategory[] = []
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
    case "testimonials":
      return <TestimonialsSection section={section} />;
    case "newsletter":
      return <NewsletterSection section={section} />;
    case "custom_html":
    case "custom":
    default:
      return <CustomHtmlSection section={section} />;
  }
}

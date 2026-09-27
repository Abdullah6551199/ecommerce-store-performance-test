import React from "react";
import Link from "next/link";
import { renderRich } from "@/lib/themes/render-rich";

interface BlogPostsProps {
  settings?: Record<string, any>;
  variant?: string;
}

export default function BlogPosts({
  settings = {},
  variant = "grid_3col",
}: BlogPostsProps) {
  const currentVariant = variant || settings.variant || "grid_3col";

  const heading = settings.heading || "Latest From the Journal";
  const subheading =
    settings.subheading ||
    "Stories, lifestyle guides, and behind the scenes with our creators.";
  const showDate = settings.show_date !== false;
  const showAuthor = settings.show_author !== false;
  const showExcerpt = settings.show_excerpt !== false;

  const samplePosts = [
    {
      id: "1",
      slug: "art-of-minimalist-architecture",
      title: "The Art of Minimalist Living & Sustainable Design",
      excerpt:
        "Exploring how reduced forms and intentional material selections craft enduring living spaces.",
      date: "Oct 24, 2026",
      author: "Elena Rostova",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "2",
      slug: "sustainable-materials-breakthrough",
      title: "Sustainable Textiles: Organic Fibers & Closed-Loop Craft",
      excerpt:
        "A closer look inside our certified European weaving workshops and regenerative dyeing labs.",
      date: "Oct 18, 2026",
      author: "Marcus Chen",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "3",
      slug: "autumn-lookbook-curation",
      title: "Autumn / Winter Atelier: Behind the Runway Silhouette",
      excerpt:
        "Discover the inspiration and tailored structure behind our newest outerwear drop.",
      date: "Oct 12, 2026",
      author: "Alexander Vance",
      image:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
    },
  ];

  // Variant 3: Featured 1 + Side List
  if (currentVariant === "featured_plus_list") {
    const featured = samplePosts[0];
    const sidePosts = samplePosts.slice(1);

    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-2">
          <h2
            data-editable="heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <div
            data-editable="subheading"
            className="text-base text-gray-400 font-[family-name:var(--theme-font-body)]"
            dangerouslySetInnerHTML={renderRich(subheading)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold">
                {showDate && <span>{featured.date}</span>}
                {showAuthor && <span>• By {featured.author}</span>}
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                <Link href={`/pages/${featured.slug}`}>{featured.title}</Link>
              </h3>
              {showExcerpt && (
                <p className="text-sm text-gray-400 leading-relaxed">
                  {featured.excerpt}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {sidePosts.map((post) => (
              <div
                key={post.id}
                className="group flex gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 transition-colors"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-24 h-24 rounded-lg object-cover shrink-0"
                />
                <div className="space-y-1">
                  {showDate && (
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {post.date}
                    </span>
                  )}
                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                    <Link href={`/pages/${post.slug}`}>{post.title}</Link>
                  </h4>
                  {showExcerpt && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Variant 2 & 1: Carousel / Grid 3-col
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center max-w-3xl mx-auto space-y-2">
        <h2
          data-editable="heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
          dangerouslySetInnerHTML={renderRich(heading)}
        />
        <div
          data-editable="subheading"
          className="text-base text-gray-400 font-[family-name:var(--theme-font-body)]"
          dangerouslySetInnerHTML={renderRich(subheading)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {samplePosts.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold">
                  {showDate && <span>{post.date}</span>}
                  {showAuthor && <span>• By {post.author}</span>}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  <Link href={`/pages/${post.slug}`}>{post.title}</Link>
                </h3>
                {showExcerpt && (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <div className="pt-2">
                <Link
                  href={`/pages/${post.slug}`}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                >
                  Read Story &rarr;
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import React from "react";
import { getDb, products, categories, media, settings } from "@/lib/db";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const db = getDb();
  let totalProducts = 0;
  let totalCategories = 0;
  let totalMedia = 0;
  let totalSettings = 0;

  if (db) {
    try {
      const [prodRes, catRes, mediaRes, setRes] = await Promise.all([
        db.select({ value: count() }).from(products),
        db.select({ value: count() }).from(categories),
        db.select({ value: count() }).from(media),
        db.select({ value: count() }).from(settings),
      ]);
      totalProducts = prodRes[0]?.value || 0;
      totalCategories = catRes[0]?.value || 0;
      totalMedia = mediaRes[0]?.value || 0;
      totalSettings = setRes[0]?.value || 0;
    } catch (err) {
      console.warn("[Admin Dashboard] Error querying D1 metrics:", err);
    }
  }

  const statCards = [
    {
      title: "Total Products",
      value: totalProducts,
      desc: "Live catalog items in D1",
      badge: "D1 Connected",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      accent: "#18C729",
    },
    {
      title: "Active Categories",
      value: totalCategories,
      desc: "Taxonomy groupings",
      badge: "Relational",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
      accent: "#FEF500",
    },
    {
      title: "Stored Media Assets",
      value: totalMedia,
      desc: "Managed in Cloudflare R2",
      badge: "R2 Active",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      accent: "#18C729",
    },
    {
      title: "System Settings",
      value: totalSettings,
      desc: "Key-value configuration entries",
      badge: "Synchronized",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      accent: "#FEF500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Shell */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1a13] p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              System Dashboard
            </h1>
            <p className="mt-1 text-xs text-white/60">
              Live metrics queried directly from your Cloudflare D1 database and R2 bucket.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#18C729] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#18C729]">
              Live Cloudflare Workers Runtime
            </span>
          </div>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1611] p-5 shadow-lg transition-all hover:border-[#18C729]/40 hover:shadow-xl hover:shadow-[#18C729]/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {card.title}
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-transform group-hover:scale-110"
                style={{ color: card.accent }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {card.value}
              </span>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#18C729]">
                {card.badge}
              </span>
            </div>

            <p className="mt-2 text-xs text-white/40">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Foundational Navigation Slots */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1611] p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
          Admin Modules
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <a
            href="/admin/products"
            className="flex flex-col items-center justify-center rounded-xl border border-[#18C729]/30 bg-[#18C729]/5 p-4 text-center text-xs text-white hover:border-[#18C729]/60 hover:bg-[#18C729]/10 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#18C729] mb-2 animate-pulse" />
            <span className="font-semibold text-[#18C729]">Products</span>
            <span className="text-[10px] text-[#FEF500] mt-1 font-medium">Stage 5 Active</span>
          </a>

          <a
            href="/admin/categories"
            className="flex flex-col items-center justify-center rounded-xl border border-[#18C729]/30 bg-[#18C729]/5 p-4 text-center text-xs text-white hover:border-[#18C729]/60 hover:bg-[#18C729]/10 transition-all"
          >
            <div className="h-2 w-2 rounded-full bg-[#18C729] mb-2 animate-pulse" />
            <span className="font-semibold text-[#18C729]">Categories</span>
            <span className="text-[10px] text-[#FEF500] mt-1 font-medium">Stage 4 Active</span>
          </a>

          {["Orders", "Customers", "Media Assets", "Settings"].map((mod) => (
            <a
              key={mod}
              href={`/admin/${mod.toLowerCase().replace(" assets", "")}`}
              className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-white/70 hover:bg-white/5 transition-colors"
            >
              <div className="h-2 w-2 rounded-full bg-white/30 mb-2" />
              <span className="font-semibold">{mod}</span>
              <span className="text-[10px] text-white/40 mt-1">Ready</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

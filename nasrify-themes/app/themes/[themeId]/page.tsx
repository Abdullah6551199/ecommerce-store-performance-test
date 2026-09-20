import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getThemeByThemeId, getApprovedThemeListings } from "@/lib/themes/marketplace";
import { getThemeInstallCount } from "@/lib/themes/installs";
import { ThemeCard } from "@/components/ThemeCard";
import { ThemeMockupPreview } from "@/components/ThemeMockupPreview";
import type { ThemeConfig } from "@/types/themes";

export const dynamic = "force-dynamic";

interface ThemeDetailPageProps {
  params: Promise<{
    themeId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ThemeDetailPageProps): Promise<Metadata> {
  const { themeId } = await params;
  const theme = await getThemeByThemeId(themeId);

  if (!theme) {
    return {
      title: "Theme Not Found - Nasrify Themes Hub",
    };
  }

  return {
    title: `${theme.name} - Nasrify Storefront Theme`,
    description: theme.description || `Install the ${theme.name} theme for your Nasrify storefront.`,
  };
}

export default async function ThemeDetailPage({
  params,
}: ThemeDetailPageProps): Promise<React.JSX.Element> {
  const { themeId } = await params;
  const theme = await getThemeByThemeId(themeId);

  if (!theme) {
    notFound();
  }

  const [installCount, allThemes] = await Promise.all([
    getThemeInstallCount(theme.id),
    getApprovedThemeListings({ limit: 8 }),
  ]);

  const relatedThemes = allThemes
    .filter((t) => t.themeId !== theme.themeId)
    .filter((t) => t.category === theme.category || allThemes.indexOf(t) < 3)
    .slice(0, 3);

  let config: ThemeConfig = {};
  if (theme.configJson) {
    try {
      config = JSON.parse(theme.configJson);
    } catch {
      config = {};
    }
  }

  let screenshots: string[] = [];
  if (theme.screenshotUrls) {
    try {
      screenshots = JSON.parse(theme.screenshotUrls);
    } catch {
      screenshots = [];
    }
  }

  const isFree = !theme.pricing || theme.pricing === "free" || !theme.price || theme.price === 0;
  const adminUrl = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
  const installUrl = `/api/themes/install?themeId=${encodeURIComponent(theme.themeId)}`;

  const primaryColor = config.colors?.primary || "#780AC2";
  const secondaryColor = config.colors?.secondary || "#960DF2";
  const accentColor = config.colors?.accent || "#C06EF7";
  const surfaceColor = config.colors?.surface || "#FFFFFF";
  const bgColor = config.colors?.background || "#FAFAFA";
  const textColor = config.colors?.text || "#18181B";

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          Themes Marketplace
        </Link>
        <span>/</span>
        <span className="text-zinc-400">{theme.category || "General"}</span>
        <span>/</span>
        <span className="text-zinc-900 dark:text-white">{theme.name}</span>
      </nav>

      {/* Main Hero Header */}
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {theme.category || "Minimal"}
              </span>
              <span className="text-xs font-mono text-zinc-400">v{theme.version}</span>
              <span className="text-zinc-400">&bull;</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {installCount} {installCount === 1 ? "store" : "stores"} using this theme
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              {theme.name}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Created by{" "}
              {theme.authorUrl ? (
                <a
                  href={theme.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-zinc-900 dark:text-white hover:underline"
                >
                  {theme.author}
                </a>
              ) : (
                <span className="font-bold text-zinc-900 dark:text-white">{theme.author}</span>
              )}
            </p>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-2">
              {theme.description || "A clean, responsive storefront theme built for fast conversions and modern branding."}
            </p>
          </div>

          {/* Price & Install CTA Box */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex flex-col justify-between min-w-[260px] space-y-4">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                License Pricing
              </span>
              <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1">
                {isFree ? "Free" : `$${theme.price?.toFixed(2)}`}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isFree ? "Unlimited usage on your store" : "One-time store license"}
              </span>
            </div>

            <div className="space-y-2">
              <a
                href={installUrl}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#960DF2] hover:bg-[#780AC2] transition-colors shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🚀</span>
                <span>Install to Admin</span>
              </a>
              <a
                href="#live-preview"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>👁️</span>
                <span>Test Live Mockup</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Screenshot / Preview Gallery */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Theme Preview &amp; Gallery
        </h2>

        {theme.previewUrl ? (
          <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md bg-zinc-100 dark:bg-zinc-800">
            <img
              src={theme.previewUrl}
              alt={`${theme.name} Preview`}
              className="w-full h-full object-cover object-top"
            />
          </div>
        ) : null}

        {screenshots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {screenshots.map((sUrl, idx) => (
              <div
                key={idx}
                className="aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-100 dark:bg-zinc-800"
              >
                <img
                  src={sUrl}
                  alt={`${theme.name} Screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Design System & Token Inspector */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Palette Display */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🎨</span>
            <span>Color Palette &amp; Accents</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Primary", color: primaryColor },
              { label: "Secondary", color: secondaryColor },
              { label: "Accent", color: accentColor },
              { label: "Surface", color: surfaceColor },
              { label: "Background", color: bgColor },
              { label: "Text", color: textColor },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center gap-3"
              >
                <span
                  className="h-7 w-7 rounded-xl border border-black/10 shadow-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {item.label}
                  </span>
                  <span className="block text-[10px] font-mono text-zinc-400 truncate">
                    {item.color}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography & Layout Tokens */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🔤</span>
            <span>Typography &amp; Layout Tokens</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Heading Font:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {config.typography?.headingFont || "Inter, sans-serif"}
              </span>
            </div>
            <div className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Body Font:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {config.typography?.bodyFont || "Inter, sans-serif"}
              </span>
            </div>
            <div className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Border Radius:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {config.layout?.borderRadius || "12px"}
              </span>
            </div>
            <div className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Header Style:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white capitalize">
                {config.layout?.headerStyle || "Default Minimal"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Mockup Section */}
      <section id="live-preview" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Interactive Storefront Mockup
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Simulate how this theme looks on desktop, tablet, and mobile with realistic storefront data.
            </p>
          </div>
        </div>

        <div className="h-[750px] w-full">
          <ThemeMockupPreview theme={theme} isModal={false} />
        </div>
      </section>

      {/* Changelog Section */}
      {theme.changelog && (
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">
            Release Changelog
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed">
            {theme.changelog}
          </p>
        </section>
      )}

      {/* Related Themes */}
      {relatedThemes.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Similar Themes in {theme.category || "Storefront"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedThemes.map((rTheme) => (
              <ThemeCard key={rTheme.id} theme={rTheme} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

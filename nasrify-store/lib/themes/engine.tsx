import React from "react";
import { ThemeConfig, ThemeSection, StoreData } from "./types";

import AnnouncementBar from "@/components/themes/sections/AnnouncementBar";
import Header from "@/components/themes/sections/Header";
import Hero from "@/components/themes/sections/Hero";
import ProductGrid from "@/components/themes/sections/ProductGrid";
import ProductCarousel from "@/components/themes/sections/ProductCarousel";
import Categories from "@/components/themes/sections/Categories";
import Testimonials from "@/components/themes/sections/Testimonials";
import Newsletter from "@/components/themes/sections/Newsletter";
import Banner from "@/components/themes/sections/Banner";
import ImageText from "@/components/themes/sections/ImageText";
import FAQ from "@/components/themes/sections/FAQ";
import Footer from "@/components/themes/sections/Footer";

// 13 New Page Sections
import ProductGallery from "@/components/themes/sections/ProductGallery";
import ProductInfo from "@/components/themes/sections/ProductInfo";
import ProductTabs from "@/components/themes/sections/ProductTabs";
import ProductReviewsSection from "@/components/themes/sections/ProductReviewsSection";
import ProductRelated from "@/components/themes/sections/ProductRelated";
import CategoryHeader from "@/components/themes/sections/CategoryHeader";
import CategoryFilters from "@/components/themes/sections/CategoryFilters";
import CategoryGrid from "@/components/themes/sections/CategoryGrid";
import CartPageLayout from "@/components/themes/sections/CartPageLayout";
import CheckoutPageLayout from "@/components/themes/sections/CheckoutPageLayout";
import AccountDashboard from "@/components/themes/sections/AccountDashboard";
import PageHeader from "@/components/themes/sections/PageHeader";
import PageContent from "@/components/themes/sections/PageContent";

import { DEFAULT_THEME } from "./default-theme";
import { generateAdvancedCSS } from "./section-css-generator";

// 60-second theme advanced CSS cache for performance (<10ms CPU target)
const advancedCSSCache = new Map<string, { css: string; expiry: number }>();

export function invalidateThemeAdvancedCSSCache(): void {
  advancedCSSCache.clear();
}

function getThemeAdvancedCSS(sections?: ThemeSection[], themeId: string = "default"): string {
  if (!sections || !Array.isArray(sections)) return "";
  const now = Date.now();
  const hasAdvanced = sections.some((s) => Boolean(s.settings?._advanced));
  if (!hasAdvanced) return "";

  // Fingerprint based on sections with _advanced
  const advancedSummary = sections
    .filter((s) => Boolean(s.settings?._advanced))
    .map((s) => `${s.id}:${JSON.stringify(s.settings?._advanced)}`)
    .join(";");
  const cacheKey = `${themeId}_${advancedSummary}`;

  const cached = advancedCSSCache.get(cacheKey);
  if (cached && cached.expiry > now) {
    return cached.css;
  }

  try {
    const sectionsMap: Record<string, any> = {};
    sections.forEach((s) => {
      if (s.settings?._advanced) {
        sectionsMap[s.id] = { settings: s.settings };
      }
    });

    const css = generateAdvancedCSS({ sections: sectionsMap });
    advancedCSSCache.set(cacheKey, { css, expiry: now + 60 * 1000 });
    return css;
  } catch {
    return "";
  }
}

/**
 * High-performance Theme Rendering Engine (<10ms CPU target)
 * Iterates through enabled sections and dynamically mounts React section components.
 * Catches errors per section so a malformed section never crashes the entire page.
 */
export function renderTheme(theme: ThemeConfig, storeData: StoreData): React.ReactNode {
  if (!theme || !theme.sections || !Array.isArray(theme.sections)) {
    return null;
  }

  const themeId = (theme as any)?.id || theme?.name || "default";
  const advancedCSS = getThemeAdvancedCSS(theme.sections, themeId);
  const visibilityBaseCSS = `
    @media (min-width: 1025px) { .hide-desktop { display: none !important; } }
    @media (min-width: 768px) and (max-width: 1024px) { .hide-tablet { display: none !important; } }
    @media (max-width: 767px) { .hide-mobile { display: none !important; } }
  `;

  return (
    <>
      <style
        id="theme-visibility-css"
        dangerouslySetInnerHTML={{ __html: visibilityBaseCSS }}
      />
      {advancedCSS && (
        <style
          id="theme-advanced-css"
          dangerouslySetInnerHTML={{ __html: advancedCSS }}
        />
      )}
      {theme.sections
        .filter((s) => s.enabled)
        .map((section) => renderSection(section, theme.settings, storeData))}
    </>
  );
}

/**
 * Render a page-specific theme layout defined in theme.page_defaults[pageType].
 * Used by product, category, cart, checkout, account, and cms pages.
 * Falls back to DEFAULT_THEME.page_defaults[pageType] if custom theme doesn't define it.
 */
export function renderPageTheme(
  theme: ThemeConfig,
  pageType: string,
  storeData: StoreData
): React.ReactNode {
  const activeTheme = theme || DEFAULT_THEME;
  const pageSections =
    activeTheme.page_defaults?.[pageType] || DEFAULT_THEME.page_defaults?.[pageType];

  if (!pageSections || !Array.isArray(pageSections)) {
    return null;
  }

  const settings = activeTheme.settings || DEFAULT_THEME.settings;
  const themeId = (activeTheme as any)?.id || activeTheme?.name || "default";
  const advancedCSS = getThemeAdvancedCSS(pageSections, themeId);

  return (
    <>
      {advancedCSS && (
        <style
          id="theme-advanced-page-css"
          dangerouslySetInnerHTML={{ __html: advancedCSS }}
        />
      )}
      {pageSections
        .filter((s) => s.enabled !== false)
        .map((section) => renderSection(section, settings, storeData))}
    </>
  );
}

export function renderSection(
  section: ThemeSection,
  themeSettings: ThemeConfig["settings"],
  storeData: StoreData
): React.ReactNode {
  try {
    const props = {
      id: section.id,
      variant: section.variant,
      settings: section.settings || {},
      themeSettings,
      storeData,
    };

    let element: React.ReactNode = null;

    switch (section.type) {
      // 12 Original Sections
      case "announcement":
      case "announcement_bar":
        element = <AnnouncementBar key={section.id} {...props} />;
        break;
      case "header":
        element = <Header key={section.id} {...props} />;
        break;
      case "hero":
        element = <Hero key={section.id} {...props} />;
        break;
      case "product_grid":
        element = <ProductGrid key={section.id} {...props} />;
        break;
      case "product_carousel":
        element = <ProductCarousel key={section.id} {...props} />;
        break;
      case "categories":
        element = <Categories key={section.id} {...props} />;
        break;
      case "testimonials":
        element = <Testimonials key={section.id} {...props} />;
        break;
      case "newsletter":
        element = <Newsletter key={section.id} {...props} />;
        break;
      case "banner":
        element = <Banner key={section.id} {...props} />;
        break;
      case "image_text":
        element = <ImageText key={section.id} {...props} />;
        break;
      case "faq":
        element = <FAQ key={section.id} {...props} />;
        break;
      case "footer":
        element = <Footer key={section.id} {...props} />;
        break;

      // 13 New Page Sections
      case "product_gallery":
        element = <ProductGallery key={section.id} {...props} />;
        break;
      case "product_info":
        element = <ProductInfo key={section.id} {...props} />;
        break;
      case "product_tabs":
        element = <ProductTabs key={section.id} {...props} />;
        break;
      case "product_reviews_section":
        element = <ProductReviewsSection key={section.id} {...props} />;
        break;
      case "product_related":
        element = <ProductRelated key={section.id} {...props} />;
        break;
      case "category_header":
        element = <CategoryHeader key={section.id} {...props} />;
        break;
      case "category_filters":
        element = <CategoryFilters key={section.id} {...props} />;
        break;
      case "category_grid":
        element = <CategoryGrid key={section.id} {...props} />;
        break;
      case "cart_page_layout":
        element = <CartPageLayout key={section.id} {...props} />;
        break;
      case "checkout_page_layout":
        element = <CheckoutPageLayout key={section.id} {...props} />;
        break;
      case "account_dashboard":
        element = <AccountDashboard key={section.id} {...props} />;
        break;
      case "page_header":
        element = <PageHeader key={section.id} {...props} />;
        break;
      case "page_content":
        element = <PageContent key={section.id} {...props} />;
        break;

      default:
        console.warn(`[Themes Engine] Unknown section type skipped: ${section.type}`);
        return null;
    }

    if (!element) return null;

    const adv = section.settings?._advanced;
    const customClasses = adv?.advanced?.layout?.cssClasses ? ` ${adv.advanced.layout.cssClasses}` : "";
    const customId = adv?.advanced?.layout?.cssId || undefined;

    const visibilityClasses: string[] = [];
    if (section.visibility) {
      if (section.visibility.desktop === false) visibilityClasses.push("hide-desktop");
      if (section.visibility.tablet === false) visibilityClasses.push("hide-tablet");
      if (section.visibility.mobile === false) visibilityClasses.push("hide-mobile");
    }
    const visClassStr = visibilityClasses.length > 0 ? ` ${visibilityClasses.join(" ")}` : "";

    return (
      <div
        key={section.id}
        id={customId}
        data-section-id={section.id}
        data-section-type={section.type}
        className={`section-${section.id}${customClasses}${visClassStr}`}
      >
        {element}
      </div>
    );
  } catch (err) {
    console.error(
      `[Themes Engine] Failed to render section ${section.id} (${section.type}):`,
      err
    );
    return null;
  }
}

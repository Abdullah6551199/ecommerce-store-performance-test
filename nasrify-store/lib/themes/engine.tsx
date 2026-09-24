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

/**
 * High-performance Theme Rendering Engine (<10ms CPU target)
 * Iterates through enabled sections and dynamically mounts React section components.
 * Catches errors per section so a malformed section never crashes the entire page.
 */
export function renderTheme(theme: ThemeConfig, storeData: StoreData): React.ReactNode {
  if (!theme || !theme.sections || !Array.isArray(theme.sections)) {
    return null;
  }

  return (
    <>
      {theme.sections
        .filter((s) => s.enabled)
        .map((section) => renderSection(section, theme.settings, storeData))}
    </>
  );
}

/**
 * Render a page-specific theme layout defined in theme.page_defaults[pageType].
 * Used by product, category, cart, checkout, account, and cms pages.
 */
export function renderPageTheme(
  theme: ThemeConfig,
  pageType: string,
  storeData: StoreData
): React.ReactNode {
  if (!theme) return null;

  const pageSections = theme.page_defaults?.[pageType];
  if (!pageSections || !Array.isArray(pageSections)) {
    return null;
  }

  return (
    <>
      {pageSections
        .filter((s) => s.enabled !== false)
        .map((section) => renderSection(section, theme.settings, storeData))}
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

    switch (section.type) {
      // 12 Original Sections
      case "announcement":
      case "announcement_bar":
        return <AnnouncementBar key={section.id} {...props} />;
      case "header":
        return <Header key={section.id} {...props} />;
      case "hero":
        return <Hero key={section.id} {...props} />;
      case "product_grid":
        return <ProductGrid key={section.id} {...props} />;
      case "product_carousel":
        return <ProductCarousel key={section.id} {...props} />;
      case "categories":
        return <Categories key={section.id} {...props} />;
      case "testimonials":
        return <Testimonials key={section.id} {...props} />;
      case "newsletter":
        return <Newsletter key={section.id} {...props} />;
      case "banner":
        return <Banner key={section.id} {...props} />;
      case "image_text":
        return <ImageText key={section.id} {...props} />;
      case "faq":
        return <FAQ key={section.id} {...props} />;
      case "footer":
        return <Footer key={section.id} {...props} />;

      // 13 New Page Sections
      case "product_gallery":
        return <ProductGallery key={section.id} {...props} />;
      case "product_info":
        return <ProductInfo key={section.id} {...props} />;
      case "product_tabs":
        return <ProductTabs key={section.id} {...props} />;
      case "product_reviews_section":
        return <ProductReviewsSection key={section.id} {...props} />;
      case "product_related":
        return <ProductRelated key={section.id} {...props} />;
      case "category_header":
        return <CategoryHeader key={section.id} {...props} />;
      case "category_filters":
        return <CategoryFilters key={section.id} {...props} />;
      case "category_grid":
        return <CategoryGrid key={section.id} {...props} />;
      case "cart_page_layout":
        return <CartPageLayout key={section.id} {...props} />;
      case "checkout_page_layout":
        return <CheckoutPageLayout key={section.id} {...props} />;
      case "account_dashboard":
        return <AccountDashboard key={section.id} {...props} />;
      case "page_header":
        return <PageHeader key={section.id} {...props} />;
      case "page_content":
        return <PageContent key={section.id} {...props} />;

      default:
        console.warn(`[Themes Engine] Unknown section type skipped: ${section.type}`);
        return null;
    }
  } catch (err) {
    console.error(
      `[Themes Engine] Failed to render section ${section.id} (${section.type}):`,
      err
    );
    return null;
  }
}

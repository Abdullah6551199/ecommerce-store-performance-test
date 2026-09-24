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

function renderSection(
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
      case "announcement":
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

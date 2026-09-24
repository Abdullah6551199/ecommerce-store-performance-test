"use client";

import React from "react";
import AnnouncementSettings from "./sections/AnnouncementSettings";
import HeaderSettings from "./sections/HeaderSettings";
import HeroSettings from "./sections/HeroSettings";
import ProductGridSettings from "./sections/ProductGridSettings";
import ProductCarouselSettings from "./sections/ProductCarouselSettings";
import CategoriesSettings from "./sections/CategoriesSettings";
import TestimonialsSettings from "./sections/TestimonialsSettings";
import { NewsletterSettings } from "./sections/NewsletterSettings";
import { BannerSettings } from "./sections/BannerSettings";
import { ImageTextSettings } from "./sections/ImageTextSettings";
import { FAQSettings } from "./sections/FAQSettings";
import { FooterSettings } from "./sections/FooterSettings";

interface SectionSettingsProps {
  section: {
    id: string;
    type: string;
    variant?: string;
    name?: string;
    settings?: Record<string, any>;
  };
  onChange: (patch: Record<string, any>) => void;
}

export function SectionSettings({ section, onChange }: SectionSettingsProps) {
  const settings = section.settings || {};
  const handleVariantChange = (variant: string) => {
    onChange({ variant });
  };

  switch (section.type) {
    case "announcement_bar":
    case "announcement":
      return (
        <AnnouncementSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    case "header":
      return (
        <HeaderSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    case "hero":
      return (
        <HeroSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    case "product_grid":
      return (
        <ProductGridSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    case "product_carousel":
      return (
        <ProductCarouselSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    case "categories":
      return (
        <CategoriesSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    case "testimonials":
      return (
        <TestimonialsSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    case "newsletter":
      return <NewsletterSettings settings={settings} onChange={onChange} />;
    case "banner":
      return <BannerSettings settings={settings} onChange={onChange} />;
    case "image_text":
      return <ImageTextSettings settings={settings} onChange={onChange} />;
    case "faq":
      return <FAQSettings settings={settings} onChange={onChange} />;
    case "footer":
      return <FooterSettings settings={settings} onChange={onChange} />;
    default:
      return (
        <div className="p-4 rounded border border-amber-800/50 bg-amber-950/20 text-amber-300 text-xs">
          Settings for section type <code>{section.type}</code> are not available in Basic mode.
        </div>
      );
  }
}

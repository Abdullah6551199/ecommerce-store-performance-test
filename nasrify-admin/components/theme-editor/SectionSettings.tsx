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
import ProductInfoSettings from "./sections/ProductInfoSettings";

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

const DEFAULT_SECTION_SETTINGS: Record<string, Record<string, any>> = {
  product_gallery: { layout: "carousel", thumbnails_position: "bottom", zoom: "off" },
  product_tabs: { default_tab: "description" },
  product_reviews_section: { heading: "Customer Reviews", show_summary: true, show_form: true },
  product_related: { heading: "Related Products", max_products: 4, columns: 4 },
  category_header: { show_breadcrumb: true, show_description: true, layout: "simple" },
  category_filters: { show_price_filter: true, show_brand_filter: true, show_availability_filter: true },
  category_grid: { columns: 3, per_page: 9, show_pagination: true },
  cart_page_layout: { show_coupon: true, show_estimated_shipping: true, show_recommendations: true },
  checkout_page_layout: { show_order_summary: true, allow_guest_checkout: true },
  account_dashboard: { show_wishlist: true, show_orders: true },
  page_header: { show_breadcrumb: true, alignment: "center" },
  page_content: { max_width: "max-w-4xl", padding_y: "py-6" },
};

function GenericSectionSettings({
  section,
  onChange,
}: {
  section: SectionSettingsProps["section"];
  onChange: (patch: Record<string, any>) => void;
}) {
  const defaults = DEFAULT_SECTION_SETTINGS[section.type] || {};
  const settings = { ...defaults, ...(section.settings || {}) };

  const handleFieldChange = (key: string, value: any) => {
    onChange({
      settings: {
        ...(section.settings || {}),
        [key]: value,
      },
    });
  };

  const keys = Object.keys(settings).filter((k) => k !== "_advanced");

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h4 className="font-semibold text-slate-200 capitalize">
          {section.type.replace(/_/g, " ")} Settings
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Configure section properties and display options.
        </p>
      </div>

      {keys.length === 0 ? (
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-800/40 text-slate-400 text-xs">
          This section uses default page presets. Additional customizable properties will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => {
            const val = settings[key];
            const label = key.replace(/_/g, " ");

            if (typeof val === "boolean") {
              return (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => handleFieldChange(key, e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span className="capitalize">{label}</span>
                </label>
              );
            }

            if (typeof val === "number") {
              return (
                <div key={key} className="space-y-1">
                  <label className="text-slate-400 capitalize">{label}</label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleFieldChange(key, Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs"
                  />
                </div>
              );
            }

            if (typeof val === "string") {
              return (
                <div key={key} className="space-y-1">
                  <label className="text-slate-400 capitalize">{label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs"
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
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
    case "product_info":
      return (
        <ProductInfoSettings
          settings={settings}
          variant={section.variant}
          onChange={onChange}
          onVariantChange={handleVariantChange}
        />
      );
    default:
      return <GenericSectionSettings section={section} onChange={onChange} />;
  }
}

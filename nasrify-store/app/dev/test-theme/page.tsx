import React from "react";
import { renderPageTheme, renderSection } from "@/lib/themes/engine";
import { DEFAULT_THEME } from "@/lib/themes/default-theme";

export const dynamic = "force-dynamic";

export default function TestThemePage() {
  const mockProductData = {
    product: {
      id: "test-prod-1",
      name: "Minimalist Ergonomic Workspace Chair",
      brand: "Nasrify Design",
      sku: "NAS-TEST-001",
      price: 249.0,
      salePrice: 199.0,
      rating: 4.8,
      reviewsCount: 42,
      inStock: true,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      ],
      description:
        "Engineered for ultimate daily focus and ergonomic excellence with breathable mesh, brushed aluminum frame, and calibrated lumbar feedback.",
      variants: [
        { id: "v1", name: "Matte Black" },
        { id: "v2", name: "Slate Grey" },
      ],
    },
    products: [
      {
        id: "rel-1",
        name: "Ergonomic Desk Mat",
        price: 49.0,
        salePrice: 39.0,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop",
        rating: 4.9,
      },
      {
        id: "rel-2",
        name: "Wireless Charging Dock",
        price: 89.0,
        imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800&auto=format&fit=crop",
        rating: 4.7,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
        <strong>Stage 42.8b Theme Test Page:</strong> Rendering page_defaults for &apos;product&apos; using renderPageTheme engine.
      </div>

      {/* Two column layout for Gallery + Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
        {renderSection(
          {
            id: "test-gallery",
            type: "product_gallery",
            variant: "classic",
            enabled: true,
            settings: { layout: "carousel", thumbnails_position: "bottom", zoom: "on" },
          },
          DEFAULT_THEME.settings,
          mockProductData
        )}

        {renderSection(
          {
            id: "test-info",
            type: "product_info",
            variant: "standard",
            enabled: true,
            settings: {
              show_sku: true,
              show_brand: true,
              show_rating: true,
              show_compare: true,
              show_wishlist: true,
            },
          },
          DEFAULT_THEME.settings,
          mockProductData
        )}
      </div>

      {/* Render Product Tabs & Related */}
      {renderSection(
        {
          id: "test-tabs",
          type: "product_tabs",
          variant: "standard",
          enabled: true,
          settings: {},
        },
        DEFAULT_THEME.settings,
        mockProductData
      )}

      {renderSection(
        {
          id: "test-reviews",
          type: "product_reviews_section",
          variant: "standard",
          enabled: true,
          settings: { heading: "Customer Reviews" },
        },
        DEFAULT_THEME.settings,
        mockProductData
      )}

      {renderSection(
        {
          id: "test-related",
          type: "product_related",
          variant: "grid",
          enabled: true,
          settings: { columns: 4 },
        },
        DEFAULT_THEME.settings,
        mockProductData
      )}
    </div>
  );
}

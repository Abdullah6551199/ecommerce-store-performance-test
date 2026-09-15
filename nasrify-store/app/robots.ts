import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Dynamic robots.txt generation
 * - Allows all crawlers for public pages
 * - Disallows /admin and /api routes
 * - Points to dynamic /sitemap.xml
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

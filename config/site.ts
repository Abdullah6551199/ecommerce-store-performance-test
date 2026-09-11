export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github?: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "ApexStore",
  description: "Next-generation high-performance athletic apparel and footwear engineered for peak human performance.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ecommerce-store-perf-test.zia291930.workers.dev",
  ogImage: "/og.png",
  links: {},
};

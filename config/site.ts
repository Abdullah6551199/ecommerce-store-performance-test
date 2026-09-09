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
  name: "Dynamic Store",
  description: "Next-generation dynamic e-commerce platform built with Next.js and Cloudflare Workers.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {},
};

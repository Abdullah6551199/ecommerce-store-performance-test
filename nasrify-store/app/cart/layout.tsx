import type { Metadata } from "next";
import { getAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review and manage items in your shopping cart before proceeding to checkout.",
  alternates: {
    canonical: getAbsoluteUrl("/cart"),
  },
  openGraph: {
    title: "Shopping Cart | Apex Store",
    description: "Review and manage items in your shopping cart before proceeding to checkout.",
    url: getAbsoluteUrl("/cart"),
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}

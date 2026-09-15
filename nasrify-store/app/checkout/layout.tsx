import type { Metadata } from "next";
import { getAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Complete your order with instant order confirmation and express shipping.",
  alternates: {
    canonical: getAbsoluteUrl("/checkout"),
  },
  openGraph: {
    title: "Secure Checkout | Apex Store",
    description: "Complete your order with instant order confirmation and express shipping.",
    url: getAbsoluteUrl("/checkout"),
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

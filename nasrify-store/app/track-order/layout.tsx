import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Track Your Order | ApexStore",
  description: "Track your shipment status in real time. Enter your Order ID or courier tracking code to view the live fulfillment timeline.",
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}

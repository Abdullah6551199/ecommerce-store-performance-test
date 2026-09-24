"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface StorefrontLayoutWrapperProps {
  children: React.ReactNode;
  legacyHeader: React.ReactNode;
  legacyFooter: React.ReactNode;
}

export default function StorefrontLayoutWrapper({
  children,
  legacyHeader,
  legacyFooter,
}: StorefrontLayoutWrapperProps) {
  const pathname = usePathname();
  const isHomepage = !pathname || pathname === "/" || pathname === "";

  if (isHomepage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      {legacyHeader}
      <main className="flex-1">{children}</main>
      {legacyFooter}
    </>
  );
}

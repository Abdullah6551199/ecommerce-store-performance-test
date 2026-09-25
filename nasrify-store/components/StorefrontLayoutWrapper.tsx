"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ThemeAnimationObserver } from "./themes/ThemeAnimationObserver";

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

  return (
    <>
      <ThemeAnimationObserver />
      {isHomepage ? (
        <main className="flex-1">{children}</main>
      ) : (
        <>
          {legacyHeader}
          <main className="flex-1">{children}</main>
          {legacyFooter}
        </>
      )}
    </>
  );
}

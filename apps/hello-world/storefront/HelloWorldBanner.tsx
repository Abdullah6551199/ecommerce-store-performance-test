"use client";

import React from "react";

export default function HelloWorldBanner(): React.JSX.Element {
  return (
    <div className="w-full bg-gradient-to-r from-purple-900/40 via-[#1EA855]/20 to-[#25D366]/40 border-y border-purple-500/20 py-2.5 px-4 text-center">
      <p className="text-xs sm:text-sm font-medium text-purple-200">
        ✨ Welcome to our storefront! Powered by the Nasrify Apps Framework.
      </p>
    </div>
  );
}

import React from "react";

export interface TrustItem {
  icon: "shipping" | "return" | "secure" | "support";
  title: string;
  description: string;
}

interface TrustBarProps {
  items?: TrustItem[];
}

const DEFAULT_TRUST_ITEMS: TrustItem[] = [
  {
    icon: "shipping",
    title: "Free Worldwide Shipping",
    description: "On all orders over $50 with live tracking",
  },
  {
    icon: "return",
    title: "30-Day Return Policy",
    description: "Hassle-free exchange & money back guarantee",
  },
  {
    icon: "secure",
    title: "Secure Payment",
    description: "256-bit encrypted checkout protection",
  },
  {
    icon: "support",
    title: "24/7 Customer Support",
    description: "Dedicated concierge team ready to help",
  },
];

export default function TrustBar({ items = DEFAULT_TRUST_ITEMS }: TrustBarProps): React.JSX.Element {
  const activeItems = items && items.length > 0 ? items : DEFAULT_TRUST_ITEMS;

  const renderIcon = (icon: TrustItem["icon"]) => {
    switch (icon) {
      case "shipping":
        return (
          <svg className="h-6 w-6 text-[#25D366] dark:text-[#1EA855]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case "return":
        return (
          <svg className="h-6 w-6 text-[#25D366] dark:text-[#1EA855]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "secure":
        return (
          <svg className="h-6 w-6 text-[#25D366] dark:text-[#1EA855]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "support":
      default:
        return (
          <svg className="h-6 w-6 text-[#25D366] dark:text-[#1EA855]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
    }
  };

  return (
    <section className="rounded-2xl border border-[#E4E4E7]/80 dark:border-zinc-800/60 bg-[#F4F4F5] dark:bg-[#18181B]/20 p-5 sm:p-8 backdrop-blur-sm shadow-sm transition-colors">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {activeItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#15803D] border border-[#E4E4E7] dark:border-zinc-700/60 shadow-sm">
              {renderIcon(item.icon)}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#18181B] dark:text-white leading-tight">
                {item.title}
              </h4>
              <p className="text-xs text-[#15803D]/80 dark:text-zinc-300/70 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { renderRich } from "@/lib/themes/render-rich";

interface PricingTableProps {
  settings?: Record<string, any>;
  variant?: string;
}

export default function PricingTable({
  settings = {},
  variant = "classic_3col",
}: PricingTableProps) {
  const currentVariant = variant || settings.variant || "classic_3col";

  const heading =
    settings.heading || "Transparent Pricing Designed for Scale";
  const subheading =
    settings.subheading ||
    "Select the membership tier that fits your bespoke lifestyle needs.";
  const plans =
    Array.isArray(settings.plans) && settings.plans.length > 0
      ? settings.plans
      : [
          {
            name: "Essential",
            price: "$29",
            period: "/mo",
            features:
              "Access to curated collection\nComplimentary standard delivery\nStandard email support",
            cta_text: "Get Started",
            cta_link: "/checkout",
            highlighted: false,
          },
          {
            name: "Privilege",
            price: "$79",
            period: "/mo",
            features:
              "Full catalog VIP access\nPriority express shipping\nConcierge 24/7 personal shopper\nEarly drops preview",
            cta_text: "Join Privilege",
            cta_link: "/checkout",
            highlighted: true,
          },
          {
            name: "Atelier Bespoke",
            price: "$199",
            period: "/mo",
            features:
              "Custom bespoke garment tailoring\nPrivate studio consultations\nUnlimited complimentary courier returns\nExclusive private events invitations",
            cta_text: "Contact Atelier",
            cta_link: "/contact",
            highlighted: false,
          },
        ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-14 text-center max-w-3xl mx-auto space-y-3">
        <h2
          data-editable="heading"
          className="text-3xl sm:text-5xl font-black tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
          dangerouslySetInnerHTML={renderRich(heading)}
        />
        <div
          data-editable="subheading"
          className="text-base sm:text-lg text-gray-400 font-[family-name:var(--theme-font-body)]"
          dangerouslySetInnerHTML={renderRich(subheading)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan: any, idx: number) => {
          const isHighlighted = Boolean(plan.highlighted);
          const featuresList =
            typeof plan.features === "string"
              ? plan.features.split("\n").filter((f: string) => f.trim().length > 0)
              : [];

          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                isHighlighted
                  ? "bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 md:-translate-y-2"
                  : "bg-slate-900/40 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {isHighlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-gray-400">
                      {plan.period || "/mo"}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-800 text-sm text-gray-300">
                  {featuresList.map((feature: string, fIdx: number) => (
                    <li key={fIdx} className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.cta_link || "/checkout"}
                  className={`w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl font-bold transition-all ${
                    isHighlighted
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {plan.cta_text || "Get Started"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

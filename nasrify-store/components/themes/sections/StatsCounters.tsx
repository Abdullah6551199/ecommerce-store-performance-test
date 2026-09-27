"use client";

import React, { useEffect, useState, useRef } from "react";
import { renderRich } from "@/lib/themes/render-rich";

interface StatsCountersProps {
  settings?: Record<string, any>;
  variant?: string;
}

export default function StatsCounters({
  settings = {},
  variant = "dark",
}: StatsCountersProps) {
  const currentVariant = variant || settings.variant || "dark";

  const heading =
    settings.heading || "Proven Excellence by the Numbers";
  const stats =
    Array.isArray(settings.stats) && settings.stats.length > 0
      ? settings.stats
      : [
          { value: "150", suffix: "K+", label: "Verified Global Orders", icon: "📦" },
          { value: "99", suffix: ".4%", label: "Positive Shopper Rating", icon: "⭐" },
          { value: "24", suffix: "/7", label: "Dedicated Concierge Support", icon: "💬" },
          { value: "45", suffix: "+", label: "Global Cities Served", icon: "🌍" },
        ];

  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const bgStyles =
    currentVariant === "light"
      ? "bg-slate-100 text-slate-900 border-y border-slate-200"
      : currentVariant === "gradient"
      ? "bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border-y border-emerald-500/20"
      : "bg-slate-950 text-white border-y border-slate-800";

  return (
    <section ref={containerRef} className={`py-16 px-4 sm:px-6 lg:px-8 ${bgStyles}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {heading && (
          <div className="text-center max-w-2xl mx-auto">
            <h2
              data-editable="heading"
              className="text-2xl sm:text-4xl font-bold tracking-tight font-[family-name:var(--theme-font-heading)]"
              dangerouslySetInnerHTML={renderRich(heading)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat: any, idx: number) => (
            <div key={idx} className="space-y-2 group">
              <div className="text-3xl mb-1">{stat.icon || "✨"}</div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-400 font-mono">
                {hasAnimated ? stat.value : "0"}
                <span className="text-2xl sm:text-3xl font-semibold text-emerald-300">
                  {stat.suffix}
                </span>
              </div>
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

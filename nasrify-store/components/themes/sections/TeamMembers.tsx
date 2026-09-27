import React from "react";
import { renderRich } from "@/lib/themes/render-rich";

interface TeamMembersProps {
  settings?: Record<string, any>;
  variant?: string;
}

export default function TeamMembers({
  settings = {},
  variant = "grid",
}: TeamMembersProps) {
  const currentVariant = variant || settings.variant || "grid";

  const heading = settings.heading || "Meet the Artisans & Creators";
  const subheading =
    settings.subheading ||
    "Passionate craftspeople devoted to precision and aesthetic mastery.";
  const members =
    Array.isArray(settings.members) && settings.members.length > 0
      ? settings.members
      : [
          {
            name: "Alexander Vance",
            role: "Founder & Creative Director",
            image:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
            bio: "Over 12 years directing luxury apparel and sustainable material architecture.",
            social_links: "https://twitter.com",
          },
          {
            name: "Elena Rostova",
            role: "Head of Industrial Design",
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
            bio: "Award-winning minimalist product designer focusing on ergonomic tactile form.",
            social_links: "https://instagram.com",
          },
          {
            name: "Marcus Chen",
            role: "Chief Technology Officer",
            image:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
            bio: "Pioneering edge computing, ultra-fast interfaces, and distributed headless platforms.",
            social_links: "https://github.com",
          },
        ];

  // Variant 3: Horizontal Split Rows
  if (currentVariant === "horizontal") {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-12 text-center max-w-3xl mx-auto space-y-2">
          <h2
            data-editable="heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
            dangerouslySetInnerHTML={renderRich(heading)}
          />
          <div
            data-editable="subheading"
            className="text-base text-gray-400 font-[family-name:var(--theme-font-body)]"
            dangerouslySetInnerHTML={renderRich(subheading)}
          />
        </div>

        <div className="space-y-6">
          {members.map((m: any, idx: number) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/40"
            >
              <img
                src={
                  m.image ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                }
                alt={m.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-emerald-500/30 shrink-0"
              />
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div>
                  <h3 className="text-xl font-bold text-white">{m.name}</h3>
                  <p className="text-sm font-semibold text-emerald-400">
                    {m.role}
                  </p>
                </div>
                <div
                  className="text-sm text-gray-400 leading-relaxed max-w-2xl"
                  dangerouslySetInnerHTML={renderRich(m.bio)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Variant 1 & 2: Grid & Carousel
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center max-w-3xl mx-auto space-y-2">
        <h2
          data-editable="heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-[family-name:var(--theme-font-heading)]"
          dangerouslySetInnerHTML={renderRich(heading)}
        />
        <div
          data-editable="subheading"
          className="text-base text-gray-400 font-[family-name:var(--theme-font-body)]"
          dangerouslySetInnerHTML={renderRich(subheading)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((m: any, idx: number) => (
          <div
            key={idx}
            className="group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all p-6 text-center space-y-4"
          >
            <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors">
              <img
                src={
                  m.image ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                }
                alt={m.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{m.name}</h3>
              <p className="text-sm font-semibold text-emerald-400">{m.role}</p>
            </div>
            <div
              className="text-xs text-gray-400 leading-relaxed"
              dangerouslySetInnerHTML={renderRich(m.bio)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

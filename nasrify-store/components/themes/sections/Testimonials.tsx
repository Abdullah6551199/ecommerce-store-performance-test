import React from "react";
import Image from "next/image";
import { SectionProps } from "@/lib/themes/types";

export interface TestimonialItem {
  text: string;
  author: string;
  role?: string;
  avatar?: string;
}

export interface TestimonialsSettings {
  heading?: string;
  items?: TestimonialItem[];
  layout?: "grid" | "slider" | "quote" | "cards";
}

export default function Testimonials({
  variant = "cards",
  settings = {},
  themeSettings,
}: SectionProps<TestimonialsSettings>) {
  const heading = settings.heading || "What Our Customers Say";
  const items = settings.items?.length
    ? settings.items
    : [
        {
          text: "The build quality and attention to detail exceeded my expectations. Outstanding shopping experience from start to finish!",
          author: "Sarah Jenkins",
          role: "Verified Buyer",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        },
        {
          text: "Super fast delivery and the products feel extraordinarily premium. Easily the best online store I've encountered.",
          author: "Michael Vance",
          role: "Verified Buyer",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        },
        {
          text: "Minimalist aesthetics paired with exceptional durability. Nasrify sets the bar for modern e-commerce.",
          author: "Elena Rostova",
          role: "Design Director",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        },
      ];

  if (variant === "quote") {
    const single = items[0];
    return (
      <section className="py-16 sm:py-24 bg-[var(--theme-surface,#F4F4F5)] px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-4xl text-[var(--theme-accent,#2563EB)] font-serif">“</div>
          <p className="text-xl sm:text-2xl font-medium text-[var(--theme-text,#18181B)] italic font-[family-name:var(--theme-font-body)]">
            {single.text}
          </p>
          <div className="pt-2 flex flex-col items-center">
            {single.avatar && (
              <div className="relative w-14 h-14 rounded-full overflow-hidden mb-2 shadow-sm">
                <Image src={single.avatar} alt={single.author} fill className="object-cover" sizes="56px" />
              </div>
            )}
            <h4 className="font-bold text-base text-[var(--theme-text,#18181B)]">{single.author}</h4>
            {single.role && <p className="text-xs text-[var(--theme-text-muted,#71717A)]">{single.role}</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-6 sm:p-8 rounded-[var(--theme-radius,8px)] border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] shadow-xs hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
                {"★★★★★"}
              </div>
              <p className="text-sm sm:text-base text-[var(--theme-text,#18181B)] leading-relaxed italic">
                “{item.text}”
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-[var(--theme-border,#E4E4E7)]">
              {item.avatar && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <Image src={item.avatar} alt={item.author} fill className="object-cover" sizes="40px" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm text-[var(--theme-text,#18181B)]">
                  {item.author}
                </h4>
                {item.role && (
                  <p className="text-xs text-[var(--theme-text-muted,#71717A)]">
                    {item.role}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import React from "react";

export interface BrandLogo {
  name: string;
  logoText?: string;
  logoUrl?: string;
}

interface BrandLogosRowProps {
  heading?: string;
  logos?: BrandLogo[];
}

const DEFAULT_LOGOS: BrandLogo[] = [
  { name: "Vanguard Sport", logoText: "VANGUARD" },
  { name: "Apex Athletics", logoText: "APEX//LAB" },
  { name: "Kinetics Lab", logoText: "KINETICS" },
  { name: "Aero Velocity", logoText: "AERO VELOCITY" },
  { name: "Pulse Endurance", logoText: "PULSE PRO" },
  { name: "Chronicle Elite", logoText: "CHRONICLE" },
];

export default function BrandLogosRow({
  heading = "Trusted by World-Class Champions & Athletic Leaders",
  logos = DEFAULT_LOGOS,
}: BrandLogosRowProps): React.JSX.Element {
  if (!logos || logos.length === 0) {
    return <></>;
  }

  return (
    <section className="space-y-4 py-4">
      {heading && (
        <p className="text-center text-xs font-bold uppercase tracking-widest text-[#780AC2] dark:text-purple-300/80">
          {heading}
        </p>
      )}

      {/* Horizontal Scroll / Marquee strip */}
      <div className="relative overflow-hidden py-4 border-y border-purple-200/50 dark:border-purple-800/40">
        <div className="flex items-center justify-around gap-8 overflow-x-auto scrollbar-none opacity-60 dark:opacity-75 hover:opacity-100 transition-opacity">
          {logos.map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 shrink-0 px-4"
            >
              <span className="font-black text-base sm:text-lg tracking-widest text-[#3C0561] dark:text-purple-100 hover:text-[#960DF2] dark:hover:text-white transition-colors uppercase">
                {brand.logoText || brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

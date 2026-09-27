import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EditableComponent } from "../EditableComponent";
import { renderRich } from "@/lib/themes/utils";

export interface ImageBoxProps {
  id?: string;
  sectionId?: string;
  settings?: {
    image_url?: string;
    title?: string;
    description?: string;
    button_text?: string;
    button_link?: string;
  };
}

export function ImageBox({
  id = "image_box",
  sectionId,
  settings = {},
}: ImageBoxProps) {
  const imageUrl =
    settings.image_url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";
  const title = settings.title || "Precision Engineering";
  const description =
    settings.description ||
    "Crafted with premium aerospace materials for unrivaled endurance.";
  const buttonText = settings.button_text || "Discover More";
  const buttonLink = settings.button_link || "/shop";

  return (
    <EditableComponent
      id={id}
      type="image_box"
      sectionId={sectionId}
      className="flex flex-col rounded-2xl overflow-hidden border border-[var(--theme-border,#E4E4E7)] bg-[var(--theme-background,#FFFFFF)] shadow-xs hover:shadow-lg transition-all"
    >
      <div className="relative aspect-16/10 w-full bg-gray-100 overflow-hidden group">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <h4
            className="text-lg font-bold text-[var(--theme-text,#18181B)] tracking-tight"
            dangerouslySetInnerHTML={renderRich(title)}
          />
          <p
            className="mt-2 text-xs sm:text-sm text-[var(--theme-text-muted,#71717A)] leading-relaxed"
            dangerouslySetInnerHTML={renderRich(description)}
          />
        </div>
        {buttonText && (
          <div className="pt-2">
            <Link
              href={buttonLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-accent,#2563EB)] hover:underline"
            >
              <span>{buttonText}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </EditableComponent>
  );
}

export default ImageBox;

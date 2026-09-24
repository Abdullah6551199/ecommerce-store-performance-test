"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SectionItemData {
  id: string;
  type: string;
  name?: string;
  enabled?: boolean;
  settings?: Record<string, any>;
}

interface SectionsListProps {
  sections: SectionItemData[];
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onReorderSections: (newSections: SectionItemData[]) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onOpenSectionPicker: () => void;
}

const SECTION_ICONS: Record<string, string> = {
  announcement: "📢",
  announcement_bar: "📢",
  header: "🧭",
  hero: "🌟",
  product_grid: "🛍️",
  product_carousel: "🎠",
  categories: "🏷️",
  testimonials: "💬",
  newsletter: "✉️",
  banner: "🎯",
  image_text: "🖼️",
  faq: "❓",
  footer: "⚓",
  product_gallery: "🖼️",
  product_info: "🏷️",
  product_tabs: "📑",
  product_reviews_section: "⭐",
  product_related: "🔄",
  category_header: "🗂️",
  category_filters: "🎛️",
  category_grid: "📦",
  cart_page_layout: "🛒",
  checkout_page_layout: "💳",
  account_dashboard: "👤",
  page_header: "📄",
  page_content: "📝",
};

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
}: {
  section: SectionItemData;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const isEnabled = section.enabled !== false;
  const icon = SECTION_ICONS[section.type] || "📄";
  const displayName =
    section.name ||
    section.type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
        isSelected
          ? "bg-[#25D366]/15 border-[#25D366]/60 text-emerald-300"
          : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300 touch-none"
          title="Drag to reorder"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </button>

        {/* Section icon & label */}
        <span className="text-sm shrink-0">{icon}</span>
        <span
          className={`truncate select-none ${
            !isEnabled ? "text-slate-500 line-through" : ""
          }`}
        >
          {displayName}
        </span>
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onToggleVisibility}
          title={isEnabled ? "Hide section" : "Show section"}
          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
            isEnabled ? "text-slate-400 hover:text-slate-200" : "text-amber-500"
          }`}
        >
          {isEnabled ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          title="Delete section"
          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function SectionsList({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorderSections,
  onToggleVisibility,
  onDeleteSection,
  onOpenSectionPicker,
}: SectionsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sections, oldIndex, newIndex);
        onReorderSections(reordered);
      }
    }
  };

  return (
    <aside className="w-72 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <h2 className="text-xs font-semibold text-slate-200">Page Sections</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {sections.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelectSection(null)}
          className={`text-[11px] px-2 py-1 rounded transition-colors ${
            selectedSectionId === null
              ? "bg-[#25D366]/30 text-emerald-300 font-medium"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Edit theme colors, fonts, logo"
        >
          Theme Styles
        </button>
      </div>

      {/* Sections sortable list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {sections.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-lg">
            <p className="text-xs text-slate-400">No sections added yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Add your first section to build the homepage layout.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((sec) => (
                <SortableSectionItem
                  key={sec.id}
                  section={sec}
                  isSelected={selectedSectionId === sec.id}
                  onSelect={() => onSelectSection(sec.id)}
                  onToggleVisibility={() => onToggleVisibility(sec.id)}
                  onDelete={() => onDeleteSection(sec.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer Add Section button */}
      <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-900/90">
        <button
          type="button"
          onClick={onOpenSectionPicker}
          className="w-full py-2 px-3 rounded-lg border border-dashed border-[#25D366]/40 hover:border-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#25D366] hover:text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Section</span>
        </button>
      </div>
    </aside>
  );
}

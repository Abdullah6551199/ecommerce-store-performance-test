"use client";

import React, { useState } from "react";
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
  visibility?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
}

interface SectionsListProps {
  sections: SectionItemData[];
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onReorderSections: (newSections: SectionItemData[]) => void;
  onToggleVisibility: (id: string) => void;
  onUpdateSectionVisibility?: (
    id: string,
    visibility: { desktop?: boolean; tablet?: boolean; mobile?: boolean }
  ) => void;
  onDuplicateSection?: (id: string) => void;
  onCopySection?: (section: SectionItemData) => void;
  onPasteSection?: () => void;
  canPaste?: boolean;
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
  onDuplicate,
  onCopy,
  onUpdateVisibility,
  onConfirmDelete,
}: {
  section: SectionItemData;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate?: () => void;
  onCopy?: () => void;
  onUpdateVisibility?: (vis: { desktop?: boolean; tablet?: boolean; mobile?: boolean }) => void;
  onConfirmDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

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

  const vis = section.visibility || { desktop: true, tablet: true, mobile: true };
  const isPartiallyHidden =
    vis.desktop === false || vis.tablet === false || vis.mobile === false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
        isSelected
          ? "bg-[#25D366]/15 border-[#25D366]/60 text-emerald-300 shadow-sm"
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
          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300 touch-none shrink-0"
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

        {isPartiallyHidden && (
          <span
            className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono"
            title="Custom device visibility configured"
          >
            hidden
          </span>
        )}
      </div>

      {/* Action buttons (Show on hover) */}
      <div
        className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visibility Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            title="Per-device visibility"
            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
              isPartiallyHidden ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {showVisibilityMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-2 w-36 space-y-1.5 text-[11px] font-sans">
              <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">
                Visibility
              </div>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={vis.desktop !== false}
                  onChange={(e) =>
                    onUpdateVisibility?.({ ...vis, desktop: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-[#25D366] focus:ring-0"
                />
                <span>Desktop</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={vis.tablet !== false}
                  onChange={(e) =>
                    onUpdateVisibility?.({ ...vis, tablet: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-[#25D366] focus:ring-0"
                />
                <span>Tablet</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={vis.mobile !== false}
                  onChange={(e) =>
                    onUpdateVisibility?.({ ...vis, mobile: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-[#25D366] focus:ring-0"
                />
                <span>Mobile</span>
              </label>
            </div>
          )}
        </div>

        {/* Copy Section */}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            title="Copy section"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        {/* Duplicate Section */}
        {onDuplicate && (
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate section"
            className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}

        {/* Delete Section */}
        <button
          type="button"
          onClick={onConfirmDelete}
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
  onUpdateSectionVisibility,
  onDuplicateSection,
  onCopySection,
  onPasteSection,
  canPaste = false,
  onDeleteSection,
  onOpenSectionPicker,
}: SectionsListProps) {
  const [sectionToDelete, setSectionToDelete] = useState<SectionItemData | null>(null);

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
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Sections
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {sections.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenSectionPicker}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add</span>
        </button>
      </div>

      {/* Sections Sortable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isSelected={section.id === selectedSectionId}
                onSelect={() => onSelectSection(section.id)}
                onDuplicate={() => onDuplicateSection?.(section.id)}
                onCopy={() => onCopySection?.(section)}
                onUpdateVisibility={(vis) =>
                  onUpdateSectionVisibility?.(section.id, vis)
                }
                onConfirmDelete={() => setSectionToDelete(section)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Bottom Footer Actions (Paste & Quick Add) */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
        {canPaste && onPasteSection && (
          <button
            type="button"
            onClick={onPasteSection}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>📋</span>
            <span>Paste Copied Section</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSectionPicker}
          className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-700 hover:border-[#25D366] text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Explore Section Library</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {sectionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 text-lg">
                🗑️
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Delete Section?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-200">
                    {sectionToDelete.name || sectionToDelete.type}
                  </strong>
                  ? This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSectionToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSection(sectionToDelete.id);
                  setSectionToDelete(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

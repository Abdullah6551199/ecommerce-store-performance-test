"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TopBar, DeviceMode } from "./TopBar";
import { SectionsList, SectionItemData } from "./SectionsList";
import { SettingsPanel } from "./SettingsPanel";
import { PreviewFrame } from "./PreviewFrame";
import { SectionPicker } from "./SectionPicker";
import { PublishConfirmModal } from "./PublishConfirmModal";

interface ThemeConfig {
  id: string;
  name: string;
  version: string;
  settings: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      text_muted: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      container_width: string;
      section_spacing: string;
      border_radius: string;
    };
    logo_url?: string;
    logo_text?: string;
  };
  sections: SectionItemData[];
}

export function ThemeEditorShell() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [undoStack, setUndoStack] = useState<ThemeConfig[]>([]);
  const [redoStack, setRedoStack] = useState<ThemeConfig[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Fetch initial theme draft on mount
  useEffect(() => {
    async function loadInitialDraft() {
      try {
        const res = await fetch("/api/admin/theme-editor/draft");
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data && data.theme) {
            setCurrentTheme(data.theme);
          }
        }
      } catch (err) {
        console.error("Failed to load theme draft", err);
      } finally {
        isInitialLoadRef.current = false;
      }
    }
    loadInitialDraft();
  }, []);

  // Save snapshot to undo stack helper (max 30 snapshots)
  const pushToUndoStack = useCallback((theme: ThemeConfig) => {
    setUndoStack((prev) => [...prev.slice(-29), JSON.parse(JSON.stringify(theme))]);
    setRedoStack([]); // Clear redo stack on new action
    setIsDirty(true);
  }, []);

  // 2. Auto-save draft debounced 2 seconds after changes
  const saveDraft = useCallback(
    async (themeToSave?: ThemeConfig) => {
      const target = themeToSave || currentTheme;
      if (!target) return;

      setIsSaving(true);
      try {
        const res = await fetch("/api/admin/theme-editor/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme_json: target }),
        });

        if (res.ok) {
          setIsDirty(false);
        } else {
          showToast("Failed to save draft");
        }
      } catch (err) {
        showToast("Error saving draft");
      } finally {
        setIsSaving(false);
      }
    },
    [currentTheme]
  );

  // Trigger auto-save debounce when currentTheme changes and dirty
  useEffect(() => {
    if (isInitialLoadRef.current || !isDirty || !currentTheme) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentTheme, isDirty, saveDraft]);

  // 3. Actions
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !currentTheme) return;

    const previousTheme = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentTheme))]);
    setCurrentTheme(previousTheme);
    setIsDirty(true);
  }, [undoStack, currentTheme]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !currentTheme) return;

    const nextTheme = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentTheme))]);
    setCurrentTheme(nextTheme);
    setIsDirty(true);
  }, [redoStack, currentTheme]);

  const handleSelectSection = (id: string | null) => {
    setSelectedSectionId(id);
  };

  const handleReorderSections = (newSections: SectionItemData[]) => {
    if (!currentTheme) return;
    pushToUndoStack(currentTheme);
    setCurrentTheme({
      ...currentTheme,
      sections: newSections,
    });
  };

  const handleToggleVisibility = (id: string) => {
    if (!currentTheme) return;
    pushToUndoStack(currentTheme);
    const updated = currentTheme.sections.map((sec) =>
      sec.id === id ? { ...sec, enabled: sec.enabled === false ? true : false } : sec
    );
    setCurrentTheme({ ...currentTheme, sections: updated });
  };

  const handleDeleteSection = (id: string) => {
    if (!currentTheme) return;
    pushToUndoStack(currentTheme);
    const updated = currentTheme.sections.filter((sec) => sec.id !== id);
    setCurrentTheme({ ...currentTheme, sections: updated });
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
    }
  };

  const handleAddSection = (type: string) => {
    if (!currentTheme) return;
    pushToUndoStack(currentTheme);

    const newId = `${type}_${Date.now()}`;
    const newSection: SectionItemData = {
      id: newId,
      type,
      name: type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      enabled: true,
      settings: {},
    };

    setCurrentTheme({
      ...currentTheme,
      sections: [...currentTheme.sections, newSection],
    });
    setSelectedSectionId(newId);
  };

  const handleUpdateSectionSettings = (id: string, patch: Record<string, any>) => {
    if (!currentTheme) return;
    pushToUndoStack(currentTheme);

    const updated = currentTheme.sections.map((sec) => {
      if (sec.id === id) {
        return {
          ...sec,
          settings: {
            ...(sec.settings || {}),
            ...patch,
          },
        };
      }
      return sec;
    });

    setCurrentTheme({ ...currentTheme, sections: updated });
  };

  const handleUpdateGlobalSettings = (patch: Record<string, any>) => {
    if (!currentTheme) return;
    pushToUndoStack(currentTheme);

    setCurrentTheme({
      ...currentTheme,
      settings: {
        ...currentTheme.settings,
        ...patch,
      },
    });
  };

  // 4. Publish flow
  const handlePublish = async () => {
    if (!currentTheme) return;
    setIsPublishing(true);
    try {
      const res = await fetch("/api/admin/theme-editor/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_json: currentTheme }),
      });

      if (res.ok) {
        setIsDirty(false);
        showToast("Theme published successfully to live storefront!");
      } else {
        const err = (await res.json().catch(() => ({}))) as any;
        showToast(err?.error || "Failed to publish theme");
      }
    } catch (err) {
      showToast("Network error publishing theme");
    } finally {
      setIsPublishing(false);
    }
  };

  // 5. Discard draft flow
  const handleDiscard = async () => {
    if (!confirm("Are you sure you want to discard your draft? All unsaved changes will be lost.")) {
      return;
    }

    setIsDiscarding(true);
    try {
      const res = await fetch("/api/admin/theme-editor/discard", {
        method: "POST",
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data && data.theme) {
          setCurrentTheme(data.theme);
        }
        setUndoStack([]);
        setRedoStack([]);
        setIsDirty(false);
        setSelectedSectionId(null);
        showToast("Draft discarded. Restored live active theme.");
      } else {
        showToast("Failed to discard draft");
      }
    } catch (err) {
      showToast("Error discarding draft");
    } finally {
      setIsDiscarding(false);
    }
  };

  // 6. Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if inside input or textarea
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");

      // Ctrl/Cmd + Z → Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          handleUndo();
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y → Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Ctrl/Cmd + S → Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveDraft();
      }

      // Esc → Deselect section / close modals
      if (e.key === "Escape") {
        if (isPickerOpen) {
          setIsPickerOpen(false);
        } else if (isPublishModalOpen) {
          setIsPublishModalOpen(false);
        } else if (selectedSectionId) {
          setSelectedSectionId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, saveDraft, isPickerOpen, isPublishModalOpen, selectedSectionId]);

  if (!currentTheme) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#25D366]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium">Loading Theme Editor...</span>
        </div>
      </div>
    );
  }

  const selectedSection =
    currentTheme.sections.find((s) => s.id === selectedSectionId) || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden font-sans text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl animate-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <TopBar
        storeName={currentTheme.name}
        device={device}
        onDeviceChange={setDevice}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSaveDraft={() => saveDraft()}
        isSaving={isSaving}
        isDirty={isDirty}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onDiscardDraft={handleDiscard}
        isDiscarding={isDiscarding}
      />

      {/* 3-Column Main Editor Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Sections List */}
        <SectionsList
          sections={currentTheme.sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={handleSelectSection}
          onReorderSections={handleReorderSections}
          onToggleVisibility={handleToggleVisibility}
          onDeleteSection={handleDeleteSection}
          onOpenSectionPicker={() => setIsPickerOpen(true)}
        />

        {/* Center: Live Storefront Preview */}
        <PreviewFrame
          themeConfig={currentTheme}
          device={device}
        />

        {/* Right Sidebar: Selected Section or Global Settings */}
        <SettingsPanel
          selectedSection={selectedSection}
          globalSettings={currentTheme.settings}
          onUpdateSectionSettings={handleUpdateSectionSettings}
          onUpdateGlobalSettings={handleUpdateGlobalSettings}
          onDeselectSection={() => setSelectedSectionId(null)}
          onDeleteSection={handleDeleteSection}
          onToggleSectionVisibility={handleToggleVisibility}
        />
      </div>

      {/* Section Picker Modal */}
      <SectionPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectSection={handleAddSection}
      />

      {/* Publish Confirmation Modal */}
      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handlePublish}
        isPublishing={isPublishing}
        sectionsCount={currentTheme.sections.length}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TopBar, DeviceMode } from "./TopBar";
import { SectionsList, SectionItemData } from "./SectionsList";
import { SettingsPanel } from "./SettingsPanel";
import { PreviewFrame } from "./PreviewFrame";
import { SectionPicker } from "./SectionPicker";
import { ComponentPicker } from "./ComponentPicker";
import { PublishConfirmModal } from "./PublishConfirmModal";
import { getSectionSchema } from "@/lib/themes/section-schema";

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
  page_defaults?: Record<string, SectionItemData[]>;
}

export function ThemeEditorShell() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<{
    sectionId: string;
    componentId: string;
    componentType: string;
  } | null>(null);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [undoStack, setUndoStack] = useState<ThemeConfig[]>([]);
  const [redoStack, setRedoStack] = useState<ThemeConfig[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [isComponentPickerOpen, setIsComponentPickerOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-Page state (Stage 47.3 - 47.4)
  const [activePageType, setActivePageType] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("nasrify_theme_editor_page") || "homepage";
      } catch {
        return "homepage";
      }
    }
    return "homepage";
  });
  const [cmsPages, setCmsPages] = useState<Array<{ id: string; slug: string; title: string }>>([]);
  const [isLoadingCmsPages, setIsLoadingCmsPages] = useState<boolean>(false);

  // Sync & Refresh triggers (BUG-3)
  const [forceRefreshTrigger, setForceRefreshTrigger] = useState<number>(0);

  // Component Delete Modal (BUG-2)
  const [componentToDelete, setComponentToDelete] = useState<{
    sectionId: string;
    componentId: string;
  } | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Fetch initial theme draft for active page type
  useEffect(() => {
    async function loadInitialDraft() {
      try {
        const res = await fetch(`/api/admin/theme-editor/draft?page=${activePageType}`);
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
  }, [activePageType]);

  // Fetch dynamic CMS pages from D1 for Page Switcher
  useEffect(() => {
    async function loadCmsPages() {
      setIsLoadingCmsPages(true);
      try {
        const res = await fetch("/api/admin/pages");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (json?.data?.pages && Array.isArray(json.data.pages)) {
            setCmsPages(json.data.pages);
          }
        }
      } catch (err) {
        // Silently continue if CMS pages table empty
      } finally {
        setIsLoadingCmsPages(false);
      }
    }
    loadCmsPages();
  }, []);

  // Save snapshot to undo stack helper (max 30 snapshots)
  const pushToUndoStack = useCallback((theme: ThemeConfig) => {
    setUndoStack((prev) => [...prev.slice(-29), JSON.parse(JSON.stringify(theme))]);
    setRedoStack([]); // Clear redo stack on new action
    setIsDirty(true);
  }, []);

  // 2. Save draft with page_type isolation and force-refresh trigger
  const saveDraft = useCallback(
    async (themeToSave?: ThemeConfig) => {
      const target = themeToSave || currentTheme;
      if (!target) return;

      setIsSaving(true);
      try {
        const res = await fetch("/api/admin/theme-editor/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_type: activePageType,
            theme_json: target,
          }),
        });

        if (res.ok) {
          setIsDirty(false);
          // Trigger preview sync (BUG-3)
          setForceRefreshTrigger((t) => t + 1);
        } else {
          showToast("Failed to save draft");
        }
      } catch (err) {
        showToast("Error saving draft");
      } finally {
        setIsSaving(false);
      }
    },
    [currentTheme, activePageType]
  );

  // Trigger auto-save debounce (2 seconds) when currentTheme changes and is dirty
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

  // Page Switch Handler (STEP 6)
  const handlePageSwitch = async (newPageType: string) => {
    if (newPageType === activePageType) return;

    // Auto-save current page draft if dirty before switching
    if (isDirty && currentTheme) {
      await saveDraft(currentTheme);
    }

    setActivePageType(newPageType);
    try {
      localStorage.setItem("nasrify_theme_editor_page", newPageType);
    } catch {}

    // Reset page-level state
    setSelectedSectionId(null);
    setSelectedComponent(null);
    setUndoStack([]);
    setRedoStack([]);

    // Load new page's draft
    try {
      const res = await fetch(`/api/admin/theme-editor/draft?page=${newPageType}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data?.theme) {
          setCurrentTheme(data.theme);
        }
      }
    } catch (err) {
      console.error("Failed to load page draft", err);
    }
  };

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
    setSelectedComponent(null);
  };

  const handleEditComponent = (sectionId: string, componentId: string, componentType: string) => {
    setSelectedSectionId(sectionId);
    setSelectedComponent({ sectionId, componentId, componentType });
  };

  // Confirm delete component (BUG-2)
  const confirmDeleteComponent = () => {
    if (!currentTheme || !componentToDelete) return;
    const { sectionId, componentId } = componentToDelete;
    pushToUndoStack(currentTheme);

    const updatedSections = currentTheme.sections.map((sec) => {
      if (sec.id === sectionId && sec.settings?._components) {
        const nextComponents = { ...sec.settings._components };
        delete nextComponents[componentId];
        return {
          ...sec,
          settings: {
            ...sec.settings,
            _components: nextComponents,
          },
        };
      }
      return sec;
    });

    const updatedTheme = { ...currentTheme, sections: updatedSections };
    setCurrentTheme(updatedTheme);
    if (selectedComponent?.componentId === componentId) {
      setSelectedComponent(null);
    }
    setComponentToDelete(null);
    saveDraft(updatedTheme);
    showToast("Component deleted");
  };

  const handleAddComponentToSection = (componentType: string) => {
    if (!currentTheme || !selectedSectionId) return;
    pushToUndoStack(currentTheme);

    const newCompId = `${componentType}_${Date.now()}`;
    const updated = currentTheme.sections.map((sec) => {
      if (sec.id === selectedSectionId) {
        const nextComponents = {
          ...(sec.settings?._components || {}),
          [newCompId]: {
            type: componentType,
            settings: {},
            _style: {},
            _advanced: {},
          },
        };
        return {
          ...sec,
          settings: {
            ...(sec.settings || {}),
            _components: nextComponents,
          },
        };
      }
      return sec;
    });

    setCurrentTheme({ ...currentTheme, sections: updated });
    setSelectedComponent({
      sectionId: selectedSectionId,
      componentId: newCompId,
      componentType,
    });
    showToast(`Added ${componentType.replace(/_/g, " ")} component`);
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
      setSelectedComponent(null);
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
        const nextSettings = {
          ...(sec.settings || {}),
          ...(patch.settings !== undefined ? patch.settings : patch),
        };
        // Clean up accidental settings.settings if any
        if (nextSettings.settings && typeof nextSettings.settings === "object") {
          delete nextSettings.settings;
        }
        return {
          ...sec,
          ...(patch.variant ? { variant: patch.variant } : {}),
          settings: nextSettings,
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
        body: JSON.stringify({
          page_type: activePageType,
          theme_json: currentTheme,
        }),
      });

      if (res.ok) {
        setIsDirty(false);
        setForceRefreshTrigger((t) => t + 1);
        showToast(`Theme (${activePageType}) published successfully to live storefront!`);
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
    if (!confirm(`Are you sure you want to discard your ${activePageType} draft? All unsaved changes will be lost.`)) {
      return;
    }

    setIsDiscarding(true);
    try {
      const res = await fetch(`/api/admin/theme-editor/discard?page=${activePageType}`, {
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
        setSelectedComponent(null);
        setForceRefreshTrigger((t) => t + 1);
        showToast(`Draft discarded. Restored live active ${activePageType}.`);
      } else {
        showToast("Failed to discard draft");
      }
    } catch (err) {
      showToast("Error discarding draft");
    } finally {
      setIsDiscarding(false);
    }
  };

  // Copied section state (synced with sessionStorage)
  const [copiedSection, setCopiedSection] = useState<SectionItemData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("nasrify_theme_copied_section");
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleCopySection = useCallback((sec: SectionItemData) => {
    setCopiedSection(sec);
    try {
      sessionStorage.setItem("nasrify_theme_copied_section", JSON.stringify(sec));
    } catch (e) {}
    showToast(`Copied ${sec.name || sec.type}`);
  }, []);

  const handlePasteSection = useCallback(() => {
    if (!currentTheme || !copiedSection) return;
    const clone: SectionItemData = {
      ...JSON.parse(JSON.stringify(copiedSection)),
      id: `${copiedSection.type}_${Date.now()}`,
      name: `${copiedSection.name || copiedSection.type} (Copy)`,
    };
    pushToUndoStack(currentTheme);
    setCurrentTheme({
      ...currentTheme,
      sections: [...currentTheme.sections, clone],
    });
    setSelectedSectionId(clone.id);
    showToast(`Pasted ${clone.name}`);
  }, [currentTheme, copiedSection, pushToUndoStack]);

  const handleDuplicateSection = useCallback((id: string) => {
    if (!currentTheme) return;
    const index = currentTheme.sections.findIndex((s) => s.id === id);
    if (index === -1) return;
    const original = currentTheme.sections[index];
    const clone: SectionItemData = {
      ...JSON.parse(JSON.stringify(original)),
      id: `${original.type}_${Date.now()}`,
      name: `${original.name || original.type} (Copy)`,
    };
    pushToUndoStack(currentTheme);
    const newSections = [...currentTheme.sections];
    newSections.splice(index + 1, 0, clone);
    setCurrentTheme({ ...currentTheme, sections: newSections });
    setSelectedSectionId(clone.id);
    showToast(`Duplicated ${original.name || original.type}`);
  }, [currentTheme, pushToUndoStack]);

  const handleUpdateSectionVisibility = useCallback(
    (id: string, visibility: { desktop?: boolean; tablet?: boolean; mobile?: boolean }) => {
      if (!currentTheme) return;
      pushToUndoStack(currentTheme);
      const updated = currentTheme.sections.map((sec) =>
        sec.id === id ? { ...sec, visibility } : sec
      );
      setCurrentTheme({ ...currentTheme, sections: updated });
    },
    [currentTheme, pushToUndoStack]
  );

  const handleInlineEdit = useCallback(
    (sectionId: string, field: string, value: string) => {
      if (!currentTheme) return;
      pushToUndoStack(currentTheme);
      const updated = currentTheme.sections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            settings: {
              ...(sec.settings || {}),
              [field]: value,
            },
          };
        }
        return sec;
      });
      setCurrentTheme({ ...currentTheme, sections: updated });
      showToast(`Updated "${field}"`);
    },
    [currentTheme, pushToUndoStack]
  );

  // 6. Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

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

      // Ctrl/Cmd + D → Duplicate selected section
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        if (!isInput && selectedSectionId) {
          e.preventDefault();
          handleDuplicateSection(selectedSectionId);
        }
      }

      // Ctrl/Cmd + C → Copy selected section
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (!isInput && selectedSectionId && currentTheme) {
          const sec = currentTheme.sections.find((s) => s.id === selectedSectionId);
          if (sec) {
            e.preventDefault();
            handleCopySection(sec);
          }
        }
      }

      // Ctrl/Cmd + V → Paste section
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (!isInput && copiedSection) {
          e.preventDefault();
          handlePasteSection();
        }
      }

      // Delete key → Delete selected section
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!isInput && selectedSectionId && currentTheme) {
          const sec = currentTheme.sections.find((s) => s.id === selectedSectionId);
          if (sec && confirm(`Delete '${sec.name || sec.type}'? This cannot be undone.`)) {
            e.preventDefault();
            handleDeleteSection(selectedSectionId);
          }
        }
      }

      // Arrow Up / Down → Navigate sections
      if (e.key === "ArrowDown" && !isInput && currentTheme?.sections.length) {
        e.preventDefault();
        const currentIndex = currentTheme.sections.findIndex((s) => s.id === selectedSectionId);
        if (currentIndex < currentTheme.sections.length - 1) {
          setSelectedSectionId(currentTheme.sections[currentIndex + 1].id);
        } else if (currentIndex === -1) {
          setSelectedSectionId(currentTheme.sections[0].id);
        }
      }

      if (e.key === "ArrowUp" && !isInput && currentTheme?.sections.length) {
        e.preventDefault();
        const currentIndex = currentTheme.sections.findIndex((s) => s.id === selectedSectionId);
        if (currentIndex > 0) {
          setSelectedSectionId(currentTheme.sections[currentIndex - 1].id);
        }
      }

      // Esc → Deselect section / close modals
      if (e.key === "Escape") {
        if (componentToDelete) {
          setComponentToDelete(null);
        } else if (isPickerOpen) {
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
  }, [
    handleUndo,
    handleRedo,
    saveDraft,
    handleDuplicateSection,
    handleCopySection,
    handlePasteSection,
    handleDeleteSection,
    copiedSection,
    currentTheme,
    componentToDelete,
    isPickerOpen,
    isPublishModalOpen,
    selectedSectionId,
  ]);

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

      {/* Top Bar with Page Switcher (Stage 47.3-4) */}
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
        activePageType={activePageType}
        onSelectPage={handlePageSwitch}
        cmsPages={cmsPages}
        isLoadingPages={isLoadingCmsPages}
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
          onUpdateSectionVisibility={handleUpdateSectionVisibility}
          onDuplicateSection={handleDuplicateSection}
          onCopySection={handleCopySection}
          onPasteSection={handlePasteSection}
          canPaste={!!copiedSection}
          onDeleteSection={handleDeleteSection}
          onOpenSectionPicker={() => setIsPickerOpen(true)}
        />

        {/* Center: Live Storefront Preview */}
        <PreviewFrame
          themeConfig={currentTheme}
          device={device}
          pageType={activePageType}
          forceRefreshTrigger={forceRefreshTrigger}
          onInlineEdit={handleInlineEdit}
          onSelectSection={handleSelectSection}
          onEditComponent={handleEditComponent}
          onDeleteComponent={(sectionId, componentId) => {
            setComponentToDelete({ sectionId, componentId });
          }}
        />

        {/* Right Sidebar: Selected Section or Global Settings (Visual) */}
        <SettingsPanel
          selectedSection={selectedSection}
          globalSettings={currentTheme.settings}
          onUpdateSectionSettings={handleUpdateSectionSettings}
          onUpdateGlobalSettings={handleUpdateGlobalSettings}
          onDeselectSection={() => {
            setSelectedSectionId(null);
            setSelectedComponent(null);
          }}
          onDeleteSection={handleDeleteSection}
          onToggleSectionVisibility={handleToggleVisibility}
          selectedComponent={selectedComponent}
          onDeselectComponent={() => setSelectedComponent(null)}
          onSelectComponent={setSelectedComponent}
          onOpenComponentPicker={() => setIsComponentPickerOpen(true)}
        />
      </div>

      {/* Section Picker Modal */}
      <SectionPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectSection={handleAddSection}
      />

      {/* Component Picker Modal (Stage 47) */}
      <ComponentPicker
        isOpen={isComponentPickerOpen}
        onClose={() => setIsComponentPickerOpen(false)}
        onSelectComponent={handleAddComponentToSection}
        allowedTypes={selectedSection ? getSectionSchema(selectedSection.type)?.allowedComponents : undefined}
        sectionName={selectedSection?.name || selectedSection?.type}
      />

      {/* Publish Confirmation Modal */}
      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handlePublish}
        isPublishing={isPublishing}
        sectionsCount={currentTheme.sections.length}
      />

      {/* Delete Component Confirmation Modal (BUG-2) */}
      {componentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-rose-400">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Delete Component</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to delete this component? It will be removed from the section.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setComponentToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteComponent}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { BreakpointDevice, SectionAdvancedData } from '../shared/types';
import { ContentTab } from './tabs/ContentTab';
import { StyleTab } from './tabs/StyleTab';
import { AdvancedTab } from './tabs/AdvancedTab';
import { ResponsiveControl } from './controls/ResponsiveControl';

interface AdvancedEditorWrapperProps {
  theme: any;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onUpdateTheme: (theme: any) => void;
  onSave?: () => void;
}

export function AdvancedEditorWrapper({
  theme,
  selectedSectionId,
  onSelectSection,
  onUpdateTheme,
  onSave,
}: AdvancedEditorWrapperProps) {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'style' | 'advanced'>('style');
  const [currentDevice, setCurrentDevice] = useState<BreakpointDevice>('desktop');
  const [copiedStyle, setCopiedStyle] = useState<SectionAdvancedData | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const sections: any[] = theme?.sections || [];
  const selectedSection = sections.find((s) => s.id === selectedSectionId) || null;

  // Keyboard shortcuts: Ctrl+S to save, Esc to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) onSave();
      } else if (e.key === 'Escape') {
        onSelectSection(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSelectSection]);

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 2500);
  };

  const handleUpdateAdvanced = (newAdvancedData: SectionAdvancedData) => {
    if (!selectedSectionId) return;

    const updatedSections = sections.map((s) => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        settings: {
          ...(s.settings || {}),
          _advanced: newAdvancedData,
        },
      };
    });

    onUpdateTheme({
      ...theme,
      sections: updatedSections,
    });
  };

  const handleUpdateContentSetting = (key: string, value: any) => {
    if (!selectedSectionId) return;

    const updatedSections = sections.map((s) => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        settings: {
          ...(s.settings || {}),
          [key]: value,
        },
      };
    });

    onUpdateTheme({
      ...theme,
      sections: updatedSections,
    });
  };

  const handleCopyStyle = () => {
    if (!selectedSection) return;
    const adv = selectedSection.settings?._advanced;
    if (adv) {
      setCopiedStyle(JSON.parse(JSON.stringify(adv)));
      showToast('Section style copied to clipboard');
    } else {
      showToast('No custom styles on this section yet');
    }
  };

  const handlePasteStyle = () => {
    if (!copiedStyle || !selectedSectionId) return;
    handleUpdateAdvanced(copiedStyle);
    showToast('Style applied from clipboard');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Toast Alert */}
      {copyToast && (
        <div className="fixed top-16 right-6 z-50 bg-indigo-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xl animate-in fade-in duration-200">
          {copyToast}
        </div>
      )}

      {/* Editor Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {selectedSection ? (
            <button
              type="button"
              onClick={() => onSelectSection(null)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Advanced Editor
            </span>
          )}
        </div>

        {/* Global / Section Actions */}
        {selectedSection && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyStyle}
              title="Copy Section Style"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-[11px] hidden sm:inline">Copy</span>
            </button>

            <button
              type="button"
              onClick={handlePasteStyle}
              disabled={!copiedStyle}
              title={copiedStyle ? 'Paste Copied Style' : 'Copy a style first'}
              className={`p-1.5 rounded-md transition-colors text-xs flex items-center gap-1 ${
                copiedStyle
                  ? 'text-indigo-400 hover:text-indigo-200 hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-[11px] hidden sm:inline">Paste</span>
            </button>
          </div>
        )}
      </div>

      {/* When NO section selected: Section picker list */}
      {!selectedSection ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-lg space-y-1">
            <span className="text-xs font-semibold text-indigo-300">Elementor Mode Active</span>
            <p className="text-[11px] text-slate-400">
              Select any section below to customize typography, backgrounds, borders, motion effects, and responsive breakpoints.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              Page Sections ({sections.length})
            </span>
            {sections.map((section) => {
              const hasAdvanced = Boolean(section.settings?._advanced);
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                  className="w-full p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-indigo-400 transition-colors" />
                    <div>
                      <span className="text-xs font-medium text-slate-200 capitalize">
                        {section.name || section.type.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">#{section.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasAdvanced && (
                      <span className="px-1.5 py-0.5 rounded-xs bg-indigo-900/60 text-indigo-300 text-[9px] font-semibold border border-indigo-700/50">
                        Styled
                      </span>
                    )}
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* When Section Selected: Elementor-style 3 Sub-Tabs */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section Banner */}
          <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 capitalize">
                {selectedSection.name || selectedSection.type.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-slate-400 ml-2 font-mono">#{selectedSection.id}</span>
            </div>
            <ResponsiveControl currentDevice={currentDevice} onDeviceChange={setCurrentDevice} />
          </div>

          {/* Sub-Tabs: Content / Style / Advanced */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('content')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeSubTab === 'content'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('style')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeSubTab === 'style'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Style
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('advanced')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeSubTab === 'advanced'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Advanced
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSubTab === 'content' && (
              <ContentTab
                sectionId={selectedSection.id}
                sectionType={selectedSection.type}
                settings={selectedSection.settings || {}}
                onUpdateSetting={handleUpdateContentSetting}
              />
            )}

            {activeSubTab === 'style' && (
              <StyleTab
                sectionId={selectedSection.id}
                data={selectedSection.settings?._advanced}
                onChange={handleUpdateAdvanced}
                currentDevice={currentDevice}
                onDeviceChange={setCurrentDevice}
              />
            )}

            {activeSubTab === 'advanced' && (
              <AdvancedTab
                sectionId={selectedSection.id}
                data={selectedSection.settings?._advanced}
                onChange={handleUpdateAdvanced}
                currentDevice={currentDevice}
                onDeviceChange={setCurrentDevice}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

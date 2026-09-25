"use client";

import React, { useRef, useState, useEffect } from "react";

interface RichTextFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  minHeight?: string;
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/javascript\s*:/gi, "");
}

export function RichTextField({
  label,
  value,
  onChange,
  placeholder = "Write content here...",
  helperText,
  minHeight = "90px",
}: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync value from props when not actively focused
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      handleInput();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const sanitized = sanitizeHtml(html);
      onChange(sanitized);
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
    }
  };

  const handleOpenLinkModal = () => {
    saveSelection();
    setLinkUrl("https://");
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    setShowLinkModal(false);
    restoreSelection();
    if (linkUrl && linkUrl !== "https://") {
      execCommand("createLink", linkUrl);
    }
  };

  return (
    <div className="space-y-1.5 text-xs">
      {label && <label className="block text-slate-300 font-medium">{label}</label>}

      {/* Editor Box */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 focus-within:border-[#25D366]/50 focus-within:ring-1 focus-within:ring-[#25D366]/30 transition-all">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 p-1 bg-slate-900 border-b border-slate-800 text-slate-400">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            title="Bold (Ctrl+B)"
            className="p-1 hover:text-white hover:bg-slate-800 rounded font-bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            title="Italic (Ctrl+I)"
            className="p-1 hover:text-white hover:bg-slate-800 rounded italic font-serif"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand("underline")}
            title="Underline (Ctrl+U)"
            className="p-1 hover:text-white hover:bg-slate-800 rounded underline"
          >
            U
          </button>

          <span className="w-px h-4 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet list"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCommand("insertOrderedList")}
            title="Numbered list"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            1. List
          </button>

          <span className="w-px h-4 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={handleOpenLinkModal}
            title="Insert Link"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            🔗 Link
          </button>

          <button
            type="button"
            onClick={() => execCommand("removeFormat")}
            title="Clear formatting"
            className="p-1 hover:text-white hover:bg-slate-800 rounded text-[10px]"
          >
            ✕ Clear
          </button>
        </div>

        {/* Contenteditable Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          data-placeholder={placeholder}
          className="p-2.5 text-slate-200 outline-hidden overflow-y-auto leading-relaxed prose prose-invert prose-xs max-w-none focus:outline-hidden"
        />
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-w-xs w-full shadow-2xl space-y-3">
            <h4 className="font-semibold text-slate-100 text-xs">Insert Link</h4>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">URL</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-hidden focus:border-[#25D366]"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition-colors"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

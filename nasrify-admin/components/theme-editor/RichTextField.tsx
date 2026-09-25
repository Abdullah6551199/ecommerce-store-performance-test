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
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:/gi, "");
}

const PRESET_COLORS = [
  "#22C55E",
  "#3B82F6",
  "#EC4899",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#FFFFFF",
  "#94A3B8",
];

const WORD_ANIMATIONS = [
  { id: "none", label: "None" },
  { id: "bounceIn", label: "Bounce" },
  { id: "pulse", label: "Pulse" },
  { id: "wobble", label: "Wobble" },
  { id: "jello", label: "Jello" },
  { id: "heartBeat", label: "Heartbeat" },
  { id: "glow", label: "Neon Glow" },
  { id: "rainbow", label: "Rainbow Cycle" },
];

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
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showAnimPicker, setShowAnimPicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("#22C55E");
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

  const handleApplyColor = (color: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.color = color;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      handleInput();
    }
    setShowColorPicker(false);
  };

  const handleApplyAnimation = (animId: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (animId === "none") {
        const contents = range.extractContents();
        const temp = document.createElement("div");
        temp.appendChild(contents);
        temp.querySelectorAll("[data-animation]").forEach((el) => {
          el.replaceWith(...Array.from(el.childNodes));
        });
        range.insertNode(temp.firstChild || temp);
      } else {
        const span = document.createElement("span");
        span.setAttribute("data-animation", animId);
        span.className = `inline-block anim-${animId}`;
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
      sel.removeAllRanges();
      handleInput();
    }
    setShowAnimPicker(false);
  };

  return (
    <div className="space-y-1.5 text-xs">
      {label && <label className="block text-slate-300 font-medium">{label}</label>}

      {/* Editor Box */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 focus-within:border-[#25D366]/50 focus-within:ring-1 focus-within:ring-[#25D366]/30 transition-all relative">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-1 bg-slate-900 border-b border-slate-800 text-slate-400">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            title="Bold"
            className="p-1 hover:text-white hover:bg-slate-800 rounded font-bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            title="Italic"
            className="p-1 hover:text-white hover:bg-slate-800 rounded italic font-serif"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand("underline")}
            title="Underline"
            className="p-1 hover:text-white hover:bg-slate-800 rounded underline"
          >
            U
          </button>

          <span className="w-px h-4 bg-slate-800 mx-0.5" />

          {/* Color Picker Button */}
          <button
            type="button"
            onMouseDown={saveSelection}
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowAnimPicker(false);
            }}
            title="Color selected text"
            className="flex items-center gap-1 p-1 hover:text-white hover:bg-slate-800 rounded text-[11px]"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-slate-600"
              style={{ backgroundColor: selectedColor }}
            />
            <span>Color</span>
          </button>

          {/* Word Animation Button */}
          <button
            type="button"
            onMouseDown={saveSelection}
            onClick={() => {
              setShowAnimPicker(!showAnimPicker);
              setShowColorPicker(false);
            }}
            title="Animate selected word"
            className="flex items-center gap-1 p-1 hover:text-green-400 hover:bg-slate-800 rounded text-[11px] text-green-500"
          >
            <span>✨ Anim</span>
          </button>

          <span className="w-px h-4 bg-slate-800 mx-0.5" />

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
            className="p-1 hover:text-white hover:bg-slate-800 rounded text-[10px] ml-auto text-slate-500"
          >
            Clear
          </button>
        </div>

        {/* Color Popover */}
        {showColorPicker && (
          <div className="absolute top-8 left-12 z-30 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-48 space-y-1.5">
            <span className="text-[10px] text-slate-400 block font-medium">Select text & color:</span>
            <div className="grid grid-cols-5 gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleApplyColor(c)}
                  className="w-6 h-6 rounded border border-slate-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <button
                type="button"
                onClick={() => handleApplyColor(selectedColor)}
                className="flex-1 px-1.5 py-0.5 bg-green-600 hover:bg-green-500 text-slate-950 font-bold rounded text-[10px]"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Animation Popover */}
        {showAnimPicker && (
          <div className="absolute top-8 left-24 z-30 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-44 space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">Animate selected word:</span>
            {WORD_ANIMATIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleApplyAnimation(a.id)}
                className="w-full text-left px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center justify-between"
              >
                <span>{a.label}</span>
                {a.id !== "none" && <span className="text-green-400 text-[10px]">✨</span>}
              </button>
            ))}
          </div>
        )}

        {/* Editable Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          className="p-2.5 text-slate-100 text-xs focus:outline-hidden leading-relaxed custom-rich-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>

      {helperText && <p className="text-[10px] text-slate-500">{helperText}</p>}

      {/* Link Dialog */}
      {showLinkModal && (
        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-200">Insert Link</span>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-100 focus:border-[#25D366] focus:outline-hidden font-mono"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-2.5 py-1 bg-[#25D366] text-slate-950 font-semibold rounded text-xs hover:bg-[#22c55e]"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

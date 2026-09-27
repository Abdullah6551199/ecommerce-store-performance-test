"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

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
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/href\s*=\s*["']?javascript:[^"'>]*/gi, 'href="#"');
}

const PRESET_COLORS = [
  "#22C55E", // Green
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#FFFFFF", // White
  "#94A3B8", // Slate
  "#18181B", // Black
];

const WORD_ANIMATIONS = [
  { id: "none", label: "None" },
  { id: "bounce", label: "Bounce" },
  { id: "pulse", label: "Pulse" },
  { id: "shake", label: "Shake" },
  { id: "fade", label: "Fade" },
  { id: "slide", label: "Slide Up" },
  { id: "wobble", label: "Wobble" },
  { id: "jello", label: "Jello" },
  { id: "heartBeat", label: "Heartbeat" },
  { id: "glow", label: "Neon Glow" },
];

export function RichTextField({
  label,
  value,
  onChange,
  placeholder = "Write content here...",
  helperText,
  minHeight = "70px",
}: RichTextFieldProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Floating selection toolbar state
  const [floatingToolbar, setFloatingToolbar] = useState<{
    visible: boolean;
    top: number;
    left: number;
  }>({ visible: false, top: 0, left: 0 });

  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showAnimPicker, setShowAnimPicker] = useState<boolean>(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("#22C55E");
  const [customHex, setCustomHex] = useState<string>("#22C55E");
  const [linkUrl, setLinkUrl] = useState<string>("");

  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync value from props when not actively focused
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const sanitized = sanitizeHtml(html);
      onChange(sanitized);
    }
  }, [onChange]);

  // Check selection to position floating toolbar
  const updateSelectionToolbar = useCallback(() => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current) {
      setFloatingToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    // Verify selection is inside our editor
    const range = sel.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    if (!editorRef.current.contains(commonAncestor)) {
      setFloatingToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    saveSelection();
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setFloatingToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const toolbarWidth = 260;
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    if (left < 16) left = 16;
    if (left + toolbarWidth > window.innerWidth - 16) {
      left = window.innerWidth - toolbarWidth - 16;
    }

    let top = rect.top - 46;
    if (top < 16) {
      top = rect.bottom + 8;
    }

    setFloatingToolbar({
      visible: true,
      top,
      left,
    });
  }, [saveSelection]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(updateSelectionToolbar, 10);
    };
    const handleKeyUp = () => {
      setTimeout(updateSelectionToolbar, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [updateSelectionToolbar]);

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      handleInput();
      updateSelectionToolbar();
    }
  };

  // 1 & 2. Word-level or Letter-level Color
  const handleApplyColor = (colorHex: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.color = colorHex;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.removeAllRanges();
      handleInput();
    }
    setSelectedColor(colorHex);
    setShowColorPicker(false);
    setFloatingToolbar((prev) => ({ ...prev, visible: false }));
  };

  // 3 & 4. Word-level or Letter-level Animation
  const handleApplyAnimation = (animId: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (animId === "none") {
        const contents = range.extractContents();
        const temp = document.createElement("div");
        temp.appendChild(contents);
        temp.querySelectorAll("[data-anim], [data-animation]").forEach((el) => {
          el.replaceWith(...Array.from(el.childNodes));
        });
        range.insertNode(temp.firstChild || temp);
      } else {
        const span = document.createElement("span");
        span.setAttribute("data-anim", animId);
        span.setAttribute("data-animation", animId);
        span.className = `inline-block anim-${animId}`;
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
      sel.removeAllRanges();
      handleInput();
    }
    setShowAnimPicker(false);
    setFloatingToolbar((prev) => ({ ...prev, visible: false }));
  };

  const handleClearFormat = () => {
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const contents = range.extractContents();
      const temp = document.createElement("div");
      temp.appendChild(contents);
      // Strip all formatting spans
      temp.querySelectorAll("span, b, i, u, strong, em, font, a").forEach((el) => {
        el.replaceWith(...Array.from(el.childNodes));
      });
      range.insertNode(temp.firstChild || temp);
      sel.removeAllRanges();
      handleInput();
    } else {
      execCommand("removeFormat");
    }
    setFloatingToolbar((prev) => ({ ...prev, visible: false }));
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
    setFloatingToolbar((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div ref={containerRef} className="space-y-1.5 text-xs">
      {label && <label className="block text-slate-300 font-medium">{label}</label>}

      {/* Editor Main Box */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all relative">
        {/* Top Fixed Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border-b border-slate-800 text-slate-400 select-none">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            title="Bold (Ctrl+B)"
            className="p-1 hover:text-white hover:bg-slate-800 rounded font-bold cursor-pointer"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            title="Italic (Ctrl+I)"
            className="p-1 hover:text-white hover:bg-slate-800 rounded italic font-serif cursor-pointer"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand("underline")}
            title="Underline (Ctrl+U)"
            className="p-1 hover:text-white hover:bg-slate-800 rounded underline cursor-pointer"
          >
            U
          </button>

          <span className="w-px h-3.5 bg-slate-800 mx-0.5" />

          {/* Color Button */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={saveSelection}
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowAnimPicker(false);
              }}
              title="Color Selected Text or Word"
              className="flex items-center gap-1 px-1.5 py-0.5 hover:text-white hover:bg-slate-800 rounded text-[11px] cursor-pointer"
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-slate-600 shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <span>Color</span>
            </button>

            {/* Inline Color Popover */}
            {showColorPicker && (
              <div className="absolute top-7 left-0 z-50 p-2.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-52 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <span className="text-[10px] text-slate-400 block font-medium">Select text & color:</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleApplyColor(c)}
                      className="w-5 h-5 rounded-md border border-slate-700 hover:scale-120 transition-transform cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-1 pt-1 border-t border-slate-800">
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    placeholder="#HEX"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyColor(customHex)}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-medium cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Animation Button */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={saveSelection}
              onClick={() => {
                setShowAnimPicker(!showAnimPicker);
                setShowColorPicker(false);
              }}
              title="Animate Selected Word or Letter"
              className="flex items-center gap-1 px-1.5 py-0.5 hover:text-emerald-300 hover:bg-slate-800 rounded text-[11px] text-emerald-400 cursor-pointer"
            >
              <span>✨ Anim</span>
            </button>

            {/* Inline Animation Popover */}
            {showAnimPicker && (
              <div className="absolute top-7 left-0 z-50 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-48 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <span className="text-[10px] text-slate-400 block font-medium px-1">
                  Animate selected word/letter:
                </span>
                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5">
                  {WORD_ANIMATIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleApplyAnimation(a.id)}
                      className="w-full text-left px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{a.label}</span>
                      {a.id !== "none" && <span className="text-emerald-400 text-[10px]">✨</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="w-px h-3.5 bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={handleOpenLinkModal}
            title="Insert Link"
            className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
          >
            🔗 Link
          </button>

          <button
            type="button"
            onClick={handleClearFormat}
            title="Clear formatting on selection"
            className="p-1 hover:text-white hover:bg-slate-800 rounded text-[10px] ml-auto text-slate-500 cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* ContentEditable Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          style={{ minHeight }}
          className="p-3 text-slate-100 text-xs focus:outline-hidden leading-relaxed custom-rich-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
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
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Floating Toolbar on Text Selection (BUG-4 Feature) */}
      {mounted &&
        floatingToolbar.visible &&
        typeof document !== "undefined" &&
        document.body &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${floatingToolbar.top}px`,
              left: `${floatingToolbar.left}px`,
              zIndex: 99999,
            }}
            className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl px-2 py-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-75 select-none"
            onMouseDown={(e) => e.preventDefault()} // Keep selection active!
          >
            <button
              type="button"
              onClick={() => execCommand("bold")}
              className="w-6 h-6 flex items-center justify-center font-bold text-slate-200 hover:bg-slate-800 rounded text-xs cursor-pointer"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCommand("italic")}
              className="w-6 h-6 flex items-center justify-center italic font-serif text-slate-200 hover:bg-slate-800 rounded text-xs cursor-pointer"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCommand("underline")}
              className="w-6 h-6 flex items-center justify-center underline text-slate-200 hover:bg-slate-800 rounded text-xs cursor-pointer"
              title="Underline"
            >
              U
            </button>

            <span className="w-px h-3.5 bg-slate-700" />

            {/* Floating Color Swatches */}
            <div className="flex items-center gap-1">
              {PRESET_COLORS.slice(0, 5).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleApplyColor(color)}
                  className="w-4 h-4 rounded-full border border-slate-700 hover:scale-125 transition-transform cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={`Color ${color}`}
                />
              ))}
            </div>

            <span className="w-px h-3.5 bg-slate-700" />

            {/* Quick Word Animation Buttons */}
            <button
              type="button"
              onClick={() => handleApplyAnimation("bounce")}
              title="Bounce Animation"
              className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              Bounce
            </button>
            <button
              type="button"
              onClick={() => handleApplyAnimation("pulse")}
              title="Pulse Animation"
              className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              Pulse
            </button>
            <button
              type="button"
              onClick={() => handleApplyAnimation("shake")}
              title="Shake Animation"
              className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              Shake
            </button>

            <span className="w-px h-3.5 bg-slate-700" />

            <button
              type="button"
              onClick={handleClearFormat}
              className="text-slate-400 hover:text-rose-400 text-xs px-1 cursor-pointer"
              title="Clear formatting"
            >
              ✕
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

export default RichTextField;

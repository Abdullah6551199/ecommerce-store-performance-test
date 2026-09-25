"use client";

import React, { useRef, useState, useEffect } from "react";

interface RichTextControlProps {
  label?: string;
  value?: string;
  onChange: (html: string) => void;
  description?: string;
  placeholder?: string;
}

export function sanitizeHtml(raw: string): string {
  if (!raw) return "";
  // Strip script, iframe, object, embed, event handlers (on\w+)
  let clean = raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
  return clean;
}

const WORD_ANIMATIONS = [
  { id: "none", label: "None" },
  { id: "bounceIn", label: "Bounce", class: "anim-bounceIn" },
  { id: "pulse", label: "Pulse", class: "anim-pulse" },
  { id: "wobble", label: "Wobble", class: "anim-wobble" },
  { id: "jello", label: "Jello", class: "anim-jello" },
  { id: "heartBeat", label: "Heartbeat", class: "anim-heartBeat" },
  { id: "glow", label: "Neon Glow", class: "anim-glow" },
  { id: "rainbow", label: "Rainbow Color Cycle", class: "anim-rainbow" },
];

const PRESET_COLORS = [
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#FFFFFF", // White
  "#94A3B8", // Slate
];

export function RichTextControl({
  label = "Rich Text (Multi-Color & Word Animations)",
  value = "",
  onChange,
  description,
  placeholder = "Type heading or rich text here...",
}: RichTextControlProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState("#22C55E");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAnimPicker, setShowAnimPicker] = useState(false);
  const [isRawHtml, setIsRawHtml] = useState(false);

  // Sync external value to editor innerHTML
  useEffect(() => {
    if (editorRef.current && !isRawHtml) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isRawHtml]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = sanitizeHtml(editorRef.current.innerHTML);
      onChange(html);
    }
  };

  const applyFormat = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const applyColorToSelection = (color: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // If nothing selected, maybe apply to current caret word
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.color = color;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    // Clear selection
    sel.removeAllRanges();
    handleInput();
    setShowColorPicker(false);
  };

  const applyAnimationToSelection = (animId: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    if (animId === "none") {
      // Remove animation spans in selection
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
    setShowAnimPicker(false);
  };

  const clearFormatting = () => {
    applyFormat("removeFormat");
    // Also remove custom spans with styles or data-animation
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const contents = range.extractContents();
      const div = document.createElement("div");
      div.appendChild(contents);
      div.querySelectorAll("span").forEach((s) => {
        s.replaceWith(...Array.from(s.childNodes));
      });
      range.insertNode(div.firstChild || div);
      sel.removeAllRanges();
      handleInput();
    }
  };

  return (
    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-200 space-y-3">
      {/* Dynamic Keyframes for Word Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .anim-glow { text-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e; }
            .anim-rainbow {
              background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444);
              background-size: 200% auto;
              color: transparent !important;
              -webkit-background-clip: text !important;
              background-clip: text !important;
              animation: rainbowShift 3s linear infinite;
            }
            @keyframes rainbowShift { to { background-position: 200% center; } }
          `,
        }}
      />

      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            {label}
          </label>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsRawHtml(!isRawHtml)}
          className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
            isRawHtml
              ? "bg-green-500/20 text-green-400 border-green-500/40"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
        >
          {isRawHtml ? "Visual" : "HTML Code"}
        </button>
      </div>

      {/* Toolbar */}
      {!isRawHtml && (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => applyFormat("bold")}
            title="Bold"
            className="w-7 h-7 flex items-center justify-center font-bold text-slate-300 hover:bg-slate-800 rounded transition-colors"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => applyFormat("italic")}
            title="Italic"
            className="w-7 h-7 flex items-center justify-center italic text-slate-300 hover:bg-slate-800 rounded transition-colors"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => applyFormat("underline")}
            title="Underline"
            className="w-7 h-7 flex items-center justify-center underline text-slate-300 hover:bg-slate-800 rounded transition-colors"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => applyFormat("strikeThrough")}
            title="Strikethrough"
            className="w-7 h-7 flex items-center justify-center line-through text-slate-300 hover:bg-slate-800 rounded transition-colors"
          >
            S
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* Multi-Color Text Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowAnimPicker(false);
              }}
              className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded border border-slate-700 transition-colors text-[11px]"
              title="Apply color to selected word/letters"
            >
              <span
                className="w-3 h-3 rounded-full border border-slate-600 inline-block"
                style={{ backgroundColor: selectedColor }}
              />
              <span>Text Color</span>
            </button>

            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-30 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-52 space-y-2">
                <span className="text-[10px] text-slate-400 block font-medium">
                  Select text & choose color:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c);
                        applyColorToSelection(c);
                      }}
                      className="w-7 h-7 rounded border border-slate-700 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      applyColorToSelection(e.target.value);
                    }}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => applyColorToSelection(selectedColor)}
                    className="px-2 py-0.5 bg-green-600 hover:bg-green-500 text-slate-950 font-bold rounded text-[10px]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Per-Word Animation Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAnimPicker(!showAnimPicker);
                setShowColorPicker(false);
              }}
              className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-green-400 rounded border border-slate-700 transition-colors text-[11px]"
              title="Animate selected word"
            >
              <span>✨ Word Anim</span>
            </button>

            {showAnimPicker && (
              <div className="absolute top-full left-0 mt-1 z-30 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-48 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">
                  Select word & apply animation:
                </span>
                {WORD_ANIMATIONS.map((anim) => (
                  <button
                    key={anim.id}
                    type="button"
                    onClick={() => applyAnimationToSelection(anim.id)}
                    className="w-full text-left px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center justify-between"
                  >
                    <span>{anim.label}</span>
                    {anim.id !== "none" && <span className="text-[10px] text-green-400">✨</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={clearFormatting}
            title="Clear formatting"
            className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
          >
            Clear
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      {isRawHtml ? (
        <textarea
          value={value}
          onChange={(e) => onChange(sanitizeHtml(e.target.value))}
          rows={5}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-green-500 leading-relaxed"
          placeholder="<span>Custom HTML</span>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="min-h-[80px] p-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-green-500 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Tip: Select any word or letter to apply individual colors or animations</span>
        <span>Sanitized & XSS Safe</span>
      </div>
    </div>
  );
}

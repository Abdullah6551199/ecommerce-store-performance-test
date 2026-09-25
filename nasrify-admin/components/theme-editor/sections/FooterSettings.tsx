"use client";

import React from "react";

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface FooterSettingsProps {
  settings: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}

export function FooterSettings({ settings, onChange }: FooterSettingsProps) {
  const logo_text = settings.logo_text ?? "Nasrify Store";
  const copyright = settings.copyright ?? "© 2026 Nasrify Inc. All rights reserved.";
  const newsletter_signup = settings.newsletter_signup ?? true;
  const variant = settings.variant ?? "standard";

  const columns: FooterColumn[] = Array.isArray(settings.columns)
    ? settings.columns
    : [
        {
          title: "Shop",
          links: [
            { label: "All Products", url: "/products" },
            { label: "Featured", url: "/featured" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About Us", url: "/about" },
            { label: "Contact", url: "/contact" },
          ],
        },
      ];

  const social_links: SocialLink[] = Array.isArray(settings.social_links)
    ? settings.social_links
    : [
        { platform: "Twitter", url: "https://twitter.com" },
        { platform: "Instagram", url: "https://instagram.com" },
      ];

  const addColumn = () => {
    if (columns.length >= 4) return;
    onChange({
      columns: [
        ...columns,
        {
          title: `Column ${columns.length + 1}`,
          links: [{ label: "New Link", url: "#" }],
        },
      ],
    });
  };

  const updateColumnTitle = (index: number, title: string) => {
    const next = [...columns];
    next[index] = { ...next[index], title };
    onChange({ columns: next });
  };

  const removeColumn = (index: number) => {
    onChange({ columns: columns.filter((_, i) => i !== index) });
  };

  const addLinkToColumn = (colIdx: number) => {
    const next = [...columns];
    const col = next[colIdx];
    if (col.links.length >= 8) return;
    next[colIdx] = {
      ...col,
      links: [...col.links, { label: "Link", url: "#" }],
    };
    onChange({ columns: next });
  };

  const updateLinkInColumn = (colIdx: number, linkIdx: number, patch: Partial<FooterLink>) => {
    const next = [...columns];
    const links = [...next[colIdx].links];
    links[linkIdx] = { ...links[linkIdx], ...patch };
    next[colIdx] = { ...next[colIdx], links };
    onChange({ columns: next });
  };

  const removeLinkFromColumn = (colIdx: number, linkIdx: number) => {
    const next = [...columns];
    next[colIdx] = {
      ...next[colIdx],
      links: next[colIdx].links.filter((_, i) => i !== linkIdx),
    };
    onChange({ columns: next });
  };

  const addSocial = () => {
    if (social_links.length >= 6) return;
    onChange({
      social_links: [
        ...social_links,
        { platform: "Twitter", url: "https://twitter.com" },
      ],
    });
  };

  const updateSocial = (idx: number, patch: Partial<SocialLink>) => {
    const next = [...social_links];
    next[idx] = { ...next[idx], ...patch };
    onChange({ social_links: next });
  };

  const removeSocial = (idx: number) => {
    onChange({ social_links: social_links.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4 text-xs text-slate-300">
      <div>
        <label className="block text-slate-400 font-medium mb-1">Footer Brand / Logo Text</label>
        <input
          type="text"
          value={logo_text}
          onChange={(e) => onChange({ logo_text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Layout Variant</label>
          <select
            value={variant}
            onChange={(e) => onChange({ variant: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366] [&>option]:bg-slate-900 [&>option]:text-slate-100"
          >
            <option value="standard">Standard</option>
            <option value="minimal">Minimal</option>
            <option value="expanded">Expanded</option>
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 cursor-pointer pb-1.5">
            <input
              type="checkbox"
              checked={newsletter_signup}
              onChange={(e) => onChange({ newsletter_signup: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-[#25D366] focus:ring-0"
            />
            <span className="text-slate-300">Newsletter Form</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-slate-400 font-medium mb-1">Copyright Notice</label>
        <input
          type="text"
          value={copyright}
          onChange={(e) => onChange({ copyright: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#25D366]"
        />
      </div>

      {/* Navigation Columns */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-slate-400 font-medium">Columns ({columns.length}/4)</label>
          <button
            type="button"
            onClick={addColumn}
            disabled={columns.length >= 4}
            className="text-[11px] text-[#25D366] hover:text-emerald-300 disabled:opacity-50"
          >
            + Add Column
          </button>
        </div>

        <div className="space-y-3">
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Column Title"
                  value={col.title}
                  onChange={(e) => updateColumnTitle(cIdx, e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 font-medium text-xs focus:outline-none focus:border-[#25D366]"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(cIdx)}
                  className="text-rose-400 hover:text-rose-300 text-[11px]"
                >
                  Delete Col
                </button>
              </div>

              <div className="space-y-1.5 pl-2 border-l border-slate-800">
                {col.links.map((link, lIdx) => (
                  <div key={lIdx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => updateLinkInColumn(cIdx, lIdx, { label: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-[#25D366]"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => updateLinkInColumn(cIdx, lIdx, { url: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none focus:border-[#25D366]"
                    />
                    <button
                      type="button"
                      onClick={() => removeLinkFromColumn(cIdx, lIdx)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addLinkToColumn(cIdx)}
                  className="text-[10px] text-slate-400 hover:text-[#25D366] pt-0.5"
                >
                  + Add Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-slate-400 font-medium">Social Links ({social_links.length}/6)</label>
          <button
            type="button"
            onClick={addSocial}
            disabled={social_links.length >= 6}
            className="text-[11px] text-[#25D366] hover:text-emerald-300 disabled:opacity-50"
          >
            + Add Social
          </button>
        </div>

        <div className="space-y-1.5">
          {social_links.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Platform (e.g. Twitter)"
                value={item.platform}
                onChange={(e) => updateSocial(idx, { platform: e.target.value })}
                className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-[#25D366]"
              />
              <input
                type="text"
                placeholder="URL"
                value={item.url}
                onChange={(e) => updateSocial(idx, { url: e.target.value })}
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-[#25D366]"
              />
              <button
                type="button"
                onClick={() => removeSocial(idx)}
                className="text-slate-500 hover:text-rose-400 text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

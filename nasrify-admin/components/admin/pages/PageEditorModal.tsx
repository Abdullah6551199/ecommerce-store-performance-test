"use client";

import React, { useState, useEffect, useRef } from "react";
import type { EnhancedPageRecord } from "@/lib/cms";
import Toggle from "@/components/ui/Toggle";

interface PageEditorModalProps {
  isOpen: boolean;
  page: EnhancedPageRecord | null;
  onClose: () => void;
  onSave: () => void;
}

export default function PageEditorModal({
  isOpen,
  page,
  onClose,
  onSave,
}: PageEditorModalProps): React.JSX.Element | null {
  const isEditing = Boolean(page);
  const isCore = Boolean(page?.isDefault);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState("standard");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [showInHeader, setShowInHeader] = useState(false);
  const [showInFooter, setShowInFooter] = useState(true);
  const [accessLevel, setAccessLevel] = useState<"public" | "auth">("public");
  const [isPublished, setIsPublished] = useState(true);

  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "sections">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form
  useEffect(() => {
    if (page) {
      setTitle(page.title || "");
      setSlug(page.slug || "");
      setTemplate(page.template || "standard");
      setContent(page.cleanContent || "");
      setSeoTitle(page.seoTitle || "");
      setSeoDescription(page.seoDescription || "");
      setOgImage(page.ogImage || "");
      setShowInHeader(Boolean(page.showInHeader));
      setShowInFooter(Boolean(page.showInFooter));
      setAccessLevel(page.accessLevel || "public");
      setIsPublished(Boolean(page.isPublished));
    } else {
      setTitle("");
      setSlug("");
      setTemplate("standard");
      setContent(`<h1>Page Title</h1>\n<p>Write your page content here...</p>`);
      setSeoTitle("");
      setSeoDescription("");
      setOgImage("");
      setShowInHeader(false);
      setShowInFooter(true);
      setAccessLevel("public");
      setIsPublished(true);
    }
    setErrorMessage(null);
    setActiveTab("edit");
  }, [page, isOpen]);

  if (!isOpen) return null;

  // Auto slugify when title changes on new pages
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !isCore) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Content formatting toolbar helper
  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => `${prev}\n${tagStart}${tagEnd}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${tagStart}${selected || "text"}${tagEnd}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tagStart.length, start + tagStart.length + (selected.length || 4));
    }, 0);
  };

  const insertSnippet = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => `${prev}\n\n${snippet}`);
      setActiveTab("edit");
      return;
    }
    const start = el.selectionStart;
    const newContent = content.substring(0, start) + `\n\n${snippet}\n\n` + content.substring(start);
    setContent(newContent);
    setActiveTab("edit");
  };

  // Image Upload handler to R2
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "pages");

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as any;
      if (!res.ok || !data.success || !data.data?.url) {
        throw new Error(data.error || "Failed to upload image.");
      }

      const imgUrl = data.data.url;
      insertSnippet(`<img src="${imgUrl}" alt="${file.name.replace(/\.[^/.]+$/, "")}" class="my-6 rounded-2xl w-full object-cover shadow-md" />`);
    } catch (err: any) {
      alert(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Pre-built section snippets
  const PREBUILT_SECTIONS = [
    {
      id: "hero",
      title: "Hero Section",
      desc: "Vibrant high-contrast hero banner with heading, subheading, and CTA button.",
      icon: "🌟",
      snippet: `<section class="py-16 px-8 rounded-3xl bg-gradient-to-br from-[#25D366] via-[#1EA855] to-[#18181B] text-white text-center my-8 shadow-xl">
  <h1 class="text-4xl sm:text-5xl font-black tracking-tight mb-4">Engineered for Human Velocity</h1>
  <p class="text-base sm:text-lg text-zinc-200 max-w-2xl mx-auto mb-8">Uncompromising technical activewear and marathon footwear crafted for dynamic peak performance.</p>
  <a href="/shop" class="inline-block px-8 py-3.5 rounded-xl bg-white text-[#18181B] font-extrabold text-sm shadow-md hover:bg-[#F4F4F5] transition">Explore Latest Releases</a>
</section>`,
    },
    {
      id: "text-image",
      title: "Text + Image (2-Column)",
      desc: "Split section with descriptive copy, bullet points, and high-res feature image.",
      icon: "🖼️",
      snippet: `<section class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-12">
  <div>
    <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">Precision Engineering & Craft</h2>
    <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">Every seam, bond, and polymer weave is tested across hundreds of competitive training miles to eliminate chafing and optimize aerodynamics.</p>
    <ul class="space-y-2 text-sm text-slate-700 dark:text-slate-300">
      <li>✓ 4-Way elastic memory weaves</li>
      <li>✓ Rapid sweat moisture evaporation</li>
      <li>✓ Seamless bonded hems for zero friction</li>
    </ul>
  </div>
  <div>
    <img src="/images/placeholder.svg" alt="Precision Craft" class="w-full rounded-3xl object-cover shadow-md border border-[#E4E4E7] dark:border-zinc-800/40" />
  </div>
</section>`,
    },
    {
      id: "3-cards",
      title: "3-Column Cards",
      desc: "Card trio highlighting key product benefits, core pillars, or service guarantees.",
      icon: "🃏",
      snippet: `<section class="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
  <div class="p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/50 bg-white dark:bg-[#09090B] shadow-sm">
    <div class="text-3xl mb-3">🚀</div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Maximum Kinetic Return</h3>
    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Aerodynamic contours engineered for rapid split-second responsiveness.</p>
  </div>
  <div class="p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/50 bg-white dark:bg-[#09090B] shadow-sm">
    <div class="text-3xl mb-3">🛡️</div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Tested Durability</h3>
    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Triple-stitched stress contours built to withstand rigorous daily workouts.</p>
  </div>
  <div class="p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/50 bg-white dark:bg-[#09090B] shadow-sm">
    <div class="text-3xl mb-3">🌱</div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Sustainable Threads</h3>
    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Crafted with certified recycled ocean polymers without sacrificing performance.</p>
  </div>
</section>`,
    },
    {
      id: "team-grid",
      title: "Team Grid",
      desc: "Grid showcasing company founders, master trainers, or designer profiles.",
      icon: "👥",
      snippet: `<section class="my-12">
  <h2 class="text-2xl font-extrabold text-center text-slate-900 dark:text-white mb-8">Meet Our Leadership Team</h2>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <div class="text-center p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B]">
      <div class="w-16 h-16 mx-auto rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/60 text-xl flex items-center justify-center font-bold text-[#25D366] mb-3">JD</div>
      <h3 class="font-bold text-sm text-slate-900 dark:text-white">Jane Doe</h3>
      <p class="text-[11px] text-[#25D366] dark:text-zinc-400 font-semibold mb-1">Founder & Lead Designer</p>
      <p class="text-xs text-slate-500">Former competitive triathlete passionate about ergonomics.</p>
    </div>
    <div class="text-center p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B]">
      <div class="w-16 h-16 mx-auto rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/60 text-xl flex items-center justify-center font-bold text-[#25D366] mb-3">AS</div>
      <h3 class="font-bold text-sm text-slate-900 dark:text-white">Alex Smith</h3>
      <p class="text-[11px] text-[#25D366] dark:text-zinc-400 font-semibold mb-1">Biomechanics Director</p>
      <p class="text-xs text-slate-500">Over a decade optimizing thermal heat reduction in sports.</p>
    </div>
    <div class="text-center p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B]">
      <div class="w-16 h-16 mx-auto rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/60 text-xl flex items-center justify-center font-bold text-[#25D366] mb-3">EL</div>
      <h3 class="font-bold text-sm text-slate-900 dark:text-white">Emma Lin</h3>
      <p class="text-[11px] text-[#25D366] dark:text-zinc-400 font-semibold mb-1">VP of Global Logistics</p>
      <p class="text-xs text-slate-500">Delivering expedited courier orders to athletes worldwide.</p>
    </div>
  </div>
</section>`,
    },
    {
      id: "testimonials",
      title: "Testimonial Card",
      desc: "Large quoted testimonial block with star rating and customer attribution.",
      icon: "💬",
      snippet: `<section class="my-12 p-8 rounded-3xl bg-[#F4F4F5] dark:bg-[#25033d] border border-[#E4E4E7]/60 dark:border-zinc-800/50 text-center">
  <div class="text-amber-400 text-lg mb-3">★★★★★</div>
  <blockquote class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white max-w-2xl mx-auto italic mb-4">
    &quot;ApexStore delivers the highest quality technical gear I have ever worn during marathon training. Simply unmatched comfort.&quot;
  </blockquote>
  <p class="text-xs font-black text-[#25D366] dark:text-[#DCFCE7] uppercase tracking-wider">— Marcus Sterling, Ultra Runner</p>
</section>`,
    },
    {
      id: "stats-row",
      title: "Stats Row (4 Metrics)",
      desc: "Four punchy metric counters showcasing scale, rating, and customer happiness.",
      icon: "📊",
      snippet: `<section class="grid grid-cols-2 sm:grid-cols-4 gap-4 my-10 text-center">
  <div class="p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B]">
    <p class="text-3xl sm:text-4xl font-black text-[#25D366] dark:text-[#DCFCE7]">50K+</p>
    <p class="text-xs text-slate-500 mt-1 font-semibold">Active Athletes</p>
  </div>
  <div class="p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B]">
    <p class="text-3xl sm:text-4xl font-black text-[#25D366] dark:text-[#DCFCE7]">99.8%</p>
    <p class="text-xs text-slate-500 mt-1 font-semibold">On-Time Dispatch</p>
  </div>
  <div class="p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B]">
    <p class="text-3xl sm:text-4xl font-black text-[#25D366] dark:text-[#DCFCE7]">30-Day</p>
    <p class="text-xs text-slate-500 mt-1 font-semibold">Money-Back Guarantee</p>
  </div>
  <div class="p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B]">
    <p class="text-3xl sm:text-4xl font-black text-[#25D366] dark:text-[#DCFCE7]">4.9 / 5</p>
    <p class="text-xs text-slate-500 mt-1 font-semibold">Average Rating</p>
  </div>
</section>`,
    },
    {
      id: "cta-banner",
      title: "CTA Banner",
      desc: "Compelling call to action block with purple gradient and primary link button.",
      icon: "🚀",
      snippet: `<section class="my-12 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#25D366] via-[#1EA855] to-[#18181B] text-white text-center shadow-xl">
  <h2 class="text-2xl sm:text-3xl font-black tracking-tight mb-3">Ready to Elevate Your Training?</h2>
  <p class="text-sm text-zinc-200 max-w-xl mx-auto mb-6">Join thousands of competitive athletes training in ApexStore technical apparel.</p>
  <a href="/shop" class="inline-block px-6 py-3 rounded-xl bg-white text-[#18181B] font-extrabold text-xs shadow-md hover:bg-[#F4F4F5] transition">Shop New Releases</a>
</section>`,
    },
    {
      id: "faq-accordion",
      title: "FAQ Accordion",
      desc: "Collapsible HTML5 details/summary questions and answers.",
      icon: "❓",
      snippet: `<section class="my-12 space-y-3">
  <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Common Questions</h2>
  <details class="p-5 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B] cursor-pointer">
    <summary class="font-bold text-slate-900 dark:text-white text-sm">How long does standard delivery take?</summary>
    <p class="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Domestic ground orders arrive within 3 to 5 business days with live courier tracking updates.</p>
  </details>
  <details class="p-5 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-white dark:bg-[#09090B] cursor-pointer">
    <summary class="font-bold text-slate-900 dark:text-white text-sm">What is your exchange and return policy?</summary>
    <p class="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">We provide a 30-day money-back guarantee on all unworn items with original technical tags intact.</p>
  </details>
</section>`,
    },
    {
      id: "custom-html",
      title: "Custom HTML Block",
      desc: "Empty HTML container ready for custom code, scripts, or embeds.",
      icon: "💻",
      snippet: `<div class="custom-block my-8 p-6 rounded-3xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#09090B]">
  <!-- Insert custom code, widgets, or embeds below -->
  <p class="text-sm font-semibold">Custom HTML Content Area</p>
</div>`,
    },
  ];

  const handleTemplateChange = (tpl: string) => {
    setTemplate(tpl);
    if (content.trim() === "" || content === `<h1>Page Title</h1>\n<p>Write your page content here...</p>`) {
      switch (tpl) {
        case "blank":
          setContent("");
          break;
        case "about":
          setContent(PREBUILT_SECTIONS.find((s) => s.id === "hero")?.snippet + "\n\n" + PREBUILT_SECTIONS.find((s) => s.id === "3-cards")?.snippet + "\n\n" + PREBUILT_SECTIONS.find((s) => s.id === "team-grid")?.snippet);
          break;
        case "contact":
          setContent(`<h1>Contact ApexStore</h1>\n<p>Reach out to our customer care team via email at support@apexstore.com.</p>\n\n` + PREBUILT_SECTIONS.find((s) => s.id === "faq-accordion")?.snippet);
          break;
        case "faq":
          setContent(PREBUILT_SECTIONS.find((s) => s.id === "faq-accordion")?.snippet || "");
          break;
        case "custom":
          setContent(`<div class="page-container">\n  <!-- Custom HTML Page Canvas -->\n</div>`);
          break;
        default:
          setContent(`<h1>${title || "Page Title"}</h1>\n<p>Write your detailed page content here with rich typography and embedded images.</p>`);
      }
    }
  };

  const handleSave = async (publishStatus?: boolean) => {
    if (!title.trim()) {
      setErrorMessage("Page title is required.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Page slug is required.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        template,
        content,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        ogImage: ogImage.trim() || null,
        showInHeader,
        showInFooter,
        accessLevel,
        isPublished: publishStatus !== undefined ? publishStatus : isPublished,
      };

      const url = isEditing ? `/api/admin/pages/${page!.id}` : "/api/admin/pages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save page");
      }

      onSave();
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const pagePath =
    page?.slug === "home"
      ? "/"
      : page?.slug === "about"
      ? "/about"
      : page?.slug === "contact"
      ? "/contact"
      : page?.slug === "privacy-policy"
      ? "/privacy-policy"
      : page?.slug === "terms"
      ? "/terms"
      : page?.slug === "returns"
      ? "/returns"
      : page?.slug === "shipping"
      ? "/shipping"
      : page?.slug === "faq"
      ? "/faq"
      : `/pages/${slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7] dark:border-zinc-800/40 bg-[#F4F4F5]/50 dark:bg-[#18181B]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#25D366] dark:text-[#DCFCE7] flex items-center justify-center font-bold text-lg">
              📄
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#18181B] dark:text-white">
                {isEditing ? `Edit: ${page?.title}` : "Create New Custom Page"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400/80">
                {isCore ? "Core Protected Page" : "Custom Storefront Page"} • Route:{" "}
                <span className="font-mono text-[#25D366] dark:text-[#1EA855]">{pagePath}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <a
                href={pagePath}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#25D366] dark:text-[#DCFCE7] bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-zinc-700 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/50 transition"
              >
                <span>Live View ↗</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#18181B]/40 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-bold text-sm">
              ✕
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Page Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                Page Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Sustainability Mission"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/30 dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 text-xs font-mono text-slate-400 bg-[#DCFCE7]/50 dark:bg-[#18181B]/50 border border-r-0 border-[#E4E4E7] dark:border-zinc-800/80 rounded-l-xl">
                  /
                </span>
                <input
                  type="text"
                  value={slug}
                  disabled={isCore}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="sustainability"
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-r-xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/30 dark:bg-[#18181B] text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-[#18181B]/40 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                Layout Template
              </label>
              <select
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/30 dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
              >
                <option value="blank">Blank (Empty Canvas)</option>
                <option value="standard">Standard Content (Heading + Text)</option>
                <option value="about">About Us Style (Hero + Sections)</option>
                <option value="contact">Contact Style (Form + Info)</option>
                <option value="faq">FAQ Style (Accordion)</option>
                <option value="custom">Custom HTML (Code Editor)</option>
              </select>
            </div>
          </div>

          {/* Content Editor Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Page Content &amp; Sections
              </label>

              {/* Edit / Pre-built Sections / Preview Switcher */}
              <div className="flex items-center gap-1 bg-[#DCFCE7]/60 dark:bg-[#18181B]/60 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === "edit"
                      ? "bg-white dark:bg-[#18181B] text-[#25D366] dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sections")}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === "sections"
                      ? "bg-white dark:bg-[#18181B] text-[#25D366] dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  + Add Sections
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === "preview"
                      ? "bg-white dark:bg-[#18181B] text-[#25D366] dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {activeTab === "sections" ? (
              <div className="p-4 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/30 dark:bg-[#18181B]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-white">
                    Pre-built Section Library (Click to Insert)
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Snippets are appended to your active content
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PREBUILT_SECTIONS.map((sec) => (
                    <div
                      key={sec.id}
                      onClick={() => insertSnippet(sec.snippet)}
                      className="p-4 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/60 bg-white dark:bg-[#09090B] hover:border-[#25D366] hover:shadow-md hover:scale-[1.01] cursor-pointer transition flex flex-col justify-between space-y-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sec.icon}</span>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#25D366] dark:group-hover:text-[#DCFCE7] transition">
                          {sec.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400/70 line-clamp-2">
                        {sec.desc}
                      </p>
                      <div className="pt-2 text-right">
                        <span className="text-[11px] font-bold text-[#25D366] dark:text-[#1EA855]">
                          Insert Section &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === "edit" ? (
              <div className="rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/80 overflow-hidden bg-white dark:bg-[#09090B]">
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F4F4F5]/50 dark:bg-[#18181B]/60 border-b border-[#E4E4E7] dark:border-zinc-800/40 text-xs">
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h1>", "</h1>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-black"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h2>", "</h2>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-extrabold"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h3>", "</h3>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-bold"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<h4>", "</h4>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-bold"
                    title="Heading 4"
                  >
                    H4
                  </button>

                  <span className="w-px h-4 bg-[#DCFCE7] dark:bg-[#15803D] mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting("<p>", "</p>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-semibold"
                    title="Paragraph"
                  >
                    ¶
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<strong>", "</strong>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-bold"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<em>", "</em>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] italic font-bold"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<u>", "</u>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] underline font-bold"
                    title="Underline"
                  >
                    U
                  </button>

                  <span className="w-px h-4 bg-[#DCFCE7] dark:bg-[#15803D] mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting("<ul>\n  <li>", "</li>\n</ul>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<ol>\n  <li>", "</li>\n</ol>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Numbered List"
                  >
                    1. List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<blockquote>\n  ", "\n</blockquote>")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Blockquote"
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n<hr class=\"my-8 border-[#E4E4E7] dark:border-zinc-800\" />\n")}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Divider"
                  >
                    Divider
                  </button>

                  <span className="w-px h-4 bg-[#DCFCE7] dark:bg-[#15803D] mx-1" />

                  {/* Link */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter Link URL:", "https://");
                      if (url) insertFormatting(`<a href="${url}" class="text-[#25D366] underline hover:text-[#1EA855]">`, "</a>");
                    }}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Insert Link"
                  >
                    🔗 Link
                  </button>

                  {/* Button with URL */}
                  <button
                    type="button"
                    onClick={() => {
                      const btnUrl = prompt("Button Link URL:", "/shop");
                      const btnText = prompt("Button Label:", "Shop Now") || "Shop Now";
                      if (btnUrl) {
                        insertSnippet(`<a href="${btnUrl}" class="inline-block px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white font-bold text-xs shadow-md transition my-4">${btnText}</a>`);
                      }
                    }}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Insert Button"
                  >
                    🔘 Button
                  </button>

                  {/* Video Embed */}
                  <button
                    type="button"
                    onClick={() => {
                      const videoUrl = prompt("Enter YouTube or Vimeo embed URL (or Video ID):", "https://www.youtube.com/embed/dQw4w9WgXcQ");
                      if (videoUrl) {
                        insertSnippet(`<div class="aspect-video w-full rounded-2xl overflow-hidden my-6 shadow-md"><iframe src="${videoUrl}" class="w-full h-full border-0" allowfullscreen></iframe></div>`);
                      }
                    }}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Embed Video"
                  >
                    🎬 Video
                  </button>

                  {/* Table */}
                  <button
                    type="button"
                    onClick={() => {
                      insertSnippet(`<table class="w-full my-6 text-sm border border-[#E4E4E7] dark:border-zinc-800 rounded-xl overflow-hidden">
  <thead class="bg-[#DCFCE7] dark:bg-[#18181B]/40 text-xs uppercase font-bold text-[#18181B] dark:text-white">
    <tr><th class="p-3 text-left">Feature</th><th class="p-3 text-left">Standard</th><th class="p-3 text-left">Pro</th></tr>
  </thead>
  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 dark:divide-zinc-200 dark:divide-zinc-800">
    <tr><td class="p-3">Weight</td><td class="p-3">180g</td><td class="p-3">140g Ultra</td></tr>
    <tr><td class="p-3">Water Repellent</td><td class="p-3">DWR Basic</td><td class="p-3">HydroPro 3.0</td></tr>
  </tbody>
</table>`);
                    }}
                    className="px-2 py-1 rounded hover:bg-[#DCFCE7]/50 dark:hover:bg-[#18181B] font-medium"
                    title="Insert Table"
                  >
                    📊 Table
                  </button>

                  {/* Image Upload / URL */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-2.5 py-1 rounded bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#25D366] dark:text-[#DCFCE7] font-bold hover:bg-[#DCFCE7] transition"
                    title="Upload image to Cloudflare R2"
                  >
                    {isUploadingImage ? "Uploading..." : "📷 Upload Image"}
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="w-full p-4 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 bg-transparent resize-y focus:outline-none"
                  placeholder="<h1>Heading</h1><p>Your HTML content...</p>"
                />
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/20 dark:bg-[#09090B] min-h-[350px] max-h-[450px] overflow-y-auto prose dark:prose-invert max-w-none text-sm">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            )}
          </div>

          {/* SEO & Metadata Section */}
          <div className="p-5 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-[#F4F4F5]/30 dark:bg-[#18181B]/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-white flex items-center gap-1.5">
              <span>🔍</span> SEO &amp; Social Graph Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  Meta Title ({seoTitle.length}/60 chars)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Sustainability Mission | ApexStore"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#09090B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">
                  Open Graph (OG) Image URL
                </label>
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#09090B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">
                Meta Description ({seoDescription.length}/160 chars)
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                placeholder="Summary snippet displayed in search engine results and social card previews..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#09090B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#25D366] resize-none"
              />
            </div>
          </div>

          {/* Visibility, Navigation & Access Level Toggles */}
          <div className="p-5 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/40 bg-[#F4F4F5]/30 dark:bg-[#18181B]/30 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-white">
              Navigation &amp; Access Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              {/* Published Toggle */}
              <Toggle
                size="sm"
                checked={isPublished}
                onChange={setIsPublished}
                label="Published on Storefront"
              />

              {/* Show in Header Menu */}
              <Toggle
                size="sm"
                checked={showInHeader}
                onChange={setShowInHeader}
                label="Show in Header Navigation"
              />

              {/* Show in Footer */}
              <Toggle
                size="sm"
                checked={showInFooter}
                onChange={setShowInFooter}
                label="Show in Footer Links"
              />

              {/* Access Level */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Access:</span>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as "public" | "auth")}
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#09090B] text-slate-900 dark:text-white"
                >
                  <option value="public">Public</option>
                  <option value="auth">Logged-in only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E4E4E7] dark:border-zinc-800/40 bg-[#F4F4F5]/50 dark:bg-[#18181B]/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-[#E4E4E7] dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#18181B]/40 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#09090B] text-slate-700 dark:text-slate-300 hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/40 transition disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#25D366] hover:bg-[#1EA855] text-white shadow-md shadow-[#25D366]/20 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Publish Page"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTenantTheme, SCHOOL_PRESETS } from "@/components/ThemeProvider";
import {
  Palette,
  Check,
  RefreshCw,
  Sparkles,
  School,
  Eye,
  Wallpaper,
  Moon,
  Sun,
  Layers,
  Image as ImageIcon,
  Grid,
  Radio,
  Sliders,
  ExternalLink,
  Laptop,
  Tablet,
  CheckCircle2,
  Tv,
} from "lucide-react";

const CURATED_CAMPUS_WALLPAPERS = [
  {
    name: "Classic University Quad",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
  },
  {
    name: "Modern Science & High School",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80",
  },
  {
    name: "Grand Academic Library",
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=80",
  },
  {
    name: "High-Tech Innovation Hub",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80",
  },
];

export default function WhiteLabelBrandingPage() {
  const {
    theme,
    schoolName,
    logoUrl,
    motto,
    updateTheme,
    updateBranding,
    applySchoolPreset,
  } = useTenantTheme();

  // Institution State
  const [formName, setFormName] = useState(schoolName);
  const [formLogo, setFormLogo] = useState(logoUrl);
  const [formMotto, setFormMotto] = useState(motto);

  // Color Palette
  const [primaryColor, setPrimaryColor] = useState(theme.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.secondary);
  const [accentColor, setAccentColor] = useState(theme.accent);
  const [bgColor, setBgColor] = useState(theme.bg || "#090D16");

  // Dashboard Background (Part 1 in user's request)
  const [dashboardBgType, setDashboardBgType] = useState<
    "midnight" | "wallpaper" | "mesh" | "grid" | "aurora" | "oled"
  >(
    (theme.dashboardBgType as any) ||
      (theme.bgStyle === "custom_wallpaper" ? "wallpaper" : (theme.bgStyle as any)) ||
      "midnight"
  );
  const [dashboardBgImage, setDashboardBgImage] = useState(
    theme.dashboardBgImage ||
      theme.bgImageUrl ||
      CURATED_CAMPUS_WALLPAPERS[0].url
  );
  const [dashboardBgOverlay, setDashboardBgOverlay] = useState(
    typeof theme.dashboardBgOverlay === "number" ? theme.dashboardBgOverlay : 0.90
  );
  const [dashboardBgBlur, setDashboardBgBlur] = useState(
    typeof theme.dashboardBgBlur === "number" ? theme.dashboardBgBlur : 0
  );

  // Login Page Background (Part 2 in user's request)
  const [loginLayout, setLoginLayout] = useState<"split" | "center">(
    theme.loginLayout || "split"
  );
  const [loginBgType, setLoginBgType] = useState<
    "wallpaper" | "mesh" | "grid" | "aurora" | "midnight"
  >((theme.loginBgType as any) || "wallpaper");
  const [loginBgImage, setLoginBgImage] = useState(
    theme.loginBgImage ||
      theme.dashboardBgImage ||
      CURATED_CAMPUS_WALLPAPERS[1].url
  );
  const [loginBgOverlay, setLoginBgOverlay] = useState(
    typeof theme.loginBgOverlay === "number" ? theme.loginBgOverlay : 0.75
  );
  const [loginBgBlur, setLoginBgBlur] = useState(
    typeof theme.loginBgBlur === "number" ? theme.loginBgBlur : 0
  );

  const [previewTab, setPreviewTab] = useState<"dashboard" | "login" | "kiosk">(
    "dashboard"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle Preset School Selection
  const handleSelectPreset = (presetId: string) => {
    const found = SCHOOL_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setFormName(found.name);
    setFormLogo(found.logo);
    setFormMotto(found.motto);
    setPrimaryColor(found.theme.primary);
    setSecondaryColor(found.theme.secondary);
    setAccentColor(found.theme.accent);
    setBgColor(found.theme.bg);

    setDashboardBgType((found.theme.dashboardBgType as any) || "midnight");
    setDashboardBgImage(found.theme.dashboardBgImage || CURATED_CAMPUS_WALLPAPERS[0].url);
    setDashboardBgOverlay(found.theme.dashboardBgOverlay ?? 0.90);
    setDashboardBgBlur(found.theme.dashboardBgBlur ?? 0);

    setLoginLayout(found.theme.loginLayout || "split");
    setLoginBgType((found.theme.loginBgType as any) || "wallpaper");
    setLoginBgImage(found.theme.loginBgImage || CURATED_CAMPUS_WALLPAPERS[1].url);
    setLoginBgOverlay(found.theme.loginBgOverlay ?? 0.75);
    setLoginBgBlur(found.theme.loginBgBlur ?? 0);

    applySchoolPreset(presetId);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(formName, formLogo, formMotto);
    updateTheme({
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      bg: bgColor,
      bgStyle: dashboardBgType === "wallpaper" ? "custom_wallpaper" : (dashboardBgType as any),
      bgImageUrl: dashboardBgImage,
      dashboardBgType,
      dashboardBgImage,
      dashboardBgOverlay,
      dashboardBgBlur,
      loginLayout,
      loginBgType,
      loginBgImage,
      loginBgOverlay,
      loginBgBlur,
      motto: formMotto,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-brand-secondary" />
            <span>White-Label Theme & Background Layout Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize the dashboard background canvas, login screen showcase, brand colors, and institution assets to pitch and deploy to any school.
          </p>
        </div>

        <Link
          href="/login"
          target="_blank"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition shrink-0"
        >
          <span>Preview Live Login Page</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-secondary" />
        </Link>
      </div>

      {/* ── Section 1: One-Click School Packs (Pitch Ready) ── */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-secondary" />
            <h2 className="text-sm font-bold text-white">One-Click Client School Templates</h2>
          </div>
          <span className="text-[11px] text-slate-400">Click to transform entire branding & layout instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SCHOOL_PRESETS.map((p) => {
            const isSelected = formName === p.name;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between relative ${
                  isSelected
                    ? "bg-brand-primary/20 border-brand-secondary ring-2 ring-brand-secondary/40 shadow-lg text-white"
                    : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: p.theme.primary }}
                  />
                  {isSelected && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-secondary/20 text-brand-secondary">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold line-clamp-1">{p.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{p.motto}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form Controls & Live Studio ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Layout Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* ── PART 1: Dashboard Background Customizer (The Red Area in Image 1) ── */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-bold text-white">
                    1. Dashboard Canvas Background (Red Area 1)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-brand-secondary">
                  Live Canvas Backdrop
                </span>
              </div>

              {/* Background Style Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Dashboard Background Style
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: "midnight", label: "Midnight Slate", icon: Moon },
                    { id: "wallpaper", label: "Campus Photo", icon: ImageIcon },
                    { id: "mesh", label: "Radial Mesh", icon: Sparkles },
                    { id: "grid", label: "Dot Matrix", icon: Grid },
                    { id: "aurora", label: "Aurora Wave", icon: Radio },
                    { id: "oled", label: "Pitch OLED", icon: Layers },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = dashboardBgType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setDashboardBgType(item.id as any);
                          updateTheme({ dashboardBgType: item.id as any });
                        }}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? "bg-brand-primary/20 border-brand-secondary text-white font-bold shadow-md shadow-brand-primary/20"
                            : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wallpaper Specific Controls */}
              {dashboardBgType === "wallpaper" && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Campus Wallpaper Image URL
                    </label>
                    <input
                      type="url"
                      value={dashboardBgImage}
                      onChange={(e) => {
                        setDashboardBgImage(e.target.value);
                        updateTheme({ dashboardBgImage: e.target.value });
                      }}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Curated Presets */}
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
                      Quick Pick Campus Photography:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {CURATED_CAMPUS_WALLPAPERS.map((photo) => (
                        <button
                          key={photo.name}
                          type="button"
                          onClick={() => {
                            setDashboardBgImage(photo.url);
                            updateTheme({ dashboardBgImage: photo.url });
                          }}
                          className={`p-2 rounded-lg border text-left text-[11px] truncate transition ${
                            dashboardBgImage === photo.url
                              ? "bg-brand-primary/20 border-brand-secondary text-white font-semibold"
                              : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400"
                          }`}
                        >
                          {photo.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overlay Darkness Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-300">
                        Dark Overlay Dimmer (Ensures Card Readability)
                      </span>
                      <span className="font-mono text-brand-secondary">
                        {Math.round(dashboardBgOverlay * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="0.95"
                      step="0.05"
                      value={dashboardBgOverlay}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDashboardBgOverlay(val);
                        updateTheme({ dashboardBgOverlay: val });
                      }}
                      className="w-full accent-brand-secondary cursor-pointer"
                    />
                  </div>

                  {/* Blur Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-slate-300">
                        Glassmorphism Blur Filter
                      </span>
                      <span className="font-mono text-brand-secondary">
                        {dashboardBgBlur}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      step="2"
                      value={dashboardBgBlur}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDashboardBgBlur(val);
                        updateTheme({ dashboardBgBlur: val });
                      }}
                      className="w-full accent-brand-secondary cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── PART 2: Login Page Background & Layout (The Red Area in Image 2) ── */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-brand-secondary" />
                  <h3 className="text-sm font-bold text-white">
                    2. Login Screen Background & Layout (Red Area 2)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-brand-accent">
                  Sales Presentation Screen
                </span>
              </div>

              {/* Login Layout Mode: Split vs Center */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Login Screen Layout Architecture
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginLayout("split");
                      updateTheme({ loginLayout: "split" });
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                      loginLayout === "split"
                        ? "bg-brand-primary/20 border-brand-secondary text-white ring-1 ring-brand-secondary/40"
                        : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4 text-brand-secondary" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Split Screen Showcase</div>
                      <div className="text-[10px] text-slate-400">Campus Hero left + Login right</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginLayout("center");
                      updateTheme({ loginLayout: "center" });
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                      loginLayout === "center"
                        ? "bg-brand-primary/20 border-brand-secondary text-white ring-1 ring-brand-secondary/40"
                        : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Centered Glass Card</div>
                      <div className="text-[10px] text-slate-400">Cinematic floating card</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Login Background Style */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Login Background Style
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: "wallpaper", label: "Campus Photo", icon: ImageIcon },
                    { id: "mesh", label: "Radial Mesh", icon: Sparkles },
                    { id: "grid", label: "Dot Matrix", icon: Grid },
                    { id: "aurora", label: "Aurora Wave", icon: Radio },
                    { id: "midnight", label: "Midnight Dark", icon: Moon },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = loginBgType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLoginBgType(item.id as any);
                          updateTheme({ loginBgType: item.id as any });
                        }}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? "bg-brand-primary/20 border-brand-secondary text-white font-bold"
                            : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Wallpaper Controls */}
              {loginBgType === "wallpaper" && (
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Login Wallpaper Image URL
                    </label>
                    <input
                      type="url"
                      value={loginBgImage}
                      onChange={(e) => {
                        setLoginBgImage(e.target.value);
                        updateTheme({ loginBgImage: e.target.value });
                      }}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
                      Quick Pick Campus Photography:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {CURATED_CAMPUS_WALLPAPERS.map((photo) => (
                        <button
                          key={photo.name}
                          type="button"
                          onClick={() => {
                            setLoginBgImage(photo.url);
                            updateTheme({ loginBgImage: photo.url });
                          }}
                          className={`p-2 rounded-lg border text-left text-[11px] truncate transition ${
                            loginBgImage === photo.url
                              ? "bg-brand-primary/20 border-brand-secondary text-white font-semibold"
                              : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400"
                          }`}
                        >
                          {photo.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-300">
                          Login Overlay Dimmer
                        </span>
                        <span className="font-mono text-brand-secondary">
                          {Math.round(loginBgOverlay * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="0.95"
                        step="0.05"
                        value={loginBgOverlay}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setLoginBgOverlay(val);
                          updateTheme({ loginBgOverlay: val });
                        }}
                        className="w-full accent-brand-secondary cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-300">
                          Login Glass Blur
                        </span>
                        <span className="font-mono text-brand-secondary">
                          {loginBgBlur}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="16"
                        step="2"
                        value={loginBgBlur}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setLoginBgBlur(val);
                          updateTheme({ loginBgBlur: val });
                        }}
                        className="w-full accent-brand-secondary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── PART 3: School Identity Parameters & Colors ── */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <School className="w-4 h-4 text-brand-secondary" />
                <span>3. School Identity & Color Tokens</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School Crest / Logo URL
                  </label>
                  <input
                    type="url"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School Motto / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formMotto}
                    onChange={(e) => setFormMotto(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                    placeholder="e.g. Tradition of Excellence, Future of Innovation"
                  />
                </div>
              </div>

              {/* Color Palette */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Brand Theme Colors
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 mb-1">Primary Color</span>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          updateTheme({ primary: e.target.value });
                        }}
                        className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 mb-1">Secondary Accent</span>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value);
                          updateTheme({ secondary: e.target.value });
                        }}
                        className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{secondaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 mb-1">Status Success</span>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          updateTheme({ accent: e.target.value });
                        }}
                        className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{accentColor}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 mb-1">Base Background</span>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => {
                          setBgColor(e.target.value);
                          updateTheme({ bg: e.target.value });
                        }}
                        className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              {savedSuccess ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Branding and layouts saved permanently!</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  Settings persist across page refreshes & user sessions
                </span>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/80 rounded-xl text-xs font-bold text-white transition shadow-lg shadow-brand-primary/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-brand-secondary" />
                <span>Save All Layouts</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 rounded-3xl border border-slate-800 sticky top-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-secondary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Mockup Studio
                </h3>
              </div>

              {/* Preview Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewTab("dashboard")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    previewTab === "dashboard"
                      ? "bg-brand-primary text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("login")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    previewTab === "login"
                      ? "bg-brand-primary text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Login Screen
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("kiosk")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    previewTab === "kiosk"
                      ? "bg-brand-primary text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tablet Kiosk
                </button>
              </div>
            </div>

            {/* ── Mockup 1: Dashboard Canvas Preview ── */}
            {previewTab === "dashboard" && (
              <div
                className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-4 transition-all"
                style={{
                  backgroundColor: bgColor,
                  minHeight: "340px",
                }}
              >
                {/* Background Simulation */}
                {dashboardBgType === "wallpaper" && dashboardBgImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center pointer-events-none"
                    style={{
                      backgroundImage: `url("${dashboardBgImage}")`,
                      filter: dashboardBgBlur > 0 ? `blur(${dashboardBgBlur}px)` : undefined,
                    }}
                  />
                )}
                {dashboardBgType === "mesh" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(at 15% 15%, ${primaryColor}55 0px, transparent 60%), radial-gradient(at 85% 85%, ${secondaryColor}40 0px, transparent 60%)`,
                    }}
                  />
                )}
                {dashboardBgType === "grid" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
                      backgroundSize: "16px 16px",
                    }}
                  />
                )}
                {dashboardBgType === "aurora" && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-80"
                    style={{
                      backgroundImage: `radial-gradient(at 20% 10%, ${primaryColor}60 0px, transparent 50%), radial-gradient(at 80% 80%, ${secondaryColor}45 0px, transparent 50%)`,
                    }}
                  />
                )}
                {dashboardBgType === "wallpaper" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: `rgba(9, 13, 22, ${dashboardBgOverlay})` }}
                  />
                )}

                {/* Dashboard Content Mockup */}
                <div className="relative z-10 space-y-3">
                  {/* Mock Navbar */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      {formLogo ? (
                        <img src={formLogo} alt="logo" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          SC
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-white truncate max-w-[150px]">
                        {formName}
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${secondaryColor}25`, color: secondaryColor }}
                    >
                      LIVE RADAR
                    </span>
                  </div>

                  {/* Mock Radar Heading */}
                  <div>
                    <div className="text-xs font-bold text-white">Live Attendance Radar</div>
                    <div className="text-[9px] text-slate-300 line-clamp-1">{formMotto}</div>
                  </div>

                  {/* Mock 3 Stat Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                      <div className="text-[8px] text-slate-400">Total In</div>
                      <div className="text-xs font-bold text-white">1,248</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                      <div className="text-[8px] text-slate-400">On-Time</div>
                      <div className="text-xs font-bold text-emerald-400">96.4%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                      <div className="text-[8px] text-slate-400">Kiosks</div>
                      <div className="text-xs font-bold text-amber-400">4 Active</div>
                    </div>
                  </div>

                  {/* Mock Stream Table Card */}
                  <div className="p-2.5 rounded-xl bg-slate-900/85 border border-white/10 backdrop-blur-md space-y-1.5">
                    <div className="text-[10px] font-bold text-white">Live Ingestion Stream</div>
                    <div className="space-y-1 text-[9px]">
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-slate-200">Sophia Chen (Grade 11)</span>
                        <span className="text-emerald-400 font-semibold">07:48 AM • In</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-200">Arthur Pendelton (Faculty)</span>
                        <span className="text-emerald-400 font-semibold">07:54 AM • In</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Mockup 2: Login Screen Preview ── */}
            {previewTab === "login" && (
              <div
                className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-4 transition-all"
                style={{
                  backgroundColor: bgColor,
                  minHeight: "340px",
                }}
              >
                {/* Background Layer */}
                {loginBgType === "wallpaper" && loginBgImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center pointer-events-none"
                    style={{
                      backgroundImage: `url("${loginBgImage}")`,
                      filter: loginBgBlur > 0 ? `blur(${loginBgBlur}px)` : undefined,
                    }}
                  />
                )}
                {loginBgType === "mesh" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(at 20% 20%, ${primaryColor}60 0px, transparent 60%), radial-gradient(at 80% 80%, ${secondaryColor}40 0px, transparent 60%)`,
                    }}
                  />
                )}
                {loginBgType === "grid" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
                      backgroundSize: "16px 16px",
                    }}
                  />
                )}
                {loginBgType === "aurora" && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-80"
                    style={{
                      backgroundImage: `radial-gradient(at 20% 10%, ${primaryColor}60 0px, transparent 50%), radial-gradient(at 80% 80%, ${secondaryColor}45 0px, transparent 50%)`,
                    }}
                  />
                )}
                {loginBgType === "wallpaper" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: `rgba(9, 13, 22, ${loginBgOverlay})` }}
                  />
                )}

                {/* Login Content Mockup */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px]">
                  {loginLayout === "split" ? (
                    <div className="w-full grid grid-cols-2 gap-3 items-center">
                      <div className="space-y-1.5 text-left">
                        <div className="text-xs font-bold text-white line-clamp-1">{formName}</div>
                        <div className="text-[9px] text-slate-300 line-clamp-2">{formMotto}</div>
                        <div className="text-[8px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Biometric Cloud Gate</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur-md space-y-2">
                        <div className="text-[10px] font-bold text-white">Admin Console</div>
                        <div className="w-full h-4 bg-slate-800 rounded text-[7px] text-slate-400 px-1.5 flex items-center">
                          admin@school.edu
                        </div>
                        <div className="w-full h-4 bg-slate-800 rounded text-[7px] text-slate-400 px-1.5 flex items-center">
                          ••••••••••••
                        </div>
                        <div
                          className="w-full py-1 rounded text-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Sign In
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-[220px] p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md text-center space-y-2">
                      {formLogo && (
                        <img src={formLogo} alt="crest" className="w-8 h-8 rounded-full mx-auto object-cover" />
                      )}
                      <div className="text-xs font-bold text-white">{formName}</div>
                      <div className="text-[8px] text-slate-400 line-clamp-1">{formMotto}</div>
                      <div className="w-full h-4 bg-slate-800 rounded text-[7px] text-slate-400 px-1.5 flex items-center">
                        admin@school.edu
                      </div>
                      <div
                        className="w-full py-1 rounded text-center text-[8px] font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Sign In
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Mockup 3: Tablet Kiosk Preview ── */}
            {previewTab === "kiosk" && (
              <div
                className="p-4 rounded-2xl border border-slate-800 shadow-2xl transition-all"
                style={{
                  backgroundColor: bgColor,
                  borderColor: primaryColor,
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-1.5">
                    {formLogo ? (
                      <img src={formLogo} alt="Logo" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        SC
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-white">{formName}</span>
                  </div>
                  <span
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                    style={{ backgroundColor: `${secondaryColor}25`, color: secondaryColor }}
                  >
                    KIOSK LOCK
                  </span>
                </div>

                <div className="w-full aspect-[4/3] rounded-xl bg-black/80 border border-white/10 relative flex flex-col items-center justify-center p-3">
                  <div
                    className="w-20 h-24 border-2 rounded-[50%] flex items-center justify-center"
                    style={{ borderColor: accentColor }}
                  >
                    <span className="text-[8px] font-mono" style={{ color: accentColor }}>
                      Target
                    </span>
                  </div>
                  <div
                    className="mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-semibold text-white shadow"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Verifying Face...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

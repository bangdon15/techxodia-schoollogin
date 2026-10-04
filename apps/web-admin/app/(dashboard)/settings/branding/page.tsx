"use client";

import React, { useState } from "react";
import { useTenantTheme } from "@/components/ThemeProvider";
import {
  Palette,
  Check,
  RefreshCw,
  Upload,
  Sparkles,
  School,
  Eye,
  Wallpaper,
  Moon,
  Sun,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

export default function WhiteLabelBrandingPage() {
  const { theme, schoolName, logoUrl, updateTheme, updateBranding } = useTenantTheme();

  const [formName, setFormName] = useState(schoolName);
  const [formLogo, setFormLogo] = useState(logoUrl);
  const [primaryColor, setPrimaryColor] = useState(theme.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.secondary);
  const [accentColor, setAccentColor] = useState(theme.accent);
  const [bgColor, setBgColor] = useState(theme.bg || "#090D16");
  const [bgStyle, setBgStyle] = useState<"midnight" | "mesh" | "oled" | "light" | "custom_wallpaper">(
    theme.bgStyle || "midnight"
  );
  const [bgImageUrl, setBgImageUrl] = useState(theme.bgImageUrl || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presetThemes = [
    { name: "Navy & Gold (Default)", primary: "#1E3A8A", secondary: "#F59E0B", accent: "#10B981", bg: "#090D16" },
    { name: "Emerald Ivy League", primary: "#065F46", secondary: "#FBBF24", accent: "#3B82F6", bg: "#04140E" },
    { name: "Crimson Academy", primary: "#991B1B", secondary: "#F97316", accent: "#10B981", bg: "#130606" },
    { name: "Deep Amethyst STEM", primary: "#581C87", secondary: "#EC4899", accent: "#06B6D4", bg: "#0F0619" },
  ];

  const backgroundPresets = [
    {
      id: "midnight",
      label: "Midnight Slate",
      desc: "Default sleek dark mode",
      icon: Moon,
      color: "#090D16",
    },
    {
      id: "mesh",
      label: "Brand Glow Mesh",
      desc: "Radial glow from brand colors",
      icon: Sparkles,
      color: "#0B1120",
    },
    {
      id: "oled",
      label: "Pure OLED Black",
      desc: "True black for high contrast",
      icon: Layers,
      color: "#000000",
    },
    {
      id: "light",
      label: "Daylight Pearl",
      desc: "High-contrast day mode",
      icon: Sun,
      color: "#F8FAFC",
    },
    {
      id: "custom_wallpaper",
      label: "Campus Wallpaper",
      desc: "Custom photo or graphic background",
      icon: ImageIcon,
      color: "#090D16",
    },
  ];

  const handleApplyPreset = (p: (typeof presetThemes)[0]) => {
    setPrimaryColor(p.primary);
    setSecondaryColor(p.secondary);
    setAccentColor(p.accent);
    setBgColor(p.bg);
    updateTheme({ primary: p.primary, secondary: p.secondary, accent: p.accent, bg: p.bg });
  };

  const handleSelectBgStyle = (style: typeof bgStyle) => {
    setBgStyle(style);
    let newBg = bgColor;
    if (style === "oled") newBg = "#000000";
    if (style === "light") newBg = "#F8FAFC";
    if (style === "midnight" && bgColor === "#F8FAFC") newBg = "#090D16";
    setBgColor(newBg);
    updateTheme({ bgStyle: style, bg: newBg, bgImageUrl });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(formName, formLogo);
    updateTheme({
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      bg: bgColor,
      bgStyle,
      bgImageUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">White-Label Branding & Background Engine</h2>
        <p className="text-xs text-slate-400">
          Customize school identity, theme background mode, brand colors, and assets. Tokens update both the Web Portal and Android Kiosks dynamically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <School className="w-4 h-4 text-brand-secondary" />
              <span>School Identity Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  School Crest / Logo URL
                </label>
                <input
                  type="url"
                  value={formLogo}
                  onChange={(e) => setFormLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary transition"
                />
              </div>
            </div>

            {/* Background Style Selector */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Wallpaper className="w-4 h-4 text-brand-secondary" />
                  <span>Dashboard & Kiosk Background Mode</span>
                </label>
                <span className="text-[11px] text-brand-accent font-medium">Click to preview live</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {backgroundPresets.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = bgStyle === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectBgStyle(preset.id as any)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-brand-primary/20 border-brand-secondary text-white shadow-md shadow-brand-primary/20"
                          : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-brand-secondary" : "text-slate-400"}`} />
                        <div
                          className="w-4 h-4 rounded-full border border-slate-700"
                          style={{ backgroundColor: preset.color }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{preset.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{preset.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom wallpaper input if selected */}
              {bgStyle === "custom_wallpaper" && (
                <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 animate-in fade-in">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Campus Wallpaper Image URL
                  </label>
                  <input
                    type="url"
                    value={bgImageUrl}
                    onChange={(e) => {
                      setBgImageUrl(e.target.value);
                      updateTheme({ bgImageUrl: e.target.value });
                    }}
                    placeholder="https://images.unsplash.com/... or school campus photo"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tip: High-resolution landscape images are overlaid with dark glassmorphism for legible contrast.
                  </p>
                </div>
              )}
            </div>

            {/* Custom Color Pickers */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Color Palette & Base Tint
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        updateTheme({ bg: e.target.value });
                      }}
                      className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300 truncate">{bgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Primary Brand
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        updateTheme({ primary: e.target.value });
                      }}
                      className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300 truncate">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Secondary Accent
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        updateTheme({ secondary: e.target.value });
                      }}
                      className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300 truncate">{secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Success Tint
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => {
                        setAccentColor(e.target.value);
                        updateTheme({ accent: e.target.value });
                      }}
                      className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300 truncate">{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                School Theme Presets
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {presetThemes.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition flex items-center justify-between"
                  >
                    <span className="text-xs text-slate-300 font-medium">{preset.name}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.bg }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              {savedSuccess ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4" />
                  <span>Branding and background saved permanently!</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Live preview active across entire application</span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/80 rounded-xl text-xs font-semibold text-white transition shadow-lg shadow-brand-primary/30 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                <span>Save Theme & Background</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Kiosk & Card Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-brand-secondary" />
            <span>Kiosk Realtime Preview</span>
          </div>

          <div
            className="p-5 rounded-3xl border shadow-2xl transition-all"
            style={{
              backgroundColor: bgColor,
              borderColor: primaryColor,
              backgroundImage:
                bgStyle === "mesh"
                  ? `radial-gradient(at 10% 20%, ${primaryColor}44 0px, transparent 50%), radial-gradient(at 90% 80%, ${secondaryColor}33 0px, transparent 50%)`
                  : bgStyle === "custom_wallpaper" && bgImageUrl
                  ? `linear-gradient(rgba(10, 15, 29, 0.88), rgba(10, 15, 29, 0.94)), url("${bgImageUrl}")`
                  : "none",
              backgroundSize: "cover",
            }}
          >
            {/* Tablet Frame Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                {formLogo ? (
                  <img src={formLogo} alt="Logo" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    SCH
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white line-clamp-1">{formName}</div>
                  <div className="text-[10px] text-slate-400">Lock Task Terminal</div>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded text-[9px] font-bold"
                style={{ backgroundColor: `${secondaryColor}25`, color: secondaryColor }}
              >
                KIOSK LOCKED
              </span>
            </div>

            {/* Viewfinder Preview */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-black/60 border border-white/10 relative flex flex-col items-center justify-center p-4">
              <div
                className="w-28 h-36 border-2 rounded-[50%] flex items-center justify-center"
                style={{ borderColor: accentColor }}
              >
                <span className="text-[10px] font-mono" style={{ color: accentColor }}>
                  Centered
                </span>
              </div>

              <div
                className="mt-3 px-3 py-1 rounded-full text-[10px] font-semibold text-white shadow"
                style={{ backgroundColor: primaryColor }}
              >
                Verifying Face...
              </div>
            </div>

            {/* Success Card Mock */}
            <div
              className="mt-3 p-3 rounded-xl border flex items-center gap-2.5"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}40`,
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accentColor }}
              >
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Attendance Recorded</div>
                <div className="text-[10px] text-slate-300">Sophia Chen • 07:48 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

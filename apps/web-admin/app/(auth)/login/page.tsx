"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  ArrowLeft,
  Sparkles,
  School,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useTenantTheme, SCHOOL_PRESETS } from "@/components/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const {
    schoolName,
    logoUrl,
    motto,
    theme,
    login,
    applySchoolPreset,
  } = useTenantTheme();

  const [email, setEmail] = useState("admin@oakridge.edu");
  const [password, setPassword] = useState("••••••••••••");
  const [role, setRole] = useState("Chief School Administrator");
  const [isLoading, setIsLoading] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  const bgType =
    theme.loginBgType ||
    (theme.bgStyle === "custom_wallpaper" ? "wallpaper" : theme.bgStyle) ||
    "wallpaper";
  const bgImage =
    theme.loginBgImage ||
    theme.dashboardBgImage ||
    theme.bgImageUrl ||
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80";
  const overlay =
    typeof theme.loginBgOverlay === "number" ? theme.loginBgOverlay : 0.75;
  const blurPx =
    typeof theme.loginBgBlur === "number" ? theme.loginBgBlur : 0;
  const isSplit = (theme.loginLayout || "split") === "split";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    login(email, role);
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  const handleQuickDemo = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setRole(demoRole);
    setIsLoading(true);
    login(demoEmail, demoRole);
    setTimeout(() => {
      router.push("/");
    }, 400);
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between overflow-x-hidden"
      style={{ backgroundColor: theme.bg || "#090D16" }}
    >
      {/* ── Background Layer 1: Wallpaper Image ── */}
      {bgType === "wallpaper" && bgImage && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url("${bgImage}")`,
            filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
            transform: blurPx > 0 ? "scale(1.04)" : undefined,
          }}
        />
      )}

      {/* ── Background Layer 2: Radial Mesh Gradient ── */}
      {bgType === "mesh" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `radial-gradient(at 20% 20%, ${theme.primary}50 0px, transparent 55%), radial-gradient(at 80% 80%, ${theme.secondary}40 0px, transparent 55%), radial-gradient(at 50% 50%, #090D16 0px, transparent 100%)`,
          }}
        />
      )}

      {/* ── Background Layer 3: High-Tech Dot Matrix Grid ── */}
      {bgType === "grid" && (
        <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 0%, ${theme.primary}45 0%, transparent 70%)`,
            }}
          />
        </div>
      )}

      {/* ── Background Layer 4: Aurora Wave ── */}
      {bgType === "aurora" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 opacity-80"
          style={{
            backgroundImage: `radial-gradient(at 20% 10%, ${theme.primary}60 0px, transparent 50%), radial-gradient(at 80% 20%, ${theme.secondary}45 0px, transparent 50%), radial-gradient(at 50% 80%, ${theme.accent}40 0px, transparent 55%)`,
          }}
        />
      )}

      {/* ── Background Dimmer Overlay (Protects Contrast) ── */}
      {bgType === "wallpaper" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
          style={{
            backgroundColor: `rgba(9, 13, 22, ${overlay})`,
          }}
        />
      )}

      {/* ── Top Floating Action Bar ── */}
      <header className="relative z-30 p-4 lg:px-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Live Radar Console</span>
        </Link>

        {/* Sales Demo School Preset Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-xs font-semibold text-white transition shadow-lg backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
            <span className="hidden sm:inline">Switch School Template:</span>
            <span className="text-brand-secondary font-bold truncate max-w-[140px]">
              {schoolName.split(" ")[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPresetMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
                Select Client School Pitch:
              </div>
              <div className="space-y-1">
                {SCHOOL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      applySchoolPreset(p.id);
                      setShowPresetMenu(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${
                      p.name === schoolName
                        ? "bg-brand-primary/20 border border-brand-primary/40 text-white"
                        : "hover:bg-slate-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{p.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {p.motto}
                      </div>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.theme.primary }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Login Layout Area ── */}
      <main className="relative z-20 flex-1 flex items-center justify-center p-4 lg:p-8">
        {isSplit ? (
          /* ── Split Screen Showcase Layout ── */
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6 text-left p-2 lg:p-6">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={schoolName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <School className="w-4 h-4 text-brand-secondary" />
                )}
                <span className="text-xs font-semibold text-slate-200">
                  White-Label Institutional Portal
                </span>
              </div>

              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {schoolName}
                </h1>
                <p className="text-sm text-slate-300 mt-2 font-medium">
                  {motto}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Sub-Second Biometric Radar:</strong> Kiosks stream 512D vectors without storing raw face photos.
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl backdrop-blur-md">
                  <Cpu className="w-4 h-4 text-brand-secondary shrink-0" />
                  <span>
                    <strong>3-Tier Fail-Safe Continuity:</strong> PIN fallback, QR badges, and HR dispute override.
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl backdrop-blur-md">
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>Automated Payroll Export:</strong> 1st-15th semi-monthly DTR spreadsheets ready for accounting.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Login Form Column */}
            <div className="lg:col-span-6 w-full max-w-md mx-auto">
              <div className="glass-card p-7 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/80 backdrop-blur-2xl">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Administrator Access</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to supervise gates, view timesheets, and export payroll
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-primary transition"
                        placeholder="admin@school.edu"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-primary transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Administrative Scope
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition"
                    >
                      <option value="Chief School Administrator">Chief School Administrator (Full Access)</option>
                      <option value="Security & Gate Supervisor">Security & Gate Supervisor</option>
                      <option value="Faculty Academic Registrar">Faculty Academic Registrar</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 bg-brand-primary hover:bg-brand-primary/80 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-brand-primary/30"
                  >
                    <span>{isLoading ? "Authenticating Session..." : "Sign In to Admin Console"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Demo Fill Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>One-Click Demo Admin Roles:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo("elena.rostova@school.edu", "Chief School Administrator")}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
                    >
                      <div className="text-xs font-semibold text-slate-200">Dr. Rostova</div>
                      <div className="text-[10px] text-slate-500">Chief Admin</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo("gate.supervisor@school.edu", "Security & Gate Supervisor")}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
                    >
                      <div className="text-xs font-semibold text-slate-200">Sgt. Miller</div>
                      <div className="text-[10px] text-slate-500">Gate Supervisor</div>
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Protected by Supabase Auth & Row Level Security</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Centered Glass Card Layout ── */
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={schoolName}
                  className="w-16 h-16 rounded-2xl mx-auto object-cover ring-4 ring-brand-primary/30 shadow-2xl mb-3"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-xl mb-3">
                  SC
                </div>
              )}
              <h2 className="text-2xl font-bold text-white">{schoolName}</h2>
              <p className="text-xs text-slate-300 mt-1">{motto}</p>
            </div>

            <div className="glass-card p-7 rounded-3xl shadow-2xl border border-slate-800/80 backdrop-blur-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-primary transition"
                      placeholder="admin@school.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-primary transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Administrative Scope
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary transition"
                  >
                    <option value="Chief School Administrator">Chief School Administrator (Full Access)</option>
                    <option value="Security & Gate Supervisor">Security & Gate Supervisor</option>
                    <option value="Faculty Academic Registrar">Faculty Academic Registrar</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-brand-primary hover:bg-brand-primary/80 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-brand-primary/30"
                >
                  <span>{isLoading ? "Authenticating Session..." : "Sign In to Admin Console"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Fill Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-secondary" />
                  <span>One-Click Demo Admin Roles:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("elena.rostova@school.edu", "Chief School Administrator")}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
                  >
                    <div className="text-xs font-semibold text-slate-200">Dr. Rostova</div>
                    <div className="text-[10px] text-slate-500">Chief Admin</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("gate.supervisor@school.edu", "Security & Gate Supervisor")}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
                  >
                    <div className="text-xs font-semibold text-slate-200">Sgt. Miller</div>
                    <div className="text-[10px] text-slate-500">Gate Supervisor</div>
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                <span>Protected by Supabase Auth & Row Level Security</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-20 py-3 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} {schoolName} • Powered by Techxodia FaceGuard System
      </footer>
    </div>
  );
}

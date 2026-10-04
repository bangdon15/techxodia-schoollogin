"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, ArrowLeft } from "lucide-react";
import { useTenantTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { schoolName, logoUrl, login } = useTenantTheme();
  const [email, setEmail] = useState("admin@oakridge.edu");
  const [password, setPassword] = useState("••••••••••••");
  const [role, setRole] = useState("Chief School Administrator");
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Dashboard</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={schoolName}
              className="w-16 h-16 rounded-2xl mx-auto object-cover ring-4 ring-brand-primary/30 shadow-2xl mb-3"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-xl mb-3">
              TK
            </div>
          )}
          <h2 className="text-2xl font-bold text-white">{schoolName}</h2>
          <p className="text-xs text-slate-400 mt-1">Administrator Identity & Attendance Console</p>
        </div>

        <div className="glass-card p-7 rounded-3xl shadow-2xl">
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
                onClick={() => handleQuickDemo("elena.rostova@oakridge.edu", "Chief School Administrator")}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
              >
                <div className="text-xs font-semibold text-slate-200">Dr. Rostova</div>
                <div className="text-[10px] text-slate-500">Chief Admin</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("gate.supervisor@oakridge.edu", "Security & Gate Supervisor")}
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
  );
}

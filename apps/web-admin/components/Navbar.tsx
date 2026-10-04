"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTenantTheme } from "./ThemeProvider";
import {
  ShieldCheck,
  Clock,
  User,
  LogOut,
  Palette,
  ChevronDown,
  LogIn,
  KeyRound,
} from "lucide-react";

export function Navbar() {
  const { schoolName, logoUrl, adminUser, logout } = useTenantTheme();
  const [time, setTime] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* School identity brand */}
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={schoolName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-primary"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center font-bold text-white">
            {schoolName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-semibold text-slate-100 text-sm leading-tight flex items-center gap-2">
            {schoolName}
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">
              Live Gateway
            </span>
          </h1>
          <p className="text-xs text-slate-400">Attendance & Identity Control Console</p>
        </div>
      </div>

      {/* Center live clock */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
        <Clock className="w-3.5 h-3.5 text-brand-secondary" />
        <span suppressHydrationWarning>{time}</span>
      </div>

      {/* Right controls & Admin Login Menu */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
          <span>pgvector HNSW</span>
        </div>

        {adminUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            >
              <img
                src={adminUser.avatar}
                alt={adminUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-brand-primary"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-100 leading-tight">
                  {adminUser.name}
                </div>
                <div className="text-[10px] text-brand-secondary leading-tight">
                  {adminUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Admin Menu Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <div className="text-xs font-bold text-white">{adminUser.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{adminUser.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-primary/20 text-brand-secondary border border-brand-primary/30">
                    {adminUser.role}
                  </span>
                </div>

                <Link
                  href="/settings/branding"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
                >
                  <Palette className="w-4 h-4 text-brand-secondary" />
                  <span>Change Background & Brand</span>
                </Link>

                <Link
                  href="/login"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
                >
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  <span>Admin Login Page</span>
                </Link>

                <div className="my-1 border-t border-slate-800/80" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Lock Console</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-3.5 py-1.5 bg-brand-primary hover:bg-brand-primary/80 rounded-xl text-xs font-semibold text-white transition shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}

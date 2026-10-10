"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Users,
  Tablet,
  Palette,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  UserPlus,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Live Monitoring", href: "/", icon: Activity },
    { label: "Attendance Feed", href: "/attendance", icon: FileSpreadsheet },
    { label: "Students & Staff", href: "/students", icon: Users },
    { label: "Faculty Registration", href: "/register", icon: UserPlus },
    { label: "Kiosk Terminals", href: "/kiosks", icon: Tablet },
    { label: "White-Label Branding", href: "/settings/branding", icon: Palette },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col justify-between p-4 shrink-0">
      <div>
        <div className="mb-6 px-3 py-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-primary/20 text-white border border-brand-primary/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-brand-secondary" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-brand-secondary font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero-Storage Mode</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Android Kiosks strictly stream normalized 512D vectors directly to pgvector.
        </p>
      </div>
    </aside>
  );
}

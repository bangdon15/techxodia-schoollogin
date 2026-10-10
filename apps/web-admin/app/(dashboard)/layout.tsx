"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useTenantTheme } from "@/components/ThemeProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTenantTheme();

  const bgType =
    theme.dashboardBgType ||
    (theme.bgStyle === "custom_wallpaper" ? "wallpaper" : theme.bgStyle) ||
    "midnight";
  const bgImage =
    theme.dashboardBgImage ||
    theme.bgImageUrl ||
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80";
  const overlay =
    typeof theme.dashboardBgOverlay === "number" ? theme.dashboardBgOverlay : 0.90;
  const blurPx =
    typeof theme.dashboardBgBlur === "number" ? theme.dashboardBgBlur : 0;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden text-slate-100"
      style={{ backgroundColor: theme.bg || "#090D16" }}
    >
      {/* Background Layer 1: Wallpaper Image */}
      {bgType === "wallpaper" && bgImage && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url("${bgImage}")`,
            filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
            transform: blurPx > 0 ? "scale(1.03)" : undefined,
          }}
        />
      )}

      {/* Background Layer 2: Mesh Gradient */}
      {bgType === "mesh" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `radial-gradient(at 15% 15%, ${theme.primary}40 0px, transparent 55%), radial-gradient(at 85% 85%, ${theme.secondary}30 0px, transparent 55%), radial-gradient(at 50% 50%, #090D16 0px, transparent 100%)`,
          }}
        />
      )}

      {/* Background Layer 3: Cyber Dot Matrix Grid */}
      {bgType === "grid" && (
        <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 0%, ${theme.primary}35 0%, transparent 60%)`,
            }}
          />
        </div>
      )}

      {/* Background Layer 4: Aurora Wave */}
      {bgType === "aurora" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 opacity-70"
          style={{
            backgroundImage: `radial-gradient(at 20% 10%, ${theme.primary}50 0px, transparent 50%), radial-gradient(at 80% 20%, ${theme.secondary}35 0px, transparent 50%), radial-gradient(at 50% 80%, ${theme.accent}30 0px, transparent 55%)`,
          }}
        />
      )}

      {/* Overlay Dimmer (Ensures 100% text readability over wallpaper) */}
      {bgType === "wallpaper" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
          style={{
            backgroundColor: `rgba(9, 13, 22, ${overlay})`,
          }}
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

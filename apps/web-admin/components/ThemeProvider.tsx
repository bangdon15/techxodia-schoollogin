"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TenantThemeConfig } from "@/lib/types";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  schoolName: string;
}

const defaultAdminUser: AdminUser = {
  id: "admin-master",
  name: "Dr. Elena Rostova",
  email: "admin@oakridge.edu",
  role: "Chief School Administrator",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
  schoolName: "Oakridge International Academy",
};

const defaultTheme: TenantThemeConfig = {
  primary: "#1E3A8A",
  secondary: "#F59E0B",
  surface: "#0F172A",
  accent: "#10B981",
  bg: "#090D16",
  bgStyle: "midnight",
  bgImageUrl: "",
};

interface ThemeContextType {
  theme: TenantThemeConfig;
  schoolName: string;
  logoUrl: string;
  adminUser: AdminUser | null;
  updateTheme: (newTheme: Partial<TenantThemeConfig>) => void;
  updateBranding: (name: string, logo: string) => void;
  login: (email: string, role?: string) => void;
  logout: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  schoolName: "Oakridge International Academy",
  logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80",
  adminUser: defaultAdminUser,
  updateTheme: () => {},
  updateBranding: () => {},
  login: () => {},
  logout: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<TenantThemeConfig>(defaultTheme);
  const [schoolName, setSchoolName] = useState("Oakridge International Academy");
  const [logoUrl, setLogoUrl] = useState(
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80"
  );
  const [adminUser, setAdminUser] = useState<AdminUser | null>(defaultAdminUser);

  useEffect(() => {
    // Check saved theme and auth session in localStorage
    try {
      const saved = localStorage.getItem("tenant_branding");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme({ ...defaultTheme, ...parsed.theme });
        if (parsed.schoolName) setSchoolName(parsed.schoolName);
        if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
      }
      const savedUser = localStorage.getItem("admin_session");
      if (savedUser) {
        setAdminUser(JSON.parse(savedUser));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    // Apply dynamic CSS variables to root HTML
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", theme.primary);
    root.style.setProperty("--brand-secondary", theme.secondary);
    root.style.setProperty("--brand-surface", theme.surface);
    root.style.setProperty("--brand-accent", theme.accent);
    root.style.setProperty("--brand-bg", theme.bg || "#090D16");

    // Dynamic background styling on body
    const body = document.body;
    if (theme.bgStyle === "mesh") {
      body.style.backgroundImage = `radial-gradient(at 10% 20%, ${theme.primary}33 0px, transparent 50%), radial-gradient(at 90% 80%, ${theme.secondary}22 0px, transparent 50%)`;
      body.style.backgroundColor = theme.bg || "#090D16";
    } else if (theme.bgStyle === "custom_wallpaper" && theme.bgImageUrl) {
      body.style.backgroundImage = `linear-gradient(rgba(9, 13, 22, 0.88), rgba(9, 13, 22, 0.94)), url("${theme.bgImageUrl}")`;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundAttachment = "fixed";
      body.style.backgroundColor = theme.bg || "#090D16";
    } else if (theme.bgStyle === "oled") {
      body.style.backgroundImage = "none";
      body.style.backgroundColor = "#000000";
    } else if (theme.bgStyle === "light") {
      body.style.backgroundImage = "none";
      body.style.backgroundColor = theme.bg || "#F8FAFC";
    } else {
      // Midnight standard
      body.style.backgroundImage = "none";
      body.style.backgroundColor = theme.bg || "#090D16";
    }
  }, [theme]);

  const updateTheme = (newTheme: Partial<TenantThemeConfig>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newTheme };
      try {
        localStorage.setItem(
          "tenant_branding",
          JSON.stringify({ theme: updated, schoolName, logoUrl })
        );
      } catch (e) {}
      return updated;
    });
  };

  const updateBranding = (name: string, logo: string) => {
    setSchoolName(name);
    setLogoUrl(logo);
    try {
      localStorage.setItem(
        "tenant_branding",
        JSON.stringify({ theme, schoolName: name, logoUrl: logo })
      );
    } catch (e) {}
  };

  const login = (email: string, role: string = "School Administrator") => {
    const user: AdminUser = {
      id: "admin-" + Date.now(),
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
      schoolName,
    };
    setAdminUser(user);
    try {
      localStorage.setItem("admin_session", JSON.stringify(user));
    } catch (e) {}
  };

  const logout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem("admin_session");
    } catch (e) {}
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        schoolName,
        logoUrl,
        adminUser,
        updateTheme,
        updateBranding,
        login,
        logout,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTenantTheme = () => useContext(ThemeContext);

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

export interface SchoolPreset {
  id: string;
  name: string;
  motto: string;
  logo: string;
  theme: TenantThemeConfig;
}

export const SCHOOL_PRESETS: SchoolPreset[] = [
  {
    id: "oakridge",
    name: "Oakridge International Academy",
    motto: "Tradition of Excellence, Future of Innovation",
    logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=256&auto=format&fit=crop&q=80",
    theme: {
      primary: "#1E3A8A",
      secondary: "#F59E0B",
      surface: "#0F172A",
      accent: "#10B981",
      bg: "#090D16",
      bgStyle: "midnight",
      dashboardBgType: "midnight",
      dashboardBgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
      dashboardBgOverlay: 0.90,
      dashboardBgBlur: 0,
      loginLayout: "split",
      loginBgType: "wallpaper",
      loginBgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
      loginBgOverlay: 0.70,
      loginBgBlur: 0,
      motto: "Tradition of Excellence, Future of Innovation",
    },
  },
  {
    id: "cavite_high",
    name: "Cavite National Science High School",
    motto: "Shaping Tomorrow's Scientists & Leaders",
    logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=256&auto=format&fit=crop&q=80",
    theme: {
      primary: "#0284C7",
      secondary: "#F59E0B",
      surface: "#0F172A",
      accent: "#06B6D4",
      bg: "#061325",
      bgStyle: "mesh",
      dashboardBgType: "grid",
      dashboardBgImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
      dashboardBgOverlay: 0.92,
      dashboardBgBlur: 0,
      loginLayout: "split",
      loginBgType: "wallpaper",
      loginBgImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
      loginBgOverlay: 0.65,
      loginBgBlur: 0,
      motto: "Shaping Tomorrow's Scientists & Leaders",
    },
  },
  {
    id: "green_valley",
    name: "Green Valley STEM Institute",
    motto: "Where Science, Technology & Character Meet",
    logo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=256&auto=format&fit=crop&q=80",
    theme: {
      primary: "#059669",
      secondary: "#FBBF24",
      surface: "#062016",
      accent: "#3B82F6",
      bg: "#03170F",
      bgStyle: "mesh",
      dashboardBgType: "mesh",
      dashboardBgImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80",
      dashboardBgOverlay: 0.88,
      dashboardBgBlur: 0,
      loginLayout: "split",
      loginBgType: "wallpaper",
      loginBgImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80",
      loginBgOverlay: 0.72,
      loginBgBlur: 2,
      motto: "Where Science, Technology & Character Meet",
    },
  },
  {
    id: "saint_jude",
    name: "St. Jude Polytechnic College",
    motto: "Practical Knowledge, Global Competence",
    logo: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=256&auto=format&fit=crop&q=80",
    theme: {
      primary: "#991B1B",
      secondary: "#F59E0B",
      surface: "#1C0A0A",
      accent: "#10B981",
      bg: "#120505",
      bgStyle: "custom_wallpaper",
      dashboardBgType: "wallpaper",
      dashboardBgImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80",
      dashboardBgOverlay: 0.88,
      dashboardBgBlur: 0,
      loginLayout: "center",
      loginBgType: "wallpaper",
      loginBgImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80",
      loginBgOverlay: 0.75,
      loginBgBlur: 4,
      motto: "Practical Knowledge, Global Competence",
    },
  },
  {
    id: "techxodia",
    name: "Techxodia Autonomous Academy",
    motto: "Next-Generation Biometric Learning Ecosystem",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=256&auto=format&fit=crop&q=80",
    theme: {
      primary: "#7C3AED",
      secondary: "#EC4899",
      surface: "#150C2A",
      accent: "#06B6D4",
      bg: "#0B0617",
      bgStyle: "mesh",
      dashboardBgType: "aurora",
      dashboardBgImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80",
      dashboardBgOverlay: 0.90,
      dashboardBgBlur: 0,
      loginLayout: "split",
      loginBgType: "mesh",
      loginBgImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&auto=format&fit=crop&q=80",
      loginBgOverlay: 0.75,
      loginBgBlur: 6,
      motto: "Next-Generation Biometric Learning Ecosystem",
    },
  },
];

const defaultTheme: TenantThemeConfig = {
  primary: "#1E3A8A",
  secondary: "#F59E0B",
  surface: "#0F172A",
  accent: "#10B981",
  bg: "#090D16",
  bgStyle: "midnight",
  bgImageUrl: "",
  dashboardBgType: "midnight",
  dashboardBgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
  dashboardBgOverlay: 0.90,
  dashboardBgBlur: 0,
  loginLayout: "split",
  loginBgType: "wallpaper",
  loginBgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
  loginBgOverlay: 0.70,
  loginBgBlur: 0,
  motto: "Tradition of Excellence, Future of Innovation",
};

interface ThemeContextType {
  theme: TenantThemeConfig;
  schoolName: string;
  logoUrl: string;
  motto: string;
  adminUser: AdminUser | null;
  updateTheme: (newTheme: Partial<TenantThemeConfig>) => void;
  updateBranding: (name: string, logo: string, motto?: string) => void;
  applySchoolPreset: (presetId: string) => void;
  login: (email: string, role?: string) => void;
  logout: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  schoolName: "Oakridge International Academy",
  logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80",
  motto: "Tradition of Excellence, Future of Innovation",
  adminUser: defaultAdminUser,
  updateTheme: () => {},
  updateBranding: () => {},
  applySchoolPreset: () => {},
  login: () => {},
  logout: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<TenantThemeConfig>(defaultTheme);
  const [schoolName, setSchoolName] = useState("Oakridge International Academy");
  const [logoUrl, setLogoUrl] = useState(
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80"
  );
  const [motto, setMotto] = useState("Tradition of Excellence, Future of Innovation");
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
        if (parsed.motto) setMotto(parsed.motto);
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
    body.style.backgroundColor = theme.bg || "#090D16";
  }, [theme]);

  const updateTheme = (newTheme: Partial<TenantThemeConfig>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newTheme };
      try {
        localStorage.setItem(
          "tenant_branding",
          JSON.stringify({ theme: updated, schoolName, logoUrl, motto })
        );
      } catch (e) {}
      return updated;
    });
  };

  const updateBranding = (name: string, logo: string, newMotto?: string) => {
    setSchoolName(name);
    setLogoUrl(logo);
    if (newMotto) setMotto(newMotto);
    try {
      localStorage.setItem(
        "tenant_branding",
        JSON.stringify({
          theme,
          schoolName: name,
          logoUrl: logo,
          motto: newMotto || motto,
        })
      );
    } catch (e) {}
  };

  const applySchoolPreset = (presetId: string) => {
    const found = SCHOOL_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSchoolName(found.name);
    setLogoUrl(found.logo);
    setMotto(found.motto);
    setTheme(found.theme);
    try {
      localStorage.setItem(
        "tenant_branding",
        JSON.stringify({
          theme: found.theme,
          schoolName: found.name,
          logoUrl: found.logo,
          motto: found.motto,
        })
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
        motto,
        adminUser,
        updateTheme,
        updateBranding,
        applySchoolPreset,
        login,
        logout,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export const useTenantTheme = () => useContext(ThemeContext);

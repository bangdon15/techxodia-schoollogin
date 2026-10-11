"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Tablet,
  Sparkles,
  ArrowUpRight,
  Clock,
  Radio,
  PlusCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AttendanceLog } from "@/lib/types";

export default function DashboardOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<any[]>([
    {
      id: "log-1",
      timestamp: "2026-10-04T07:48:12Z",
      student_id: "STU-2026-0891",
      full_name: "Sophia Chen",
      grade_section: "Grade 11 - STEM A",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
      location_tag: "North Gate Tablet 01",
      status: "on_time",
      confidence: 0.96,
    },
    {
      id: "log-2",
      timestamp: "2026-10-04T07:52:45Z",
      student_id: "STU-2026-0892",
      full_name: "Marcus Vance",
      grade_section: "Grade 10 - Section B",
      avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&auto=format&fit=crop&q=80",
      location_tag: "West Gymnasium Entrance",
      status: "on_time",
      confidence: 0.94,
    },
    {
      id: "log-3",
      timestamp: "2026-10-04T08:04:19Z",
      student_id: "EMP-1042",
      full_name: "Dr. Elena Rostova",
      grade_section: "Faculty of Science",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
      location_tag: "Main Gate Kiosk 01",
      status: "late",
      confidence: 0.98,
    },
  ]);

  const [stats, setStats] = useState({
    totalCheckIns: 1248,
    onTimeRate: "96.4%",
    activeKiosks: 4,
    registeredStudents: 1420,
  });

  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Active live attendance synchronization and polling
  useEffect(() => {
    let isSubscribed = true;

    const fetchLiveFeed = async () => {
      try {
        const res = await fetch("/api/attendance/feed", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.logs && isSubscribed) {
            setLogs(data.logs);
            if (data.stats) {
              setStats((prev) => ({ ...prev, ...data.stats }));
            }
          }
        }
      } catch (err) {
        // silent fallback
      }
    };

    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  // Also subscribe to Supabase Realtime attendance_logs channel if configured
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("live-attendance-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance_logs" },
        (payload) => {
          const newRow = payload.new;
          setLogs((prev) => [
            {
              id: newRow.id,
              timestamp: newRow.timestamp || new Date().toISOString(),
              student_id: "STU-LIVE",
              full_name: "Verified Student",
              grade_section: "High School",
              avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
              location_tag: "Kiosk Terminal",
              status: newRow.status || "on_time",
              confidence: 1 - (newRow.confidence_score || 0.1),
            },
            ...prev.slice(0, 19),
          ]);
          setStats((prev) => ({
            ...prev,
            totalCheckIns: prev.totalCheckIns + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Simulate instant check-in for demonstration
  const handleSimulateCheckIn = () => {
    setIsSimulating(true);
    const mockNames = [
      { name: "Liam Gallagher", id: "STU-2026-0895", grade: "Grade 12 - Art", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80" },
      { name: "Chloe Bennett", id: "STU-2026-0896", grade: "Grade 9 - Section C", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80" },
    ];
    const picked = mockNames[Math.floor(Math.random() * mockNames.length)];

    setTimeout(() => {
      const newEntry = {
        id: `mock-${Date.now()}`,
        timestamp: new Date().toISOString(),
        student_id: picked.id,
        full_name: picked.name,
        grade_section: picked.grade,
        avatar_url: picked.img,
        location_tag: "North Gate Tablet 01",
        status: Math.random() > 0.15 ? "on_time" : "late",
        confidence: 0.95 + Math.random() * 0.04,
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 19)]);
      setStats((prev) => ({ ...prev, totalCheckIns: prev.totalCheckIns + 1 }));
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Simulation Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Live Attendance Radar</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time feed streaming directly from Android Lock-Task Kiosks via Supabase Realtime.
          </p>
        </div>

        <button
          onClick={handleSimulateCheckIn}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition shadow-sm"
        >
          <Radio className={`w-3.5 h-3.5 text-brand-secondary ${isSimulating ? "animate-pulse" : ""}`} />
          <span>{isSimulating ? "Streaming Vector..." : "Simulate Kiosk Check-In"}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Check-Ins</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalCheckIns.toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14.2% compared to yesterday</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Time Arrival</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.onTimeRate}</div>
          <div className="mt-1 text-[11px] text-slate-400">Cutoff: 08:00 AM Standard</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Kiosks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Tablet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeKiosks} Terminals</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">All devices reporting healthy</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Face Vector Vault</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.registeredStudents}</div>
          <div className="mt-1 text-[11px] text-slate-400">pgvector HNSW Indexed</div>
        </div>
      </div>

      {/* Realtime Attendance Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Live Ingestion Stream</h3>
            <p className="text-xs text-slate-400">Sub-second updates from all school entrance gates</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Channel: attendance_logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Student / Faculty</th>
                <th className="py-3 px-5">ID Number</th>
                <th className="py-3 px-5">Grade / Section</th>
                <th className="py-3 px-5">Gate Terminal</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Confidence</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={log.avatar_url}
                        alt={log.full_name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <span className="font-semibold text-slate-100">{log.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-400">{log.student_id}</td>
                  <td className="py-3 px-5">{log.grade_section}</td>
                  <td className="py-3 px-5 text-slate-400">{log.location_tag}</td>
                  <td className="py-3 px-5 font-mono text-slate-400" suppressHydrationWarning>
                    {mounted ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "07:48:12 AM"}
                  </td>
                  <td className="py-3 px-5">
                    <span className="font-mono text-emerald-400 font-semibold">
                      {Math.round((log.confidence || 0.95) * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    {log.status === "on_time" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>On-Time</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Late</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

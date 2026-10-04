"use client";

import React, { useState } from "react";
import { Download, Search, Filter, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";

export default function AttendanceLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [mockLogs] = useState([
    {
      id: "log-1",
      timestamp: "2026-10-04T07:48:12Z",
      student_no: "STU-2026-0891",
      name: "Sophia Chen",
      grade: "Grade 11 - STEM A",
      kiosk: "North Gate Tablet 01",
      status: "on_time",
      confidence: "96%",
    },
    {
      id: "log-2",
      timestamp: "2026-10-04T07:52:45Z",
      student_no: "STU-2026-0892",
      name: "Marcus Vance",
      grade: "Grade 10 - Section B",
      kiosk: "North Gate Tablet 01",
      status: "on_time",
      confidence: "94%",
    },
    {
      id: "log-3",
      timestamp: "2026-10-04T08:04:19Z",
      student_no: "EMP-1042",
      name: "Dr. Elena Rostova",
      grade: "Faculty of Science",
      kiosk: "Main Gate Kiosk 01",
      status: "late",
      confidence: "98%",
    },
    {
      id: "log-4",
      timestamp: "2026-10-04T08:12:05Z",
      student_no: "STU-2026-0895",
      name: "Liam Gallagher",
      grade: "Grade 12 - Art",
      kiosk: "West Gymnasium Entrance",
      status: "late",
      confidence: "95%",
    },
    {
      id: "log-5",
      timestamp: "2026-10-04T07:35:10Z",
      student_no: "STU-2026-0896",
      name: "Chloe Bennett",
      grade: "Grade 9 - Section C",
      kiosk: "North Gate Tablet 01",
      status: "on_time",
      confidence: "97%",
    },
  ]);

  const filteredLogs = mockLogs.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCsv = () => {
    window.location.href = "/api/attendance/export";
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Attendance Record Logs</h2>
          <p className="text-xs text-slate-400">
            Immutable chronological log of all atomic time-in events stored in Supabase.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold text-white transition shadow-lg shadow-brand-primary/30"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-primary transition"
          >
            <option value="all">All Arrival Statuses</option>
            <option value="on_time">On-Time Only</option>
            <option value="late">Late Arrival</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Student / Faculty</th>
                <th className="py-3 px-5">ID Number</th>
                <th className="py-3 px-5">Grade / Section</th>
                <th className="py-3 px-5">Terminal Gate</th>
                <th className="py-3 px-5">Timestamp (UTC)</th>
                <th className="py-3 px-5">Confidence</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-5 font-semibold text-slate-100">{log.name}</td>
                  <td className="py-3 px-5 font-mono text-slate-400">{log.student_no}</td>
                  <td className="py-3 px-5">{log.grade}</td>
                  <td className="py-3 px-5 text-slate-400">{log.kiosk}</td>
                  <td className="py-3 px-5 font-mono text-slate-400" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-5 font-mono text-emerald-400 font-semibold">{log.confidence}</td>
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

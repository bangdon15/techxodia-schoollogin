"use client";

import React, { useState } from "react";
import {
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  ShieldAlert,
  Clock,
  Sparkles,
  KeyRound,
  PlusCircle,
  X,
  FileCheck,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  timestamp: string;
  student_no: string;
  name: string;
  grade: string;
  kiosk: string;
  direction: "time_in" | "time_out";
  status: "on_time" | "late" | "excused";
  confidence: string;
  verification_method: "face_biometric" | "backup_pin" | "admin_override";
  override_reason?: string;
}

export default function AttendanceLogsPage() {
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const defaultEnd = now.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fail-Safe Manual Override Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    idNumber: "EMP-1042",
    fullName: "Dr. Elena Rostova",
    direction: "time_in" as "time_in" | "time_out",
    timestamp: new Date().toISOString().slice(0, 16),
    reason: "Face recognition failed - Camera lighting glare",
  });
  const [overrideFeedback, setOverrideFeedback] = useState("");

  const [logs, setLogs] = useState<AttendanceRecord[]>([
    {
      id: "log-1",
      timestamp: "2026-10-04T07:48:12Z",
      student_no: "STU-2026-0891",
      name: "Sophia Chen",
      grade: "Grade 11 - STEM A",
      kiosk: "North Gate Tablet 01",
      direction: "time_in",
      status: "on_time",
      confidence: "96%",
      verification_method: "face_biometric",
    },
    {
      id: "log-2",
      timestamp: "2026-10-04T07:52:45Z",
      student_no: "STU-2026-0892",
      name: "Marcus Vance",
      grade: "Grade 10 - Section B",
      kiosk: "North Gate Tablet 01",
      direction: "time_in",
      status: "on_time",
      confidence: "94%",
      verification_method: "face_biometric",
    },
    {
      id: "log-3",
      timestamp: "2026-10-04T08:04:19Z",
      student_no: "EMP-1042",
      name: "Dr. Elena Rostova",
      grade: "Faculty of Science",
      kiosk: "North Gate Tablet 01",
      direction: "time_in",
      status: "late",
      confidence: "98%",
      verification_method: "face_biometric",
    },
    {
      id: "log-4",
      timestamp: "2026-10-04T08:12:05Z",
      student_no: "FAC-2026-010",
      name: "Prof. Arthur Pendelton",
      grade: "Department of Mathematics",
      kiosk: "Faculty Entrance Tablet 02",
      direction: "time_in",
      status: "late",
      confidence: "100%",
      verification_method: "backup_pin",
      override_reason: "Facial scan timeout - Verified via 4-digit Backup PIN",
    },
    {
      id: "log-5",
      timestamp: "2026-10-04T17:05:10Z",
      student_no: "EMP-1042",
      name: "Dr. Elena Rostova",
      grade: "Faculty of Science",
      kiosk: "North Gate Tablet 01",
      direction: "time_out",
      status: "on_time",
      confidence: "97%",
      verification_method: "face_biometric",
    },
    {
      id: "log-6",
      timestamp: "2026-10-04T17:35:42Z",
      student_no: "FAC-2026-010",
      name: "Prof. Arthur Pendelton",
      grade: "Department of Mathematics",
      kiosk: "Admin Override Console",
      direction: "time_out",
      status: "on_time",
      confidence: "100%",
      verification_method: "admin_override",
      override_reason: "Approved official faculty meeting extension",
    },
  ]);

  const handleApplyPreset = (preset: "today" | "this_week" | "period_1_15" | "period_16_end" | "month") => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    if (preset === "today") {
      const t = today.toISOString().slice(0, 10);
      setStartDate(t);
      setEndDate(t);
    } else if (preset === "this_week") {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d.setDate(diff)).toISOString().slice(0, 10);
      setStartDate(mon);
      setEndDate(today.toISOString().slice(0, 10));
    } else if (preset === "period_1_15") {
      setStartDate(new Date(y, m, 1).toISOString().slice(0, 10));
      setEndDate(new Date(y, m, 15).toISOString().slice(0, 10));
    } else if (preset === "period_16_end") {
      setStartDate(new Date(y, m, 16).toISOString().slice(0, 10));
      setEndDate(new Date(y, m + 1, 0).toISOString().slice(0, 10));
    } else if (preset === "month") {
      setStartDate(new Date(y, m, 1).toISOString().slice(0, 10));
      setEndDate(new Date(y, m + 1, 0).toISOString().slice(0, 10));
    }
  };

  const handleExportPayrollExcel = () => {
    const url = `/api/attendance/export?format=excel&type=payroll&startDate=${startDate}&endDate=${endDate}&role=${roleFilter}`;
    window.location.href = url;
  };

  const handleExportDetailedCsv = () => {
    const url = `/api/attendance/export?format=csv&type=payroll&startDate=${startDate}&endDate=${endDate}&role=${roleFilter}`;
    window.location.href = url;
  };

  const handleManualOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideFeedback("Logging official override...");

    try {
      const res = await fetch("/api/attendance/manual-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_or_emp_id: manualForm.idNumber,
          direction: manualForm.direction,
          override_reason: manualForm.reason,
          timestamp: new Date(manualForm.timestamp).toISOString(),
          admin_override: true,
        }),
      });

      const newRecord: AttendanceRecord = {
        id: `override-${Date.now()}`,
        timestamp: new Date(manualForm.timestamp).toISOString(),
        student_no: manualForm.idNumber,
        name: manualForm.fullName,
        grade: "Faculty of Science",
        kiosk: "Manual Admin Console",
        direction: manualForm.direction,
        status: "on_time",
        confidence: "100%",
        verification_method: "admin_override",
        override_reason: manualForm.reason,
      };

      setLogs([newRecord, ...logs]);
      setOverrideFeedback("Attendance recorded successfully!");
      setTimeout(() => {
        setIsManualModalOpen(false);
        setOverrideFeedback("");
      }, 1200);
    } catch (err: any) {
      setOverrideFeedback("Failed to record manual attendance.");
    }
  };

  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const isStaff = item.student_no.startsWith("EMP") || item.student_no.startsWith("FAC") || item.student_no.startsWith("ADM");
    const matchesRole =
      roleFilter === "all" || (roleFilter === "staff" && isStaff) || (roleFilter === "student" && !isStaff);
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Attendance Record &amp; Payroll Console</h2>
          <p className="text-xs text-slate-400">
            Biometric timelogs, date-range payroll compilation, and fail-safe manual override entries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Manual Check-In Override</span>
          </button>

          <button
            onClick={handleExportDetailedCsv}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>CSV Report</span>
          </button>

          <button
            onClick={handleExportPayrollExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-lg shadow-emerald-600/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Payroll Excel</span>
          </button>
        </div>
      </div>

      {/* Date Range & Pay Period Filter Card */}
      <div className="glass-card p-5 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Calendar className="w-4 h-4 text-brand-secondary" />
            <span>Payroll Period &amp; Date Range Selection:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 mr-1 font-medium">Quick Presets:</span>
            <button
              onClick={() => handleApplyPreset("today")}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            >
              Today
            </button>
            <button
              onClick={() => handleApplyPreset("this_week")}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            >
              This Week
            </button>
            <button
              onClick={() => handleApplyPreset("period_1_15")}
              className="px-2.5 py-1 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-secondary border border-brand-primary/30 font-medium"
            >
              1st – 15th
            </button>
            <button
              onClick={() => handleApplyPreset("period_16_end")}
              className="px-2.5 py-1 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-secondary border border-brand-primary/30 font-medium"
            >
              16th – End
            </button>
            <button
              onClick={() => handleApplyPreset("month")}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            >
              Full Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Group</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-primary"
            >
              <option value="all">All School Members</option>
              <option value="staff">Faculty &amp; Staff (Payroll Focus)</option>
              <option value="student">Students Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-primary"
            >
              <option value="all">All Check-Ins</option>
              <option value="on_time">On-Time</option>
              <option value="late">Tardy / Late</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records by employee name, ID number, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
          />
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Member / Faculty</th>
                <th className="py-3 px-5">ID Number</th>
                <th className="py-3 px-5">Direction</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Verification Method</th>
                <th className="py-3 px-5">Terminal / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-5 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                    <div className="text-[10px] text-slate-600">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <div className="font-semibold text-slate-100">{log.name}</div>
                    <div className="text-[10px] text-slate-500">{log.grade}</div>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-300 font-medium">{log.student_no}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.direction === "time_in"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {log.direction === "time_in" ? "Time-In" : "Time-Out"}
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
                        <span>Late (Tardy)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    {log.verification_method === "face_biometric" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-brand-secondary font-medium">
                        <Sparkles className="w-3 h-3" />
                        <span>Face Vector ({log.confidence})</span>
                      </span>
                    )}
                    {log.verification_method === "backup_pin" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-medium">
                        <KeyRound className="w-3 h-3" />
                        <span>Backup PIN Override</span>
                      </span>
                    )}
                    {log.verification_method === "admin_override" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 font-medium">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Admin Override</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-slate-400 text-[11px]">
                    <div>{log.kiosk}</div>
                    {log.override_reason && (
                      <div className="text-[10px] text-slate-500 italic mt-0.5">
                        Note: {log.override_reason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Fail-Safe Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Manual Check-In Override</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Use this fail-safe to record an official clock event when a faculty member or student cannot scan their face (e.g. lighting, facial bandage, or kiosk camera glitch).
            </p>

            <form onSubmit={handleManualOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Employee / Student ID
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.idNumber}
                  onChange={(e) => setManualForm({ ...manualForm, idNumber: e.target.value })}
                  placeholder="e.g. EMP-1042"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.fullName}
                  onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                  placeholder="e.g. Dr. Elena Rostova"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Direction
                  </label>
                  <select
                    value={manualForm.direction}
                    onChange={(e) => setManualForm({ ...manualForm, direction: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="time_in">Time-In</option>
                    <option value="time_out">Time-Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={manualForm.timestamp}
                    onChange={(e) => setManualForm({ ...manualForm, timestamp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Justification / Fail-Safe Reason
                </label>
                <select
                  value={manualForm.reason}
                  onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="Face recognition failed - Camera lighting glare">Face recognition failed - Lighting/glare</option>
                  <option value="Facial injury / Medical bandage">Facial injury / Medical bandage</option>
                  <option value="Kiosk camera hardware glitch">Kiosk camera hardware glitch</option>
                  <option value="Official off-campus school business">Official off-campus school business</option>
                  <option value="Gatekeeper verified manually">Gatekeeper verified manually</option>
                </select>
              </div>

              {overrideFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center">
                  {overrideFeedback}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-500/20"
                >
                  Confirm &amp; Log Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

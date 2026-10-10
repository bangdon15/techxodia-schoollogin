"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  KeyRound,
  GraduationCap,
  Briefcase,
  Copy,
  Check,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { CameraEnrollmentModal } from "@/components/CameraEnrollmentModal";

interface DirectoryItem {
  id: string;
  student_or_emp_id: string;
  name: string;
  role: "faculty" | "staff" | "student";
  grade_section: string; // Department for faculty/staff, Grade & Section for students
  avatar_url: string;
  has_biometrics: boolean;
  emergency_contact: string;
  has_backup_pin: boolean;
}

export default function DirectoryManagementPage() {
  const [activeTab, setActiveTab] = useState<"all" | "faculty" | "staff" | "student">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserForEnrollment, setSelectedUserForEnrollment] = useState<{ id: string; name: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [members, setMembers] = useState<DirectoryItem[]>([
    {
      id: "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55",
      student_or_emp_id: "EMP-1042",
      name: "Dr. Elena Rostova",
      role: "faculty",
      grade_section: "Faculty of Science - Chemistry",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
      has_biometrics: true,
      emergency_contact: "+1 (555) 890-1234",
      has_backup_pin: true,
    },
    {
      id: "e5eebc99-9c0b-4ef8-bb6d-6bb9bd380e66",
      student_or_emp_id: "FAC-2026-010",
      name: "Prof. Arthur Pendelton",
      role: "faculty",
      grade_section: "Department of Mathematics",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80",
      has_biometrics: true,
      emergency_contact: "+1 (555) 341-9872",
      has_backup_pin: true,
    },
    {
      id: "e6eebc99-9c0b-4ef8-bb6d-6bb9bd380e77",
      student_or_emp_id: "ADM-1002",
      name: "Michael Chang",
      role: "staff",
      grade_section: "Administration & Registrar",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&auto=format&fit=crop&q=80",
      has_biometrics: false,
      emergency_contact: "+1 (555) 456-7890",
      has_backup_pin: true,
    },
    {
      id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33",
      student_or_emp_id: "STU-2026-0891",
      name: "Sophia Chen",
      role: "student",
      grade_section: "Grade 11 - STEM A",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
      has_biometrics: true,
      emergency_contact: "+1 (555) 234-8901",
      has_backup_pin: true,
    },
    {
      id: "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44",
      student_or_emp_id: "STU-2026-0892",
      name: "Marcus Vance",
      role: "student",
      grade_section: "Grade 10 - Section B",
      avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&auto=format&fit=crop&q=80",
      has_biometrics: true,
      emergency_contact: "+1 (555) 345-9012",
      has_backup_pin: false,
    },
    {
      id: "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66",
      student_or_emp_id: "STU-2026-0899",
      name: "Daniel Rivera",
      role: "student",
      grade_section: "Grade 12 - Advanced Math",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
      has_biometrics: false,
      emergency_contact: "+1 (555) 901-2345",
      has_backup_pin: true,
    },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    role: "faculty" as "faculty" | "staff" | "student",
    department: "",
    emergencyContact: "",
    backupPin: "",
  });

  const handleCopyRegistrationLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/register`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.idNumber) return;

    const newMember: DirectoryItem = {
      id: `user-${Date.now()}`,
      name: formData.name,
      student_or_emp_id: formData.idNumber,
      grade_section: formData.department || (formData.role === "student" ? "General Class" : "Faculty Department"),
      role: formData.role,
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
      has_biometrics: false,
      emergency_contact: formData.emergencyContact,
      has_backup_pin: Boolean(formData.backupPin),
    };

    setMembers([newMember, ...members]);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      idNumber: "",
      role: "faculty",
      department: "",
      emergencyContact: "",
      backupPin: "",
    });

    // Prompt immediate biometric face capture
    setSelectedUserForEnrollment({ id: newMember.id, name: newMember.name });
  };

  const handleEnrollmentSuccess = () => {
    if (!selectedUserForEnrollment) return;
    setMembers((prev) =>
      prev.map((s) => (s.id === selectedUserForEnrollment.id ? { ...s, has_biometrics: true } : s))
    );
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.student_or_emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.grade_section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || m.role === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Faculty, Staff &amp; Student Directory</h2>
          <p className="text-xs text-slate-400">
            Enrolled identities, 512D facial biometric vectors, and fail-safe PIN overrides for kiosks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyRegistrationLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-secondary" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Self-Register Link"}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold text-white transition shadow-lg shadow-brand-primary/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Member</span>
          </button>
        </div>
      </div>

      {/* Role Tabs & Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-full md:w-auto">
          {[
            { id: "all", label: "All Members" },
            { id: "faculty", label: "Teachers & Faculty" },
            { id: "staff", label: "School Staff" },
            { id: "student", label: "Students" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Name &amp; Role</th>
                <th className="py-3 px-5">ID Number</th>
                <th className="py-3 px-5">Department / Grade</th>
                <th className="py-3 px-5">Biometric Status</th>
                <th className="py-3 px-5">Fail-Safe PIN</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-100">{member.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                          {member.role === "faculty" && <GraduationCap className="w-3 h-3 text-brand-secondary" />}
                          {member.role === "staff" && <Briefcase className="w-3 h-3 text-sky-400" />}
                          <span>{member.role === "faculty" ? "Teacher / Faculty" : member.role}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-300 font-medium">{member.student_or_emp_id}</td>
                  <td className="py-3 px-5 text-slate-300">{member.grade_section}</td>
                  <td className="py-3 px-5">
                    {member.has_biometrics ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>512D Vector Enrolled</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        <span>Face Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    {member.has_backup_pin ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <KeyRound className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Not Set</span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() =>
                        setSelectedUserForEnrollment({ id: member.id, name: member.name })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-medium text-slate-200 transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-brand-secondary" />
                      <span>{member.has_biometrics ? "Re-scan Face" : "Enroll Face"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Register Faculty, Staff or Student</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="faculty">Teacher / Faculty Member</option>
                  <option value="staff">School Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {formData.role === "student" ? "Student ID Number" : "Employee ID Number"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder={formData.role === "student" ? "e.g. STU-2026-0941" : "e.g. FAC-2026-015"}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {formData.role === "student" ? "Grade & Section" : "Department / Faculty"}
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder={formData.role === "student" ? "Grade 11 - STEM A" : "Department of Science"}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Fail-Safe 4-Digit Backup PIN</span>
                  <span className="text-[10px] text-amber-400 font-normal">Kiosk Manual Fallback</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={formData.backupPin}
                  onChange={(e) => setFormData({ ...formData, backupPin: e.target.value })}
                  placeholder="e.g. 5812"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono tracking-widest focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold text-white shadow-lg shadow-brand-primary/20"
                >
                  Save &amp; Enroll Face
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Facial Registration Modal */}
      {selectedUserForEnrollment && (
        <CameraEnrollmentModal
          userId={selectedUserForEnrollment.id}
          userName={selectedUserForEnrollment.name}
          isOpen={Boolean(selectedUserForEnrollment)}
          onClose={() => setSelectedUserForEnrollment(null)}
          onEnrolledSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
}

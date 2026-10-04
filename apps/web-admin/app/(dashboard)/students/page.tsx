"use client";

import React, { useState } from "react";
import { Users, UserPlus, Camera, Sparkles, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { CameraEnrollmentModal } from "@/components/CameraEnrollmentModal";

interface StudentItem {
  id: string;
  student_or_emp_id: string;
  name: string;
  role: string;
  grade_section: string;
  avatar_url: string;
  has_biometrics: boolean;
  emergency_contact: string;
}

export default function StudentsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserForEnrollment, setSelectedUserForEnrollment] = useState<{ id: string; name: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [students, setStudents] = useState<StudentItem[]>([
    {
      id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33",
      student_or_emp_id: "STU-2026-0891",
      name: "Sophia Chen",
      role: "student",
      grade_section: "Grade 11 - STEM A",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
      has_biometrics: true,
      emergency_contact: "+1 (555) 234-8901",
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
    },
    {
      id: "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55",
      student_or_emp_id: "EMP-1042",
      name: "Dr. Elena Rostova",
      role: "staff",
      grade_section: "Faculty of Science",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
      has_biometrics: true,
      emergency_contact: "+1 (555) 890-1234",
    },
    {
      id: "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66",
      student_or_emp_id: "STU-2026-0899",
      name: "Daniel Rivera",
      role: "student",
      grade_section: "Grade 12 - Advanced Math",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&auto=format&fit=crop&q=80",
      has_biometrics: false,
      emergency_contact: "+1 (555) 901-2345",
    },
  ]);

  // New Student Form State
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    gradeSection: "",
    emergencyContact: "",
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.studentId) return;

    const newStudent: StudentItem = {
      id: `user-${Date.now()}`,
      name: formData.name,
      student_or_emp_id: formData.studentId,
      grade_section: formData.gradeSection || "General",
      role: "student",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
      has_biometrics: false,
      emergency_contact: formData.emergencyContact,
    };

    setStudents([newStudent, ...students]);
    setIsAddModalOpen(false);
    setFormData({ name: "", studentId: "", gradeSection: "", emergencyContact: "" });

    // Prompt immediate biometric enrollment for the newly created user
    setSelectedUserForEnrollment({ id: newStudent.id, name: newStudent.name });
  };

  const handleEnrollmentSuccess = () => {
    if (!selectedUserForEnrollment) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedUserForEnrollment.id ? { ...s, has_biometrics: true } : s
      )
    );
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_or_emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Students & Faculty Directory</h2>
          <p className="text-xs text-slate-400">
            Manage enrolled identities and 512-dimension face vectors for on-device kiosk matching.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold text-white transition shadow-lg shadow-brand-primary/30"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name or student ID number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-primary transition"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Name & Role</th>
                <th className="py-3 px-5">Student / Employee ID</th>
                <th className="py-3 px-5">Grade / Section</th>
                <th className="py-3 px-5">Emergency Contact</th>
                <th className="py-3 px-5">Biometric Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar_url}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-100">{student.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{student.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-400">{student.student_or_emp_id}</td>
                  <td className="py-3 px-5">{student.grade_section}</td>
                  <td className="py-3 px-5 text-slate-400">{student.emergency_contact || "N/A"}</td>
                  <td className="py-3 px-5">
                    {student.has_biometrics ? (
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
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() =>
                        setSelectedUserForEnrollment({ id: student.id, name: student.name })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-medium text-slate-200 transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-brand-secondary" />
                      <span>{student.has_biometrics ? "Re-scan Face" : "Enroll Face"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Enroll New Student</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lucas Graham"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Student ID Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. STU-2026-0941"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Grade & Section
                </label>
                <input
                  type="text"
                  value={formData.gradeSection}
                  onChange={(e) => setFormData({ ...formData, gradeSection: e.target.value })}
                  placeholder="e.g. Grade 11 - STEM B"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Phone Contact
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. +1 (555) 019-2831"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 rounded-xl text-xs font-semibold text-white"
                >
                  Save & Launch Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Biometric Camera Enrollment Modal */}
      <CameraEnrollmentModal
        isOpen={!!selectedUserForEnrollment}
        userId={selectedUserForEnrollment?.id || ""}
        userName={selectedUserForEnrollment?.name || ""}
        onClose={() => setSelectedUserForEnrollment(null)}
        onEnrolledSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
}

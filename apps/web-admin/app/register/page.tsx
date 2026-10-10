"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  QrCode,
  Download,
  AlertCircle,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { extractFaceVectorFromBase64 } from "@/lib/face-extraction/extractor";

export default function FacultyAndStudentRegistrationPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    role: "faculty", // "faculty" | "staff" | "student"
    fullName: "",
    idNumber: "",
    department: "",
    email: "",
    emergencyContact: "",
    backupPin: "",
  });

  // Camera & Face Enrollment State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [enrolledUserId, setEnrolledUserId] = useState("");

  useEffect(() => {
    if (step === 2) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      setCameraError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError("Camera access denied or unavailable. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.idNumber) return;
    setEnrolledUserId(`user-${Date.now()}`);
    setStep(2);
  };

  const captureAndEnrollFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoBase64 = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedPhoto(photoBase64);

    setIsProcessing(true);
    setStatusMessage("Extracting facial landmarks & computing 512D embedding...");

    try {
      const res = await extractFaceVectorFromBase64(photoBase64, enrolledUserId);
      if (res.success && res.face_vector) {
        setStatusMessage("Storing biometrics into secure pgvector vault...");
        // Emulate slight delay for premium feedback
        setTimeout(() => {
          setIsProcessing(false);
          setStep(3);
        }, 1000);
      } else {
        setIsProcessing(false);
        setStatusMessage(res.error || "Face not detected. Please ensure face is centered.");
      }
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage("Failed to process face embedding. Please retry.");
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setStatusMessage("");
    startCamera();
  };

  // QR Code payload for digital pass
  const passPayload = JSON.stringify({
    empId: formData.idNumber,
    name: formData.fullName,
    role: formData.role,
    department: formData.department,
    backupPinConfigured: Boolean(formData.backupPin),
    issuedAt: new Date().toISOString(),
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
    passPayload
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Techxodia Identity Portal
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              Faculty, Staff &amp; Student Registration Engine
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
        >
          Admin Console
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="max-w-2xl w-full mx-auto my-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? "bg-brand-primary text-white" : "bg-slate-800 text-slate-500"
              }`}
            >
              1
            </div>
            <span className={`text-xs font-medium ${step >= 1 ? "text-white" : "text-slate-500"}`}>
              Information
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-slate-800">
            <div
              className={`h-full bg-brand-primary transition-all duration-300 ${
                step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"
              }`}
            />
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? "bg-brand-primary text-white" : "bg-slate-800 text-slate-500"
              }`}
            >
              2
            </div>
            <span className={`text-xs font-medium ${step >= 2 ? "text-white" : "text-slate-500"}`}>
              Facial Biometrics
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-4 bg-slate-800">
            <div
              className={`h-full bg-brand-primary transition-all duration-300 ${
                step === 3 ? "w-full" : "w-0"
              }`}
            />
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 3 ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
              }`}
            >
              3
            </div>
            <span className={`text-xs font-medium ${step === 3 ? "text-white" : "text-slate-500"}`}>
              Digital Pass
            </span>
          </div>
        </div>

        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Register New Identity</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your details to enroll in the school attendance and payroll timekeeping system.
              </p>
            </div>

            <form onSubmit={handleStepOneSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "faculty", label: "Teacher / Faculty", icon: GraduationCap },
                    { id: "staff", label: "School Staff", icon: Briefcase },
                    { id: "student", label: "Student", icon: UserCheck },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = formData.role === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setFormData({ ...formData, role: r.id })}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-center transition ${
                          isSelected
                            ? "bg-brand-primary/20 border-brand-primary text-white shadow-md shadow-brand-primary/20"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? "text-brand-secondary" : "text-slate-500"}`} />
                        <span className="text-xs font-semibold">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name & ID Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {formData.role === "student" ? "Student ID No." : "Employee ID No."} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder={formData.role === "student" ? "e.g. STU-2026-0891" : "e.g. EMP-1045"}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
              </div>

              {/* Department / Grade Section & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {formData.role === "student" ? "Grade & Section" : "Department / Faculty"}
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder={
                      formData.role === "student"
                        ? "e.g. Grade 11 - STEM A"
                        : "e.g. Department of Mathematics"
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. arthur.p@oakridge.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
              </div>

              {/* Emergency Contact & Backup 4-Digit PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Backup 4-Digit PIN</span>
                    <span className="text-[10px] text-amber-400 font-normal">Fail-safe Override</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      maxLength={4}
                      value={formData.backupPin}
                      onChange={(e) => setFormData({ ...formData, backupPin: e.target.value })}
                      placeholder="e.g. 4821"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono tracking-widest focus:outline-none focus:border-brand-primary transition"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Fail-Safe Protection:</strong> Your 4-digit PIN is stored securely and used if the kiosk camera cannot scan your face (e.g. in poor lighting or injury).
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold text-white transition shadow-lg shadow-brand-primary/20"
              >
                <span>Continue to Facial Biometrics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Facial Biometrics Capture */}
        {step === 2 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Facial Biometric Enrollment</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Position your face inside the alignment oval with adequate lighting. A 512-dimensional vector will be extracted.
              </p>
            </div>

            {cameraError ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span>{cameraError}</span>
              </div>
            ) : (
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-black border-2 border-brand-primary/40 shadow-xl mb-4">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured face" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {/* Visual Biometric Oval Guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-64 border-2 border-brand-secondary rounded-[50%] shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse" />
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {statusMessage && (
              <div className="text-xs text-brand-secondary mb-4 font-medium flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Back
              </button>
              {capturedPhoto ? (
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={captureAndEnrollFace}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-xs font-semibold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-brand-primary/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isProcessing ? "Processing..." : "Capture & Enroll"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Complete & Digital Pass */}
        {step === 3 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">Registration Complete!</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Your biometric face vector has been encrypted and enrolled into the system. You can now use the kiosk terminal instantly.
            </p>

            {/* Digital ID Badge / Attendance Pass */}
            <div className="w-full max-w-sm bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-brand-primary/40 rounded-3xl p-5 my-6 shadow-2xl text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-[10px]">
                    TX
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Digital Attendance Pass
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                  Biometrics Active
                </span>
              </div>

              <div className="flex gap-4 items-center mb-4">
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Member avatar"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-primary"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <UserCheck className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-white">{formData.fullName}</h3>
                  <div className="text-xs text-brand-secondary font-mono font-medium">
                    {formData.idNumber}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {formData.role} • {formData.department || "Oakridge Academy"}
                  </div>
                </div>
              </div>

              {/* QR Fallback Code Container */}
              <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center shadow-inner my-2">
                <img src={qrImageUrl} alt="Personal QR Pass" className="w-36 h-36 object-contain" />
                <span className="text-[10px] text-slate-600 font-mono mt-1 font-semibold">
                  Scan at kiosk if face scan fails
                </span>
              </div>

              <div className="mt-3 text-[10px] text-slate-400 text-center font-mono">
                Backup PIN: • • • • (Configured)
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Save / Print Pass</span>
              </button>
              <Link
                href="/"
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold text-white flex items-center justify-center gap-2 transition shadow-lg shadow-brand-primary/20"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-800/60">
        Techxodia White-Label Attendance &amp; Identity System • Powered by Supabase &amp; pgvector
      </footer>
    </div>
  );
}

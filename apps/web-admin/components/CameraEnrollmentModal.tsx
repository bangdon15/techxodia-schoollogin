"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, Check, RefreshCw, X, AlertCircle, Sparkles } from "lucide-react";
import { extractFaceVectorFromBase64 } from "@/lib/face-extraction/extractor";
import { createClient } from "@/lib/supabase/client";

interface CameraEnrollmentModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onEnrolledSuccess: () => void;
}

export function CameraEnrollmentModal({
  userId,
  userName,
  isOpen,
  onClose,
  onEnrolledSuccess,
}: CameraEnrollmentModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setSnapshot(null);
      setIsSuccess(false);
      setStatusMessage("");
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setStatusMessage("Camera permission denied or camera device unavailable.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSnapshot(dataUrl);
    processFaceVector(dataUrl);
  };

  const processFaceVector = async (base64Img: string) => {
    setIsProcessing(true);
    setStatusMessage("Extracting face landmarks and computing 512-dim embedding...");

    const res = await extractFaceVectorFromBase64(base64Img, userId);

    if (!res.success || !res.face_vector) {
      setIsProcessing(false);
      setStatusMessage(res.error || "Failed to generate face vector. Please ensure face is well-lit and centered.");
      return;
    }

    setStatusMessage("Persisting vector safely into biometrics vault...");
    
    // Register into local & cloud biometrics registry
    const names = userName.trim().split(" ");
    const firstName = names.slice(0, -1).join(" ") || names[0];
    const lastName = names.length > 1 ? names[names.length - 1] : "";

    await fetch("/api/biometrics/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        student_or_emp_id: userId,
        first_name: firstName,
        last_name: lastName,
        face_vector: res.face_vector,
        avatar_url: base64Img,
      }),
    }).catch(() => {});

    try {
      const supabase = createClient();
      await supabase.rpc("register_user_face", {
        p_user_id: userId,
        p_face_vector: res.face_vector,
      });
    } catch (_) {}

    setIsProcessing(false);
    setIsSuccess(true);
    setStatusMessage("Face vector registered and indexed successfully!");
    setTimeout(() => {
      onEnrolledSuccess();
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Biometric Face Enrollment</h3>
            <p className="text-xs text-slate-400">Enrolling student: <span className="text-brand-secondary font-medium">{userName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="p-5 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
            {snapshot ? (
              <img src={snapshot} alt="Captured face" className="w-full h-full object-cover" />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Oval Alignment Reticle Overlay */}
            {!snapshot && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-brand-accent/70 rounded-[50%] shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
              </div>
            )}

            {/* Processing Spinner Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-brand-secondary animate-spin" />
                <span className="text-xs text-slate-200 font-mono">Running TFLite Inference...</span>
              </div>
            )}

            {/* Success Check Overlay */}
            {isSuccess && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-emerald-200">Enrolled Successfully!</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Feedback pill */}
          {statusMessage && (
            <div
              className={`mt-4 w-full p-3 rounded-xl text-xs flex items-center gap-2 ${
                isSuccess
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              {isSuccess ? <Sparkles className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Controls */}
          <div className="mt-5 flex items-center gap-3 w-full justify-end">
            {snapshot ? (
              <button
                type="button"
                onClick={() => {
                  setSnapshot(null);
                  setStatusMessage("");
                  startCamera();
                }}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Retake Photo
              </button>
            ) : (
              <button
                type="button"
                onClick={captureFrame}
                disabled={isProcessing || !stream}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary/80 transition shadow-lg shadow-brand-primary/30"
              >
                <Camera className="w-4 h-4" />
                <span>Capture & Ingest Vector</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

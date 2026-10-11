"use client";

import React, { useState } from "react";
import { X, Copy, Check, QrCode, Tablet, ShieldAlert, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { KioskDevice } from "@/lib/types";

interface KioskQrModalProps {
  kiosk: KioskDevice | null;
  supabaseUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function KioskQrModal({ kiosk, supabaseUrl, isOpen, onClose }: KioskQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !kiosk) return null;

  const gateCode = kiosk.device_name.toLowerCase().includes("north")
    ? "101"
    : kiosk.device_name.toLowerCase().includes("gym")
    ? "102"
    : kiosk.device_name.toLowerCase().includes("cafe")
    ? "103"
    : "104";

  const payload = {
    tenant_id: kiosk.tenant_id,
    kiosk_id: kiosk.id,
    gate_code: gateCode,
    device_name: kiosk.device_name,
    device_token: kiosk.device_token,
    location_tag: kiosk.location_tag,
    supabase_url: "https://web-admin-tau-three.vercel.app",
  };

  const payloadString = JSON.stringify(payload, null, 2);

  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
    JSON.stringify(payload)
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tablet className="w-5 h-5 text-brand-secondary" />
            <div>
              <h3 className="text-base font-semibold text-white">Gate Terminal Setup</h3>
              <p className="text-[11px] text-slate-400">{kiosk.device_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Quick Gate Code Banner for Low-Res Cameras */}
          <div className="w-full bg-gradient-to-r from-blue-950/80 via-slate-900 to-amber-950/40 p-4 rounded-xl border border-blue-500/30 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Instant Gate Quick Code (No Camera Needed)
                </span>
                <div className="text-2xl font-black text-white tracking-widest font-mono mt-0.5">
                  CODE {gateCode}
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-Connect Ready</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Low camera quality on tablet? Just launch the app and tap <strong className="text-brand-secondary">{kiosk.device_name}</strong> in the list or enter code <strong className="text-brand-secondary font-mono">{gateCode}</strong>.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-brand-primary/30">
            <img
              src={qrSvgUrl}
              alt="Kiosk Provisioning QR Code"
              className="w-40 h-40 object-contain rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/bangdon15/techxodia-schoollogin/releases/download/v1.0.0/app-debug.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/40 text-xs font-semibold text-brand-secondary transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </a>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Payload"}</span>
            </button>
          </div>

          {/* Secret token container */}
          <div className="w-full text-left bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
              Terminal Identifier &amp; Location
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {kiosk.location_tag} • <span className="font-mono text-slate-400 text-[11px]">{kiosk.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

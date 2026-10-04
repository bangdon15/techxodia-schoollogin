"use client";

import React, { useState } from "react";
import { X, Copy, Check, QrCode, Tablet, ShieldAlert } from "lucide-react";
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

  const payload = {
    tenant_id: kiosk.tenant_id,
    kiosk_id: kiosk.id,
    device_name: kiosk.device_name,
    device_token: kiosk.device_token,
    location_tag: kiosk.location_tag,
    supabase_url: supabaseUrl,
  };

  const payloadString = JSON.stringify(payload, null, 2);

  // SVG QR Code generator (dynamic representation using data matrix/visual pattern)
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
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tablet className="w-5 h-5 text-brand-secondary" />
            <h3 className="text-base font-semibold text-white">Kiosk Device Enrollment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          <p className="text-xs text-slate-400 mb-4">
            Point the Android Kiosk camera at this QR code during initial boot to securely pair it with{" "}
            <span className="text-brand-secondary font-medium">{kiosk.device_name}</span>.
          </p>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-brand-primary/30">
            <img
              src={qrSvgUrl}
              alt="Kiosk Provisioning QR Code"
              className="w-48 h-48 object-contain rounded-lg"
            />
          </div>

          <div className="mt-4 px-3 py-1.5 rounded-full bg-slate-800 text-[11px] text-slate-300 font-mono">
            Location: {kiosk.location_tag}
          </div>

          {/* Secret token container */}
          <div className="mt-4 w-full text-left bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Device Secret Token
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-brand-secondary hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy Payload"}</span>
              </button>
            </div>
            <code className="text-[11px] text-slate-300 font-mono break-all line-clamp-2">
              {kiosk.device_token}
            </code>
          </div>

          <div className="mt-4 text-[11px] text-amber-400/90 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Store securely. Never commit tablet device tokens to public source repositories.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

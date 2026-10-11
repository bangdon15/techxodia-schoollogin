"use client";

import React, { useState } from "react";
import {
  Tablet,
  PlusCircle,
  QrCode,
  BatteryCharging,
  Battery,
  Wifi,
  Video,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
} from "lucide-react";
import { KioskQrModal } from "@/components/KioskQrModal";
import { KioskDevice } from "@/lib/types";

export default function KioskDevicesPage() {
  const [selectedKioskForQr, setSelectedKioskForQr] = useState<KioskDevice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [kiosks, setKiosks] = useState<KioskDevice[]>([
    {
      id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22",
      tenant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      device_name: "North Gate Tablet 01",
      device_token: "kiosk_secret_token_oakridge_north_gate",
      location_tag: "North Campus Turnstiles",
      is_active: true,
      battery_level: 98,
      is_charging: true,
      camera_status: "OK",
      last_heartbeat_at: new Date(Date.now() - 32000).toISOString(),
      created_at: "2026-09-01T00:00:00Z",
    },
    {
      id: "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33",
      tenant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      device_name: "West Gymnasium Kiosk",
      device_token: "kiosk_secret_token_oakridge_gym_kiosk",
      location_tag: "Gymnasium Main Foyer",
      is_active: true,
      battery_level: 100,
      is_charging: true,
      camera_status: "OK",
      last_heartbeat_at: new Date(Date.now() - 58000).toISOString(),
      created_at: "2026-09-05T00:00:00Z",
    },
    {
      id: "b3eebc99-9c0b-4ef8-bb6d-6bb9bd380b44",
      tenant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      device_name: "Cafeteria Entrance 01",
      device_token: "kiosk_secret_token_oakridge_cafeteria",
      location_tag: "Dining Hall Left Turnstile",
      is_active: true,
      battery_level: 89,
      is_charging: false,
      camera_status: "OK",
      last_heartbeat_at: new Date(Date.now() - 95000).toISOString(),
      created_at: "2026-09-12T00:00:00Z",
    },
  ]);

  const [newDeviceName, setNewDeviceName] = useState("");
  const [newLocationTag, setNewLocationTag] = useState("");

  const handleRegisterKiosk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName || !newLocationTag) return;

    const newKiosk: KioskDevice = {
      id: `kiosk-${Date.now()}`,
      tenant_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      device_name: newDeviceName,
      location_tag: newLocationTag,
      device_token: `kiosk_token_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`,
      is_active: true,
      battery_level: 100,
      is_charging: true,
      camera_status: "OK",
      last_heartbeat_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setKiosks([newKiosk, ...kiosks]);
    setIsAddModalOpen(false);
    setNewDeviceName("");
    setNewLocationTag("");
    setSelectedKioskForQr(newKiosk);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Kiosk Hardware Terminals</h2>
          <p className="text-xs text-slate-400">
            Provision dedicated Android tablets, inspect real-time heartbeats, and generate setup QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/bangdon15/techxodia-schoollogin/releases/download/v1.0.0/app-debug.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Download Tablet APK</span>
          </a>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-xs font-semibold text-white transition shadow-lg shadow-brand-primary/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Provision New Kiosk</span>
          </button>
        </div>
      </div>

      {/* Grid of Kiosks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kiosks.map((kiosk) => (
          <div key={kiosk.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/20 text-brand-secondary flex items-center justify-center border border-brand-primary/40">
                    <Tablet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white">{kiosk.device_name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                        {kiosk.device_name.toLowerCase().includes("north")
                          ? "CODE 101"
                          : kiosk.device_name.toLowerCase().includes("gym")
                          ? "CODE 102"
                          : kiosk.device_name.toLowerCase().includes("cafe")
                          ? "CODE 103"
                          : "CODE 104"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{kiosk.location_tag}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Auto-Connect</span>
                </span>
              </div>

              {/* Telemetry info */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 mb-4 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                    {kiosk.is_charging ? (
                      <BatteryCharging className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Battery className="w-3 h-3 text-slate-400" />
                    )}
                    <span>Battery</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">{kiosk.battery_level}%</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <Video className="w-3 h-3 text-blue-400" />
                    <span>Camera</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">{kiosk.camera_status}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                    <Wifi className="w-3 h-3 text-brand-secondary" />
                    <span>Latency</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">18 ms</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
              <a
                href="https://github.com/bangdon15/techxodia-schoollogin/releases/download/v1.0.0/app-debug.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium text-[11px]"
              >
                <Download className="w-3 h-3 text-brand-secondary" />
                <span>APK</span>
              </a>

              <button
                onClick={() => setSelectedKioskForQr(kiosk)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/40 text-brand-secondary transition font-medium text-[11px]"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Setup / Quick Code</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Provision New Kiosk Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Provision Kiosk Device</h3>
            <form onSubmit={handleRegisterKiosk} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Terminal Name
                </label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. South Campus Main Entrance 02"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Physical Location Tag
                </label>
                <input
                  type="text"
                  required
                  value={newLocationTag}
                  onChange={(e) => setNewLocationTag(e.target.value)}
                  placeholder="e.g. South Turnstiles Bay 4"
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
                  Create & Show QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Provisioning Modal */}
      <KioskQrModal
        kiosk={selectedKioskForQr}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-project.supabase.co"}
        isOpen={!!selectedKioskForQr}
        onClose={() => setSelectedKioskForQr(null)}
      />
    </div>
  );
}

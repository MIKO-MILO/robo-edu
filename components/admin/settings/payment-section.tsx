"use client";

import React from "react";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

/** Read-only status card – data akan diganti dari API backend nanti */
const MOCK_STATUS = {
  isConnected: true,
  mode: "sandbox" as "sandbox" | "production",
  merchantId: "G111111111",
  clientKey: "SB-Mid-client-xxxxxxxxxx",
  lastChecked: "17 Sep 2026, 21:00 WIB",
};

export function PaymentSection() {
  const { isConnected, mode, merchantId, clientKey, lastChecked } = MOCK_STATUS;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground">Konfigurasi Pembayaran</h2>
          <p className="text-sm text-muted-foreground font-medium mt-0.5">Status koneksi gateway pembayaran aktif.</p>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
          Midtrans
        </span>
      </div>

      {/* Status Card */}
      <div className="p-6">
        <div className={`rounded-xl border-2 p-5 flex items-start gap-4 ${
          isConnected
            ? "bg-success-bg/40 border-success/40"
            : "bg-danger-bg/40 border-danger/40"
        }`}>
          {isConnected
            ? <CheckCircle className="size-6 text-success shrink-0 mt-0.5" />
            : <XCircle className="size-6 text-danger shrink-0 mt-0.5" />
          }
          <div>
            <p className={`font-bold text-base ${isConnected ? "text-success" : "text-danger"}`}>
              {isConnected ? "Terhubung & Aktif" : "Tidak Terhubung"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isConnected
                ? `Mode ${mode === "sandbox" ? "Sandbox (Testing)" : "Production (Live)"} · Terakhir dicek: ${lastChecked}`
                : "Kredensial API tidak valid atau belum dikonfigurasi."}
            </p>
          </div>
        </div>
      </div>

      {/* Info Fields (Read-Only) */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Detail Konfigurasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mode</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                mode === "sandbox"
                  ? "bg-warning-bg text-warning border-warning/30"
                  : "bg-success-bg text-success border-success/30"
              }`}>
                {mode === "sandbox" ? "Sandbox" : "Production"}
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Merchant ID</p>
            <p className="text-sm font-mono font-semibold text-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border w-fit">
              {merchantId}
            </p>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client Key (publik)</p>
            <p className="text-sm font-mono font-semibold text-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border">
              {clientKey}
            </p>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Server Key</p>
            <p className="text-sm font-mono font-semibold text-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border tracking-widest">
              ••••••••••••••••••••••••
            </p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="p-5 bg-muted/20 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground font-medium">
          Untuk mengubah kredensial API, hubungi tim teknis atau akses langsung dashboard Midtrans.
        </p>
        <a
          href="https://dashboard.midtrans.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
        >
          Dashboard Midtrans
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}

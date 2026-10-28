"use client";

import React from "react";
import { ExternalLink, CreditCard, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import type { PaymentStatus } from "@/types/enums";

// Tipe data DTO untuk Payment Gateway status (Backend Ready)
export interface MidtransGatewayConfig {
  isConnected: boolean;
  mode: "sandbox" | "production";
  merchantId?: string;
  clientKey?: string;
  lastChecked?: string;
}

/** Mock data awal – disiapkan untuk diintegrasikan dengan API Backend nantinya */
const DEFAULT_GATEWAY_CONFIG: MidtransGatewayConfig = {
  isConnected: true,
  mode: "sandbox",
  merchantId: "G111111111",
  clientKey: "SB-Mid-client-xxxxxxxxxx",
  lastChecked: "17 Sep 2026, 21:00 WIB",
};

/** Sub-komponen Atom: Midtrans Header Logo & Title */
function MidtransHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-accent-blue/40 text-primary border-2 border-border shrink-0">
        <CreditCard className="size-6 stroke-[2.2]" aria-hidden="true" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-heading font-extrabold text-foreground tracking-tight">
            Midtrans
          </h2>

          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
            Official Gateway
          </span>
        </div>

        <p className="text-xs font-medium text-muted-foreground mt-0.5">
          Payment Gateway
        </p>
      </div>
    </div>
  );
}

/** Sub-komponen Atom: Connection Status Badge */
function ConnectionStatusBadge({ isConnected }: { isConnected: boolean }) {
  if (isConnected) {
    return (
      <StatusBadge
        status="APPROVED"
        customLabel="Aktif"
        size="md"
        neo
      />
    );
  }

  return (
    <StatusBadge
      status="CANCELLED"
      customLabel="Tidak Aktif"
      size="md"
      neo
    />
  );
}

/** Sub-komponen Atom: Environment Mode Badge (Read-Only) */
function EnvironmentModeBadge({ mode }: { mode: "sandbox" | "production" }) {
  const isSandbox = mode === "sandbox";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold font-body border select-none whitespace-nowrap ${
        isSandbox
          ? "bg-accent-yellow text-secondary border-border"
          : "bg-accent-green text-success border-border"
      }`}
      title="Mode dikelola melalui konfigurasi server"
    >
      <span
        className={`size-2 rounded-full shrink-0 ${
          isSandbox ? "bg-amber-600 animate-pulse" : "bg-emerald-600"
        }`}
      />

      {isSandbox ? "Sandbox" : "Production"}
    </span>
  );
}

export interface PaymentSectionProps {
  config?: MidtransGatewayConfig;
}

export function PaymentSection({
  config = DEFAULT_GATEWAY_CONFIG,
}: PaymentSectionProps) {
  const { isConnected, mode } = config;

  return (
    <div className="bg-card rounded-2xl border-2 border-border overflow-hidden divide-y-2 divide-border">
      {/* 1. Header & Quick Status */}
      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card">
        <MidtransHeader />

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* 3. Mode Badge (Sandbox / Production) */}
          <EnvironmentModeBadge mode={mode} />

          {/* 2. Status Koneksi (Aktif / Tidak Aktif) */}
          <ConnectionStatusBadge isConnected={isConnected} />
        </div>
      </div>

      {/* 4. Catatan Kecil & Link Dashboard Midtrans */}
      <div className="p-4 md:p-5 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck
            className="size-4 text-primary shrink-0"
            aria-hidden="true"
          />

          <span>
            Kredensial Midtrans dikelola di server dan tidak dapat diubah dari
            halaman ini.
          </span>
        </div>

        <a
          href="https://dashboard.midtrans.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-primary-600 hover:underline transition-colors shrink-0 self-start sm:self-auto"
        >
          <span>Buka Dashboard Midtrans</span>
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
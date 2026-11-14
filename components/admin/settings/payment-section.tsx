"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ExternalLink, CreditCard, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { AdminToggleSwitch } from "@/components/ui/toggle-switch";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────

export interface MidtransGatewayConfig {
  isConnected: boolean;
  mode: "sandbox" | "production";
  merchantId?: string;
  clientKey?: string;
  lastChecked?: string;
}

/** Shape of one channel inside `payment_methods_config` JSON blob. */
export interface PaymentChannelConfig {
  enabled: boolean;
  label?: string;
}

/** Shape of the parsed `payment_methods_config` JSON blob. */
export type PaymentMethodsConfig = Record<string, PaymentChannelConfig>;

/** Default Midtrans display — read from env at boot, never editable from the UI. */
const DEFAULT_GATEWAY_CONFIG: MidtransGatewayConfig = {
  isConnected: true,
  mode: "sandbox",
  merchantId: "G111111111",
  clientKey: "SB-Mid-client-xxxxxxxxxx",
  lastChecked: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB",
};

/** Default channels shown when the DB has no config yet. */
const DEFAULT_CHANNELS: PaymentMethodsConfig = {
  bank_transfer: { enabled: true, label: "Transfer Bank (VA)" },
  gopay: { enabled: true, label: "GoPay" },
  qris: { enabled: true, label: "QRIS" },
  credit_card: { enabled: false, label: "Kartu Kredit" },
  shopeepay: { enabled: false, label: "ShopeePay" },
};

// ── Atom sub-components ──────────────────────────────────────────────────────

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
        <p className="text-xs font-medium text-muted-foreground mt-0.5">Payment Gateway</p>
      </div>
    </div>
  );
}

function ConnectionStatusBadge({ isConnected }: { isConnected: boolean }) {
  return isConnected ? (
    <StatusBadge status="APPROVED" customLabel="Aktif" size="md" neo />
  ) : (
    <StatusBadge status="CANCELLED" customLabel="Tidak Aktif" size="md" neo />
  );
}

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

// ── Main component ───────────────────────────────────────────────────────────

export function PaymentSection() {
  const [gatewayConfig] = useState<MidtransGatewayConfig>(DEFAULT_GATEWAY_CONFIG);
  const [channels, setChannels] = useState<PaymentMethodsConfig>(DEFAULT_CHANNELS);
  const [membershipPrice, setMembershipPrice] = useState<string>("");
  const [membershipMonths, setMembershipMonths] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getSettings();
      const d = res.data;

      // Parse payment_methods_config JSON blob
      if (d.payment_methods_config) {
        try {
          const parsed = JSON.parse(d.payment_methods_config) as PaymentMethodsConfig;
          // Merge with defaults so new channels always appear
          const merged: PaymentMethodsConfig = { ...DEFAULT_CHANNELS };
          for (const key of Object.keys(DEFAULT_CHANNELS)) {
            if (parsed[key] !== undefined) {
              merged[key] = {
                ...DEFAULT_CHANNELS[key],
                ...parsed[key],
              };
            }
          }
          setChannels(merged);
        } catch {
          // Ignore JSON parse errors — use defaults
        }
      }

      if (d.membership_plus_price !== undefined) {
        setMembershipPrice(d.membership_plus_price);
      }
      if (d.membership_plus_duration_months !== undefined) {
        setMembershipMonths(d.membership_plus_duration_months);
      }
    } catch (err) {
      console.error("Failed to load payment settings:", err);
      toast.error("Gagal memuat pengaturan pembayaran.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggleChannel = (key: string, enabled: boolean) => {
    setChannels((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body: Parameters<typeof settingsService.patchSettings>[0] = {
        payment_methods_config: JSON.stringify(channels),
      };

      if (membershipPrice !== "") {
        const price = Number(membershipPrice);
        if (Number.isFinite(price) && price >= 0) {
          body.membership_plus_price = price;
        }
      }

      if (membershipMonths !== "") {
        const months = Number(membershipMonths);
        if (Number.isInteger(months) && months >= 1) {
          body.membership_plus_duration_months = months;
        }
      }

      await settingsService.patchSettings(body);
      toast.success("Pengaturan pembayaran berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan pembayaran.";
      toast.error("Gagal menyimpan", message);
    } finally {
      setIsSaving(false);
    }
  };

  const { isConnected, mode } = gatewayConfig;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-5 bg-muted rounded w-1/4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Midtrans gateway status card */}
      <div className="bg-card rounded-2xl border-2 border-border overflow-hidden divide-y-2 divide-border">
        {/* 1. Header & Quick Status */}
        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card">
          <MidtransHeader />
          <div className="flex items-center gap-3 self-start sm:self-center">
            <EnvironmentModeBadge mode={mode} />
            <ConnectionStatusBadge isConnected={isConnected} />
          </div>
        </div>

        {/* 2. Note */}
        <div className="p-4 md:p-5 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>
              Kredensial Midtrans dikelola di server dan tidak dapat diubah dari halaman ini.
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

      {/* Payment channels toggle */}
      <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
        <div className="p-6">
          <h3 className="text-base font-bold text-foreground mb-1">Metode Pembayaran</h3>
          <p className="text-xs text-muted-foreground mb-5">
            Aktifkan atau nonaktifkan channel pembayaran yang tersedia saat checkout.
          </p>
          <div className="space-y-0 divide-y divide-border border border-border rounded-xl overflow-hidden">
            {Object.entries(channels).map(([key, cfg]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {cfg.label ?? key}
                  </p>
                </div>
                <div className="shrink-0">
                  <AdminToggleSwitch
                    checked={cfg.enabled}
                    onChange={(checked) => handleToggleChannel(key, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership pricing */}
        <div className="p-6">
          <h3 className="text-base font-bold text-foreground mb-1">Harga Membership Plus</h3>
          <p className="text-xs text-muted-foreground mb-5">
            Perubahan langsung tercermin di halaman konfirmasi membership tanpa restart.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Harga (Rp)</label>
              <input
                type="number"
                min="0"
                value={membershipPrice}
                onChange={(e) => setMembershipPrice(e.target.value)}
                placeholder="Contoh: 50000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Durasi (Bulan)</label>
              <input
                type="number"
                min="1"
                value={membershipMonths}
                onChange={(e) => setMembershipMonths(e.target.value)}
                placeholder="Contoh: 1"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 flex justify-end bg-muted/20">
          <Button variant="primary" onClick={handleSave} disabled={isSaving} className="font-bold px-6">
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminToggleSwitch } from "@/components/ui/toggle-switch";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";

interface GeneralFormData {
  /** Stored as `order_expires_hours` in DB */
  orderExpiresHours: string;
}

export function GeneralSection() {
  const [formData, setFormData] = useState<GeneralFormData>({
    orderExpiresHours: "24",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // These toggles have no backend keys yet — kept as local UI state.
  const [enableReviewSystem, setEnableReviewSystem] = useState(true);
  const [enableGuestCheckout, setEnableGuestCheckout] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getSettings();
      const d = res.data;

      setFormData({
        orderExpiresHours: d.order_expires_hours ?? "24",
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Gagal memuat pengaturan umum.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const hours = Number(formData.orderExpiresHours);
    if (!Number.isInteger(hours) || hours < 1) {
      toast.error("Validasi gagal", "Masa berlaku order harus berupa bilangan bulat positif (jam).");
      return;
    }

    setIsSaving(true);
    try {
      await settingsService.patchSettings({
        order_expires_hours: hours,
      });
      toast.success("Pengaturan umum berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan umum.";
      toast.error("Gagal menyimpan", message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-5 bg-muted rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-10 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* Section: Parameter */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Parameter Operasional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Masa Berlaku Order</label>
            <div className="flex items-center gap-2">
              <Input
                name="orderExpiresHours"
                type="number"
                min="1"
                value={formData.orderExpiresHours}
                onChange={handleChange}
                className="w-24 text-center"
              />
              <span className="text-sm text-muted-foreground font-medium">Jam</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Waktu sebelum order yang belum dibayar otomatis dibatalkan.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Toggle Fitur */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-1">Kontrol Fitur</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Toggle berikut bersifat lokal dan belum terhubung ke database.
        </p>
        <div className="space-y-0 divide-y divide-border border border-border rounded-xl overflow-hidden">
          {/* Row 1 */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Sistem Ulasan Produk</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mengizinkan pembeli memberikan rating dan ulasan.</p>
            </div>
            <div className="shrink-0">
              <AdminToggleSwitch
                checked={enableReviewSystem}
                onChange={setEnableReviewSystem}
              />
            </div>
          </div>
          {/* Row 2 */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Checkout Tanpa Login</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mengizinkan pembelian tanpa perlu membuat akun.</p>
            </div>
            <div className="shrink-0">
              <AdminToggleSwitch
                checked={enableGuestCheckout}
                onChange={setEnableGuestCheckout}
              />
            </div>
          </div>
          {/* Row 3 – destructive */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 bg-danger-bg/10 hover:bg-danger-bg/20 transition-colors">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-danger">Mode Pemeliharaan</p>
              <p className="text-xs text-muted-foreground mt-0.5">Toko ditutup sementara dari pelanggan. Admin tetap bisa login.</p>
            </div>
            <div className="shrink-0">
              <AdminToggleSwitch
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
              />
            </div>
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
  );
}

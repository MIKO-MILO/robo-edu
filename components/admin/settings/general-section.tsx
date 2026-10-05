"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminToggleSwitch } from "@/components/ui/toggle-switch";

export function GeneralSection() {
  const [formData, setFormData] = useState({
    stockThreshold: "10",
    paymentValidityMinutes: "60",
    enableReviewSystem: true,
    enableGuestCheckout: false,
    maintenanceMode: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggle = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* Section: Parameter */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Parameter Operasional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Batas Stok Menipis</label>
            <div className="flex items-center gap-2">
              <Input
                name="stockThreshold"
                type="number"
                min="1"
                value={formData.stockThreshold}
                onChange={handleChange}
                className="w-24 text-center"
              />
              <span className="text-sm text-muted-foreground font-medium">Item</span>
            </div>
            <p className="text-xs text-muted-foreground">Admin mendapat peringatan jika stok di bawah angka ini.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Masa Berlaku Pembayaran</label>
            <div className="flex items-center gap-2">
              <Input
                name="paymentValidityMinutes"
                type="number"
                min="1"
                value={formData.paymentValidityMinutes}
                onChange={handleChange}
                className="w-24 text-center"
              />
              <span className="text-sm text-muted-foreground font-medium">Menit</span>
            </div>
            <p className="text-xs text-muted-foreground">Waktu untuk pelanggan menyelesaikan pembayaran setelah checkout.</p>
          </div>
        </div>
      </div>

      {/* Section: Toggle Fitur */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Kontrol Fitur</h3>
        <div className="space-y-0 divide-y divide-border border border-border rounded-xl overflow-hidden">
          {/* Row 1 */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Sistem Ulasan Produk</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mengizinkan pembeli memberikan rating dan ulasan.</p>
            </div>
            <div className="shrink-0">
              <AdminToggleSwitch
                checked={formData.enableReviewSystem}
                onChange={(checked) => handleToggle("enableReviewSystem", checked)}
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
                checked={formData.enableGuestCheckout}
                onChange={(checked) => handleToggle("enableGuestCheckout", checked)}
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
                checked={formData.maintenanceMode}
                onChange={(checked) => handleToggle("maintenanceMode", checked)}
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

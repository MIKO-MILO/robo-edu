"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";

export function OrderExpirySection() {
  const [orderExpiresHours, setOrderExpiresHours] = useState("24");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getSettings();
      setOrderExpiresHours(res.data.order_expires_hours ?? "24");
    } catch (err) {
      console.error("Failed to load order expiry setting:", err);
      toast.error("Gagal memuat pengaturan masa berlaku order.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    const hours = Number(orderExpiresHours);
    if (!Number.isInteger(hours) || hours < 1) {
      toast.error("Validasi gagal", "Masa berlaku order harus berupa bilangan bulat positif (jam).");
      return;
    }

    setIsSaving(true);
    try {
      await settingsService.patchSettings({ order_expires_hours: hours });
      toast.success("Masa berlaku order berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan masa berlaku order.";
      toast.error("Gagal menyimpan", message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-5 bg-muted rounded w-1/4" />
        <div className="h-10 bg-muted rounded w-40" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Masa Berlaku Order</h3>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Durasi sebelum order kedaluwarsa
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={orderExpiresHours}
              onChange={(e) => setOrderExpiresHours(e.target.value)}
              className="w-24 text-center"
            />
            <span className="text-sm text-muted-foreground font-medium">Jam</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Waktu sebelum order yang belum dibayar otomatis dibatalkan.
          </p>
        </div>
      </div>

      <div className="p-6 flex justify-end bg-muted/20">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          className="font-bold px-6"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}

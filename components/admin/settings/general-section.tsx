"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminToggleSwitch } from "@/components/ui/toggle-switch";
import { toast } from "@/components/admin/use-toast";
import { settingsService } from "@/lib/api/services/settings.service";

export function GeneralSection() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Hydrate toggle from the database on mount.
  useEffect(() => {
    setIsLoading(true);
    settingsService
      .getSettings()
      .then((res) => {
        setMaintenanceMode(res.data.maintenance_mode === "true");
      })
      .catch(() => {
        // Non-fatal: fall back to OFF; admin can still toggle and save.
        toast.error("Gagal memuat status mode pemeliharaan dari server.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.patchSettings({
        maintenance_mode: maintenanceMode ? "true" : "false",
      });
      toast.success("Pengaturan umum berhasil disimpan.");
    } catch {
      toast.error("Gagal menyimpan pengaturan. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* Section: Kontrol Fitur */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-1">Kontrol Fitur</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Aktifkan atau nonaktifkan fitur toko secara global. Perubahan disimpan ke database.
        </p>
        <div className="space-y-0 divide-y divide-border border border-border rounded-xl overflow-hidden">
          {/* Mode Pemeliharaan */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 bg-danger-bg/10 hover:bg-danger-bg/20 transition-colors">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-danger">Mode Pemeliharaan</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toko ditutup sementara dari pelanggan. Admin tetap bisa login.
              </p>
            </div>
            <div className="shrink-0">
              <AdminToggleSwitch
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                disabled={isLoading || isSaving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 flex justify-end bg-muted/20">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="font-bold px-6"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";

interface StoreInfoFormData {
  name: string;
  tagline: string;
  logoUrl: string;
}

export function StoreInfoSection() {
  const [formData, setFormData] = useState<StoreInfoFormData>({
    name: "",
    tagline: "",
    logoUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getSettings();
      const d = res.data;
      setFormData({
        name: d.store_name ?? "",
        tagline: d.store_tagline ?? "",
        logoUrl: d.store_logo_url ?? "",
      });
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Gagal memuat pengaturan toko.");
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
    setIsSaving(true);
    try {
      await settingsService.patchSettings({
        store_name: formData.name,
        store_tagline: formData.tagline,
        store_logo_url: formData.logoUrl,
      });
      toast.success("Pengaturan toko berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pengaturan toko.";
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
          {Array.from({ length: 3 }).map((_, i) => (
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
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">
          Identitas Toko
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">
              Nama Toko
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama toko"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="tagline" className="text-sm font-semibold text-foreground">
              Slogan / Tagline
            </label>
            <Input
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="Misal: Belajar sambil bermain"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="logoUrl" className="text-sm font-semibold text-foreground">
              URL Logo Toko
            </label>
            <Input
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://cdn.example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">
              Upload logo ke storage terlebih dahulu, kemudian paste URL-nya di sini.
            </p>
            {formData.logoUrl && (
              <img
                src={formData.logoUrl}
                alt="Logo preview"
                className="mt-2 h-16 w-auto rounded-lg border border-border object-contain bg-muted/30 p-1"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
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

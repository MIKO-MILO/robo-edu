"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";

interface ContactFormData {
  email: string;
  phone: string;
  address: string;
}

export function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    email: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getSettings();
      const d = res.data;
      setFormData({
        email: d.store_email ?? "",
        phone: d.store_phone ?? "",
        address: d.store_address ?? "",
      });
    } catch (err) {
      console.error("Failed to load contact settings:", err);
      toast.error("Gagal memuat data kontak.");
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
        store_email: formData.email,
        store_phone: formData.phone,
        store_address: formData.address,
      });
      toast.success("Data kontak berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan data kontak.";
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
        <h3 className="text-base font-bold text-foreground mb-1">
          Kontak & Lokasi
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Email, nomor telepon, dan alamat yang ditampilkan ke pelanggan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              Email Operasional
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="cs@tokoku.id"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-semibold text-foreground">
              WhatsApp / Telepon
            </label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="address" className="text-sm font-semibold text-foreground">
              Alamat Lengkap Toko
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (digunakan sebagai Origin Address pengiriman)
              </span>
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Jl. ..., Kelurahan, Kecamatan, Kota, Kode Pos"
            />
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

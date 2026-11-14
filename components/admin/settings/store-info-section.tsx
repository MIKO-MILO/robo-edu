"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";

interface StoreInfoFormData {
  name: string;
  tagline: string;
  address: string;
  contact: string;
  email: string;
  instagram: string;
  tiktok: string;
  facebook: string;
}

export function StoreInfoSection() {
  const [formData, setFormData] = useState<StoreInfoFormData>({
    name: "",
    tagline: "",
    address: "",
    contact: "",
    email: "",
    instagram: "",
    tiktok: "",
    facebook: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getSettings();
      const d = res.data;
      setFormData((prev) => ({
        ...prev,
        name: d.store_name ?? "",
        email: d.store_email ?? "",
        contact: d.store_phone ?? "",
        address: d.store_address ?? "",
      }));
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.patchSettings({
        store_name: formData.name,
        store_email: formData.email,
        store_phone: formData.contact,
        store_address: formData.address,
      });
      toast.success("Pengaturan toko berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan toko.";
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
          {Array.from({ length: 6 }).map((_, i) => (
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
      {/* Section: Identitas Toko */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Identitas Toko</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Logo Upload */}
          <div className="md:col-span-2 flex items-center gap-5">
            <div className="shrink-0">
              <div className="relative size-24 rounded-2xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo preview" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="size-5 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="size-7" />
                    <span className="text-[10px] font-semibold text-center leading-tight">Logo Toko</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Logo Toko</p>
              <p className="text-xs text-muted-foreground">Format: JPG, PNG. Maks 2MB. Rekomendasi: 200×200 px.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={handleLogoChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="font-bold"
              >
                <ImagePlus className="size-3.5 mr-1.5" />
                Pilih Gambar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">Nama Toko</label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Masukkan nama toko" />
          </div>
          <div className="space-y-2">
            <label htmlFor="tagline" className="text-sm font-semibold text-foreground">Slogan / Tagline</label>
            <Input id="tagline" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Misal: Belajar sambil bermain" />
          </div>
        </div>
      </div>

      {/* Section: Kontak & Lokasi */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Kontak & Lokasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">Email Operasional</label>
            <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="cs@tokoku.id" />
          </div>
          <div className="space-y-2">
            <label htmlFor="contact" className="text-sm font-semibold text-foreground">WhatsApp / Telepon</label>
            <Input id="contact" name="contact" value={formData.contact} onChange={handleChange} placeholder="08xxxxxxxxxx" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="address" className="text-sm font-semibold text-foreground">
              Alamat Lengkap Toko
              <span className="ml-2 text-xs font-normal text-muted-foreground">(digunakan sebagai Origin Address pengiriman)</span>
            </label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Jl. ..., Kelurahan, Kecamatan, Kota, Kode Pos" />
          </div>
        </div>
      </div>

      {/* Section: Media Sosial */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">Media Sosial</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Informasi media sosial bersifat dekoratif dan belum tersimpan ke database.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="instagram" className="text-sm font-semibold text-foreground">Instagram</label>
            <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/namatoko" />
          </div>
          <div className="space-y-2">
            <label htmlFor="tiktok" className="text-sm font-semibold text-foreground">TikTok</label>
            <Input id="tiktok" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@namatoko" />
          </div>
          <div className="space-y-2">
            <label htmlFor="facebook" className="text-sm font-semibold text-foreground">Facebook</label>
            <Input id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/namatoko" />
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

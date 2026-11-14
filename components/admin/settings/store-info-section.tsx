"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";

interface SocialLink {
  platform: string;
  url: string;
}

interface StoreInfoFormData {
  name: string;
  tagline: string;
  logoUrl: string;
  address: string;
  contact: string;
  email: string;
}

export function StoreInfoSection() {
  const [formData, setFormData] = useState<StoreInfoFormData>({
    name: "",
    tagline: "",
    logoUrl: "",
    address: "",
    contact: "",
    email: "",
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "", url: "" },
  ]);
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
        email: d.store_email ?? "",
        contact: d.store_phone ?? "",
        address: d.store_address ?? "",
      });

      if (d.store_social_links) {
        try {
          const parsed = JSON.parse(d.store_social_links) as SocialLink[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSocialLinks(parsed);
          }
        } catch {
          // ignore parse error, keep default empty row
        }
      }
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

  // ── Social links ──────────────────────────────────────────────────────────

  const handleSocialChange = (
    index: number,
    field: keyof SocialLink,
    value: string,
  ) => {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  };

  const handleAddSocial = () => {
    setSocialLinks((prev) => [...prev, { platform: "", url: "" }]);
  };

  const handleRemoveSocial = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    // Filter out rows where both fields are empty
    const filledLinks = socialLinks.filter(
      (l) => l.platform.trim() || l.url.trim(),
    );

    setIsSaving(true);
    try {
      await settingsService.patchSettings({
        store_name: formData.name,
        store_tagline: formData.tagline,
        store_logo_url: formData.logoUrl,
        store_email: formData.email,
        store_phone: formData.contact,
        store_address: formData.address,
        store_social_links: JSON.stringify(filledLinks),
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

  // ── Loading skeleton ──────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* Section: Identitas Toko */}
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

      {/* Section: Kontak & Lokasi */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-5">
          Kontak & Lokasi
        </h3>
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
            <label htmlFor="contact" className="text-sm font-semibold text-foreground">
              WhatsApp / Telepon
            </label>
            <Input
              id="contact"
              name="contact"
              value={formData.contact}
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

      {/* Section: Media Sosial */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-foreground">Media Sosial</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Link ini ditampilkan di footer dan halaman kontak.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSocial}
            className="font-bold shrink-0"
          >
            <Plus className="size-3.5 mr-1.5" />
            Tambah
          </Button>
        </div>

        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={link.platform}
                onChange={(e) =>
                  handleSocialChange(index, "platform", e.target.value)
                }
                placeholder="Platform (misal: Instagram)"
                className="w-40 shrink-0"
              />
              <Input
                value={link.url}
                onChange={(e) =>
                  handleSocialChange(index, "url", e.target.value)
                }
                placeholder="https://instagram.com/namatoko"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSocial(index)}
                disabled={socialLinks.length === 1}
                className="shrink-0 text-muted-foreground hover:text-danger"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action */}
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

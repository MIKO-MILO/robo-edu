"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminTextarea } from "@/components/admin/form/textarea";
import { toast } from "@/components/admin/use-toast";
import { landingConfigService } from "@/lib/api/services/landing-config.service";
import { DEFAULT_HERO, type LandingHeroConfig } from "@/src/lib/landing/defaults";

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-5">
      <div className="h-5 bg-muted rounded w-1/4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 bg-muted rounded w-1/5" />
            <div className="h-11 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function HeroEditorSection() {
  const [form, setForm]       = useState<LandingHeroConfig>(DEFAULT_HERO);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [errors, setErrors]       = useState<Partial<Record<keyof LandingHeroConfig, string>>>({});

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await landingConfigService.getConfig();
      setForm(res.data.hero);
    } catch {
      toast.error("Gagal memuat konten Hero.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.headline.trim())          e.headline          = "Headline tidak boleh kosong.";
    if (!form.description.trim())       e.description       = "Deskripsi tidak boleh kosong.";
    if (!form.ctaPrimaryLabel.trim())   e.ctaPrimaryLabel   = "Label CTA utama tidak boleh kosong.";
    if (!form.ctaPrimaryUrl.trim())     e.ctaPrimaryUrl     = "URL CTA utama tidak boleh kosong.";
    if (!form.ctaSecondaryLabel.trim()) e.ctaSecondaryLabel = "Label CTA sekunder tidak boleh kosong.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await landingConfigService.patchConfig({ hero: form });
      toast.success("Section Hero berhasil disimpan.");
      setErrors({});
    } catch (err: unknown) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <HeroSkeleton />;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-1">Hero Section</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Teks headline, deskripsi, dan tombol CTA yang muncul paling atas halaman utama.
          Gambar/aset visual (robot, background) tidak termasuk scope ini.
        </p>

        <div className="space-y-5">
          {/* Headline */}
          <AdminInput
            label="Headline Utama"
            required
            value={form.headline}
            onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
            error={errors.headline}
            placeholder="Rakit & Mainkan Robot Impian Anak"
            maxLength={120}
          />

          {/* Description */}
          <AdminTextarea
            label="Deskripsi / Subtext"
            required
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            error={errors.description}
            placeholder="Bantu si kecil belajar..."
            maxChars={300}
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CTA Primary Label */}
            <AdminInput
              label="Label Tombol CTA Utama"
              required
              value={form.ctaPrimaryLabel}
              onChange={(e) => setForm((p) => ({ ...p, ctaPrimaryLabel: e.target.value }))}
              error={errors.ctaPrimaryLabel}
              placeholder="Jelajahi Mainan Robot"
            />

            {/* CTA Primary URL */}
            <AdminInput
              label="URL Tujuan CTA Utama"
              required
              value={form.ctaPrimaryUrl}
              onChange={(e) => setForm((p) => ({ ...p, ctaPrimaryUrl: e.target.value }))}
              error={errors.ctaPrimaryUrl}
              placeholder="/product"
              helperText="Gunakan path relatif, cth: /product"
            />

            {/* CTA Secondary Label */}
            <AdminInput
              label="Label Tombol CTA Sekunder"
              required
              value={form.ctaSecondaryLabel}
              onChange={(e) => setForm((p) => ({ ...p, ctaSecondaryLabel: e.target.value }))}
              error={errors.ctaSecondaryLabel}
              placeholder="Tonton Demo"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 flex justify-end bg-muted/20">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          className="font-bold px-6"
        >
          {isSaving ? "Menyimpan..." : "Simpan Hero"}
        </Button>
      </div>
    </div>
  );
}

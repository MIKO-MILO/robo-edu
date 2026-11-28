"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminTextarea } from "@/components/admin/form/textarea";
import { toast } from "@/components/admin/use-toast";
import { landingConfigService } from "@/lib/api/services/landing-config.service";
import { DEFAULT_ABOUT, type LandingAboutConfig } from "@/src/lib/landing/defaults";

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function AboutSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-5">
      <div className="h-5 bg-muted rounded w-1/4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3.5 bg-muted rounded w-1/5" />
          <div className="h-11 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function AboutEditorSection() {
  const [form, setForm]           = useState<LandingAboutConfig>(DEFAULT_ABOUT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await landingConfigService.getConfig();
      setForm(res.data.about);
    } catch {
      toast.error("Gagal memuat konten About.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.badgeLabel.trim())    e.badgeLabel    = "Badge label tidak boleh kosong.";
    if (!form.titleMain.trim())     e.titleMain     = "Judul bagian 1 tidak boleh kosong.";
    if (!form.titleHighlight.trim()) e.titleHighlight = "Judul bagian 2 tidak boleh kosong.";
    if (!form.description.trim())   e.description   = "Deskripsi tidak boleh kosong.";
    form.features.forEach((f, i) => {
      if (!f.label.trim()) e[`feature_${i}`] = "Label tidak boleh kosong.";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await landingConfigService.patchConfig({ about: form });
      toast.success("Section About berhasil disimpan.");
      setErrors({});
    } catch (err: unknown) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const setFeatureLabel = (index: number, label: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, label } : f)),
    }));
  };

  if (isLoading) return <AboutSkeleton />;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-1">About Section (ICardsInfo)</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Badge, judul, deskripsi, dan 4 poin fitur checklist yang ditampilkan di section "Tentang Kami".
        </p>

        <div className="space-y-5">
          {/* Badge */}
          <AdminInput
            label="Badge Label"
            required
            value={form.badgeLabel}
            onChange={(e) => setForm((p) => ({ ...p, badgeLabel: e.target.value }))}
            error={errors.badgeLabel}
            placeholder="Tentang Kami"
            maxLength={50}
          />

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AdminInput
              label="Judul Bagian 1 (titleMain)"
              required
              value={form.titleMain}
              onChange={(e) => setForm((p) => ({ ...p, titleMain: e.target.value }))}
              error={errors.titleMain}
              placeholder="Aman, Seru & Edukatif —"
              maxLength={80}
            />
            <AdminInput
              label="Judul Bagian 2 (titleHighlight)"
              required
              value={form.titleHighlight}
              onChange={(e) => setForm((p) => ({ ...p, titleHighlight: e.target.value }))}
              error={errors.titleHighlight}
              placeholder="Impian Setiap Anak"
              maxLength={80}
            />
          </div>

          {/* Description */}
          <AdminTextarea
            label="Deskripsi Paragraf"
            required
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            error={errors.description}
            placeholder="Deskripsi singkat tentang produk..."
            maxChars={400}
            rows={3}
          />

          {/* Feature points (always 4) */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">
              Feature Checklist (4 item, jumlah tetap)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.features.map((feature, idx) => (
                <AdminInput
                  key={feature.id}
                  label={`Poin ${idx + 1}`}
                  required
                  value={feature.label}
                  onChange={(e) => setFeatureLabel(idx, e.target.value)}
                  error={errors[`feature_${idx}`]}
                  placeholder={`Contoh: Learning & Fun`}
                  maxLength={60}
                />
              ))}
            </div>
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
          {isSaving ? "Menyimpan..." : "Simpan About"}
        </Button>
      </div>
    </div>
  );
}

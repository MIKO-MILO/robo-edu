"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminTextarea } from "@/components/admin/form/textarea";
import { toast } from "@/components/admin/use-toast";
import { landingConfigService } from "@/lib/api/services/landing-config.service";
import {
  DEFAULT_VIDEO_DEMO,
  type LandingVideoDemoConfig,
} from "@/src/lib/landing/defaults";
import { isValidYouTubeUrl, getYouTubeThumbnailUrl } from "@/src/lib/landing/youtube";

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function VideoDemoSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-5">
      <div className="h-5 bg-muted rounded w-1/4" />
      {Array.from({ length: 3 }).map((_, i) => (
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
export function VideoDemoEditorSection() {
  const [form, setForm]           = useState<LandingVideoDemoConfig>(DEFAULT_VIDEO_DEMO);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [errors, setErrors]       = useState<Partial<Record<keyof LandingVideoDemoConfig, string>>>({});

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await landingConfigService.getConfig();
      setForm(res.data.videoDemo);
    } catch {
      toast.error("Gagal memuat konten Video Demo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim())       e.title       = "Judul tidak boleh kosong.";
    if (!form.description.trim()) e.description = "Deskripsi tidak boleh kosong.";
    if (!isValidYouTubeUrl(form.videoSrc)) {
      e.videoSrc = "URL YouTube tidak valid. Gunakan format https://www.youtube.com/watch?v=... atau https://youtu.be/...";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Validasi gagal", "Perikkan kembali field yang ditandai merah.");
      return;
    }
    setIsSaving(true);
    try {
      await landingConfigService.patchConfig({ videoDemo: form });
      toast.success("Section Video Demo berhasil disimpan.");
      setErrors({});
    } catch (err: unknown) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const ytThumb = getYouTubeThumbnailUrl(form.videoSrc);
  const isYouTube = isValidYouTubeUrl(form.videoSrc);

  if (isLoading) return <VideoDemoSkeleton />;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-1">Video Demo Section</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Judul, deskripsi, dan URL YouTube untuk section video demo. Saat pengunjung
          klik tombol play di halaman publik, video YouTube akan diputar di popup modal.
        </p>

        <div className="space-y-5">
          {/* Title */}
          <AdminInput
            label="Judul Section"
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            error={errors.title}
            placeholder="Merakit Robot Pertama"
            maxLength={100}
          />

          {/* Description */}
          <AdminTextarea
            label="Deskripsi Section"
            required
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            error={errors.description}
            placeholder="Saksikan keseruan anak-anak belajar merakit robot..."
            maxChars={300}
            rows={3}
          />

          {/* YouTube URL */}
          <AdminInput
            label="URL YouTube"
            required
            leftIcon={<LinkIcon className="size-4" />}
            value={form.videoSrc}
            onChange={(e) => setForm((p) => ({ ...p, videoSrc: e.target.value }))}
            error={errors.videoSrc}
            helperText="Contoh: https://www.youtube.com/watch?v=xxxxxxxxxxx atau https://youtu.be/xxxxxxxxxxx"
            placeholder="https://www.youtube.com/watch?v=..."
          />

          {/* Live preview hint */}
          {isYouTube && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
              <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                {/* Preview pakai <img> biasa untuk menghindari konfigurasi domain tambahan */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ytThumb ?? ""}
                  alt="Preview thumbnail YouTube"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-success font-medium">
                URL YouTube valid. Thumbnail di halaman publik akan otomatis diambil dari video ini.
              </p>
            </div>
          )}
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
          {isSaving ? "Menyimpan..." : "Simpan Video Demo"}
        </Button>
      </div>
    </div>
  );
}

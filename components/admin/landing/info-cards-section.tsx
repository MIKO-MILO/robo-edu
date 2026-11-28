"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminTextarea } from "@/components/admin/form/textarea";
import { toast } from "@/components/admin/use-toast";
import { landingConfigService } from "@/lib/api/services/landing-config.service";
import { DEFAULT_INFO_CARDS, type LandingInfoCardsConfig } from "@/src/lib/landing/defaults";

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function InfoCardsSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-5">
      <div className="h-5 bg-muted rounded w-1/4" />
      {Array.from({ length: 4 }).map((_, i) => (
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
export function InfoCardsEditorSection() {
  const [cards, setCards]   = useState<LandingInfoCardsConfig>(DEFAULT_INFO_CARDS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await landingConfigService.getConfig();
      setCards(res.data.infoCards);
    } catch {
      toast.error("Gagal memuat konten InfoCards.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    cards.forEach((c, i) => {
      if (!c.title.trim())       e[`title_${i}`]       = "Judul tidak boleh kosong.";
      if (!c.description.trim()) e[`description_${i}`] = "Deskripsi tidak boleh kosong.";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await landingConfigService.patchConfig({ infoCards: cards });
      toast.success("Section InfoCards berhasil disimpan.");
      setErrors({});
    } catch (err: unknown) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const setCard = (index: number, field: "title" | "description", value: string) => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  if (isLoading) return <InfoCardsSkeleton />;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-1">InfoCards Section</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Judul & deskripsi untuk 4 kartu fitur di landing page. Jumlah kartu tetap 4,
          ikon tidak bisa diganti (dikontrol developer).
        </p>

        <div className="space-y-5">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className="border border-border rounded-xl p-4 bg-muted/10 space-y-4"
            >
              <p className="text-xs font-bold text-foreground font-heading uppercase tracking-wide">
                Kartu {idx + 1}
              </p>
              <AdminInput
                label="Judul Kartu"
                required
                value={card.title}
                onChange={(e) => setCard(idx, "title", e.target.value)}
                error={errors[`title_${idx}`]}
                placeholder="Aman Untuk Usia 6+"
                maxLength={80}
              />
              <AdminTextarea
                label="Deskripsi Kartu"
                required
                value={card.description}
                onChange={(e) => setCard(idx, "description", e.target.value)}
                error={errors[`description_${idx}`]}
                placeholder="Bahan ramah anak, tanpa sudut tajam, & teruji aman."
                maxChars={200}
                rows={2}
                className="min-h-[70px]"
              />
            </div>
          ))}
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
          {isSaving ? "Menyimpan..." : "Simpan InfoCards"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { toast } from "@/components/admin/use-toast";
import { landingConfigService } from "@/lib/api/services/landing-config.service";
import { DEFAULT_MARQUEE, type LandingMarqueeConfig } from "@/src/lib/landing/defaults";

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-5">
      <div className="h-5 bg-muted rounded w-1/4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-11 bg-muted rounded" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function MarqueeEditorSection() {
  const [form, setForm]       = useState<LandingMarqueeConfig>(DEFAULT_MARQUEE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await landingConfigService.getConfig();
      setForm(res.data.marquee);
    } catch {
      toast.error("Gagal memuat konten Marquee.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.items.length === 0) {
      e.items = "Minimal 1 item marquee harus ada.";
    } else {
      form.items.forEach((item, i) => {
        if (!item.trim()) e[`item_${i}`] = "Teks item tidak boleh kosong.";
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Add / remove items ──────────────────────────────────────────────────
  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, ""] }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) {
      toast.warning("Minimal 1 item harus ada.");
      return;
    }
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const setItem = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? value : item)),
    }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      if (errors.items) toast.warning(errors.items);
      return;
    }
    setIsSaving(true);
    try {
      await landingConfigService.patchConfig({ marquee: form });
      toast.success("Section Marquee berhasil disimpan.");
      setErrors({});
    } catch (err: unknown) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <MarqueeSkeleton />;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-1">TextMarquee Section</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Daftar teks berjalan (pita kuning) di landing page. Bisa tambah, edit, dan
          hapus item — minimal 1 item harus ada.
        </p>

        <div className="space-y-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-1">
                <AdminInput
                  label={idx === 0 ? "Item Teks" : undefined}
                  required
                  value={item}
                  onChange={(e) => setItem(idx, e.target.value)}
                  error={errors[`item_${idx}`]}
                  placeholder="ROBOEDU"
                  maxLength={30}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(idx)}
                disabled={form.items.length <= 1}
                className="text-danger hover:text-danger hover:bg-danger-bg/20 mt-0.5"
                aria-label="Hapus item"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          {/* Add button */}
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full border-dashed hover:bg-muted/40"
          >
            <Plus className="size-4" />
            Tambah Item
          </Button>
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
          {isSaving ? "Menyimpan..." : "Simpan Marquee"}
        </Button>
      </div>
    </div>
  );
}

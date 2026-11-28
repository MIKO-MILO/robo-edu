"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminTextarea } from "@/components/admin/form/textarea";
import { toast } from "@/components/admin/use-toast";
import { landingConfigService } from "@/lib/api/services/landing-config.service";
import {
  DEFAULT_FAQ,
  type LandingFAQConfig,
  type LandingFAQItem,
} from "@/src/lib/landing/defaults";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function FAQSkeleton() {
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
// FAQ item row editor (pertanyaan + jawaban + tombol aksi)
// ─────────────────────────────────────────────────────────────────────────────
function FAQItemRow({
  item,
  index,
  total,
  errors,
  onChangeQuestion,
  onChangeAnswer,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  item: LandingFAQItem;
  index: number;
  total: number;
  errors: Record<string, string>;
  onChangeQuestion: (v: string) => void;
  onChangeAnswer: (v: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border border-border rounded-xl bg-muted/10 overflow-hidden">
      {/* Row header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/20 border-b border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <GripVertical className="size-4 shrink-0 opacity-50" aria-hidden="true" />
          <span className="text-xs font-heading font-bold text-foreground uppercase tracking-wide">
            Pertanyaan {index + 1}
          </span>
        </div>

        {/* Reorder + Delete buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              index === 0
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
            )}
            aria-label="Pindah ke atas"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              index === total - 1
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
            )}
            aria-label="Pindah ke bawah"
          >
            <ChevronDownIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={total <= 1}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              total <= 1
                ? "text-danger/30 cursor-not-allowed"
                : "hover:bg-danger-bg/20 text-danger cursor-pointer",
            )}
            aria-label="Hapus pertanyaan"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-4">
        <AdminInput
          label="Pertanyaan"
          required
          value={item.question}
          onChange={(e) => onChangeQuestion(e.target.value)}
          error={errors[`q_${index}`]}
          placeholder="Apakah mainan ini aman untuk anak-anak?"
          maxLength={200}
        />
        <AdminTextarea
          label="Jawaban"
          required
          value={item.answer}
          onChange={(e) => onChangeAnswer(e.target.value)}
          error={errors[`a_${index}`]}
          placeholder="Sangat aman! ..."
          maxChars={600}
          rows={3}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function FAQEditorSection() {
  const [form, setForm]           = useState<LandingFAQConfig>(DEFAULT_FAQ);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await landingConfigService.getConfig();
      setForm(res.data.faq);
    } catch {
      toast.error("Gagal memuat konten FAQ.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim())       e.title       = "Judul section tidak boleh kosong.";
    if (!form.description.trim()) e.description = "Deskripsi section tidak boleh kosong.";

    // Promo banner
    if (!form.promoBanner.titlePrefix.trim())
      e.promoTitle = "Judul promo tidak boleh kosong.";
    if (!form.promoBanner.description.trim())
      e.promoDesc  = "Deskripsi promo tidak boleh kosong.";
    form.promoBanner.photos.forEach((url, i) => {
      if (!url.trim()) e[`photo_${i}`] = "URL foto tidak boleh kosong.";
    });

    // Items
    if (form.items.length === 0) {
      e.items = "Minimal 1 pertanyaan FAQ harus ada.";
    } else {
      form.items.forEach((item, i) => {
        if (!item.question.trim()) e[`q_${i}`] = "Pertanyaan tidak boleh kosong.";
        if (!item.answer.trim())   e[`a_${i}`] = "Jawaban tidak boleh kosong.";
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Validasi gagal", "Periksa kembali field yang ditandai merah.");
      return;
    }
    setIsSaving(true);
    try {
      await landingConfigService.patchConfig({ faq: form });
      toast.success("Section FAQ berhasil disimpan.");
      setErrors({});
    } catch (err: unknown) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── FAQ item helpers ──────────────────────────────────────────────────────
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: `faq-${Date.now()}`, question: "", answer: "" },
      ],
    }));
  };

  const deleteItem = (index: number) => {
    if (form.items.length <= 1) {
      toast.warning("Minimal 1 pertanyaan FAQ harus ada.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...form.items];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const setItemField = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const setPhoto = (index: number, url: string) => {
    setForm((prev) => ({
      ...prev,
      promoBanner: {
        ...prev.promoBanner,
        photos: prev.promoBanner.photos.map((p, i) => (i === index ? url : p)),
      },
    }));
  };

  if (isLoading) return <FAQSkeleton />;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* ── Section header & general fields ─────────────────────────────── */}
      <div className="p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-foreground mb-1">FAQ Section</h3>
          <p className="text-xs text-muted-foreground">
            Judul, deskripsi, promo banner, dan daftar Q&A accordion di halaman utama.
          </p>
        </div>

        <AdminInput
          label="Judul Section"
          required
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          error={errors.title}
          placeholder="Pertanyaan yang Sering Diajukan"
          maxLength={120}
        />

        <AdminTextarea
          label="Deskripsi Section"
          required
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          error={errors.description}
          placeholder="Punya pertanyaan mengenai mainan IoT RoboEdu?..."
          maxChars={300}
          rows={2}
        />
      </div>

      {/* ── Promo banner ─────────────────────────────────────────────────── */}
      <div className="p-6 space-y-5">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">Promo Banner</h4>
          <p className="text-xs text-muted-foreground">
            Banner promo di bagian atas FAQ dengan 4 thumbnail foto.
          </p>
        </div>

        <AdminInput
          label="Judul Prefix Promo"
          required
          value={form.promoBanner.titlePrefix}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              promoBanner: { ...p.promoBanner, titlePrefix: e.target.value },
            }))
          }
          error={errors.promoTitle}
          placeholder="Dapatkan Mainan IoT Edukatif RoboEdu"
          maxLength={100}
        />

        <AdminTextarea
          label="Deskripsi Promo"
          required
          value={form.promoBanner.description}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              promoBanner: { ...p.promoBanner, description: e.target.value },
            }))
          }
          error={errors.promoDesc}
          placeholder="Dapatkan paket lengkapnya hari ini..."
          maxChars={200}
          rows={2}
        />

        <div>
          <p className="text-xs font-semibold text-foreground mb-3">
            4 Foto Thumbnail Promo
            <span className="ml-1.5 font-normal text-muted-foreground">
              (isi URL atau path gambar, contoh: /images/foto.jpg)
            </span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.promoBanner.photos.map((photo, idx) => (
              <AdminInput
                key={idx}
                label={`Foto ${idx + 1}`}
                required
                value={photo}
                onChange={(e) => setPhoto(idx, e.target.value)}
                error={errors[`photo_${idx}`]}
                placeholder="/images/foto.jpg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ items ────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-foreground mb-0.5">
              Daftar Pertanyaan & Jawaban
            </h4>
            <p className="text-xs text-muted-foreground">
              {form.items.length} pertanyaan · Gunakan ▲▼ untuk mengatur urutan
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="shrink-0"
          >
            <Plus className="size-4" />
            Tambah Pertanyaan
          </Button>
        </div>

        {errors.items && (
          <p className="text-xs font-medium text-danger">{errors.items}</p>
        )}

        <div className="space-y-3">
          {form.items.map((item, idx) => (
            <FAQItemRow
              key={item.id || `faq-${idx}`}
              item={item}
              index={idx}
              total={form.items.length}
              errors={errors}
              onChangeQuestion={(v) => setItemField(idx, "question", v)}
              onChangeAnswer={(v) => setItemField(idx, "answer", v)}
              onMoveUp={() => moveItem(idx, "up")}
              onMoveDown={() => moveItem(idx, "down")}
              onDelete={() => deleteItem(idx)}
            />
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
          {isSaving ? "Menyimpan..." : "Simpan FAQ"}
        </Button>
      </div>
    </div>
  );
}

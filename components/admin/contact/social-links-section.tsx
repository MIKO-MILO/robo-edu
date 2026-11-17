"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";
import { SocialPlatformSelect } from "./social-platform-select";

interface SocialLink {
  platform: string;
  url: string;
}

export function SocialLinksSection() {
  const [links, setLinks] = useState<SocialLink[]>([{ platform: "", url: "" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getSettings();
      const raw = res.data.store_social_links;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as SocialLink[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLinks(parsed);
            return;
          }
        } catch {
          // ignore malformed JSON, fall through to default
        }
      }
      setLinks([{ platform: "", url: "" }]);
    } catch (err) {
      console.error("Failed to load social links:", err);
      toast.error("Gagal memuat data media sosial.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handlePlatformChange = (index: number, value: string) => {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, platform: value } : link)),
    );
  };

  const handleUrlChange = (index: number, value: string) => {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, url: value } : link)),
    );
  };

  const handleAdd = () => {
    setLinks((prev) => [...prev, { platform: "", url: "" }]);
  };

  const handleRemove = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const filled = links.filter((l) => l.platform.trim() || l.url.trim());

    setIsSaving(true);
    try {
      await settingsService.patchSettings({
        store_social_links: JSON.stringify(filled),
      });
      toast.success("Media sosial berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan media sosial.";
      toast.error("Gagal menyimpan", message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-5 bg-muted rounded w-1/4" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
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
            onClick={handleAdd}
            className="font-bold shrink-0"
          >
            <Plus className="size-3.5 mr-1.5" />
            Tambah
          </Button>
        </div>

        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <SocialPlatformSelect
                value={link.platform}
                onChange={(val) => handlePlatformChange(index, val)}
                className="w-44 shrink-0"
              />
              <Input
                value={link.url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://..."
                className="flex-1 min-w-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={links.length === 1}
                className="shrink-0 text-muted-foreground hover:text-danger"
                aria-label="Hapus baris"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
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

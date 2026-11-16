"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/lib/api/services/settings.service";
import { toast } from "@/components/admin/use-toast";
import { http } from "@/lib/api/base-client";
import { Truck, CheckCircle2 } from "lucide-react";

interface ShippingProvider {
  provider_id: string;
  provider_name: string;
  service: string;
  service_label: string;
  badge?: string;
  badge_variant?: string;
  estimate?: string;
  cost?: number;
}

interface UniqueProvider {
  id: string;
  name: string;
}

function dedupe(providers: ShippingProvider[]): UniqueProvider[] {
  const seen = new Set<string>();
  const result: UniqueProvider[] = [];
  for (const p of providers) {
    if (!seen.has(p.provider_id)) {
      seen.add(p.provider_id);
      result.push({ id: p.provider_id, name: p.provider_name });
    }
  }
  return result;
}

export function ShippingSection() {
  const [providers, setProviders] = useState<UniqueProvider[]>([]);
  const [defaultProviderId, setDefaultProviderId] = useState<string>("");
  const [pendingDefault, setPendingDefault] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsRes, providersRes] = await Promise.all([
        settingsService.getSettings(),
        http.get<{ success: boolean; data: ShippingProvider[] }>("/api/shipping-providers"),
      ]);

      const unique = dedupe(providersRes.data ?? []);
      setProviders(unique);

      const currentDefault = settingsRes.data.shipping_default_provider_id ?? "";
      setDefaultProviderId(currentDefault);
      setPendingDefault(currentDefault);
    } catch (err) {
      console.error("Failed to load shipping settings:", err);
      toast.error("Gagal memuat pengaturan pengiriman.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!pendingDefault) {
      toast.error("Pilih provider default terlebih dahulu.");
      return;
    }
    setIsSaving(true);
    try {
      await settingsService.patchSettings({
        shipping_default_provider_id: pendingDefault,
      });
      setDefaultProviderId(pendingDefault);
      toast.success("Provider pengiriman default berhasil disimpan.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan pengiriman.";
      toast.error("Gagal menyimpan", message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-5 bg-muted rounded w-1/4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">
          Konfigurasi Pengiriman
        </h2>
        <p className="text-sm text-muted-foreground">
          Pilih provider pengiriman default yang digunakan saat checkout.
        </p>
      </div>

      {/* Provider list */}
      <div className="p-6">
        <h3 className="text-base font-bold text-foreground mb-4">Provider Aktif</h3>

        {providers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Truck className="size-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada provider pengiriman aktif.</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-bold border-b border-border">
                  <tr>
                    <th className="px-5 py-4 w-12"></th>
                    <th className="px-5 py-4">Nama Provider</th>
                    <th className="px-5 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {providers.map((provider) => {
                    const isDefault = provider.id === defaultProviderId;
                    const isPending = provider.id === pendingDefault;
                    return (
                      <tr
                        key={provider.id}
                        className={`transition-colors cursor-pointer ${
                          isPending
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-muted/20"
                        }`}
                        onClick={() => setPendingDefault(provider.id)}
                      >
                        {/* Radio indicator */}
                        <td className="px-5 py-4">
                          <div
                            className={`size-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isPending
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isPending && (
                              <div className="size-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-foreground text-base">
                          {provider.name}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isDefault ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5">
                              <CheckCircle2 className="size-3" />
                              Default
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground bg-muted/30 gap-1.5">
                              Aktif
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pendingDefault !== defaultProviderId && (
          <p className="mt-3 text-xs text-primary font-medium">
            * Klik "Simpan" untuk menerapkan perubahan provider default.
          </p>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-6 flex justify-end bg-muted/20">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || pendingDefault === defaultProviderId}
          className="font-bold px-6"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}

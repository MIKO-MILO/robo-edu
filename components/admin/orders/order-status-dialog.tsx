"use client";

import * as React from "react";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/enums";

/** Transisi yang diizinkan, sinkron dengan backend VALID_TRANSITIONS */
const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PAID:       ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED", "CANCELLED"],
  DELIVERED:  ["COMPLETED", "REFUNDED"],
  COMPLETED:  ["REFUNDED"],
  CANCELLED:  [],
  REFUNDED:   [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    "Menunggu",
  PAID:       "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED:    "Dikirim",
  DELIVERED:  "Terkirim",
  COMPLETED:  "Selesai",
  CANCELLED:  "Dibatalkan",
  REFUNDED:   "Di-Refund",
};

export interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  /** Dipanggil setelah update berhasil dengan status baru */
  onSuccess: (newStatus: OrderStatus) => void;
}

/**
 * Dialog konfirmasi + eksekusi update status pesanan (admin-only).
 * Menampilkan pilihan transisi yang valid dari status saat ini,
 * meminta konfirmasi, lalu PATCH ke /api/admin/orders/[id]/status.
 */
export function OrderStatusDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  currentStatus,
  onSuccess,
}: OrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ── Tracking fields (hanya relevan saat SHIPPED) ──────────────────────
  const [trackingNumber, setTrackingNumber] = React.useState("");
  const [providerId, setProviderId] = React.useState<string>("");
  const [providers, setProviders] = React.useState<
    Array<{ id: string; name: string }>
  >([]);

  // Ambil daftar shipping provider aktif untuk dropdown.
  React.useEffect(() => {
    if (!open) return;
    let ignore = false;
    void (async () => {
      try {
        const res = await fetch("/api/shipping-providers", { cache: "no-store" });
        const json = await res.json();
        if (ignore || !res.ok || !json.success) return;
        // Endpoint mengembalikan opsi per service; ambil provider unik.
        const seen = new Map<string, string>();
        for (const opt of json.data ?? []) {
          if (opt.provider_id && !seen.has(opt.provider_id)) {
            seen.set(opt.provider_id, opt.provider_name ?? opt.provider_id);
          }
        }
        setProviders([...seen.entries()].map(([id, name]) => ({ id, name })));
      } catch {
        /* non-fatal — dropdown tinggal kosong */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [open]);

  // Reset state saat dialog dibuka/ditutup
  React.useEffect(() => {
    if (!open) {
      setSelectedStatus(null);
      setError(null);
      setIsLoading(false);
      setTrackingNumber("");
      setProviderId("");
    }
  }, [open]);

  const availableTransitions = VALID_TRANSITIONS[currentStatus] ?? [];
  const hasTransitions = availableTransitions.length > 0;

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    setIsLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = { status: selectedStatus };

      // Sertakan info resi hanya saat transisi ke SHIPPED.
      if (selectedStatus === "SHIPPED") {
        const tn = trackingNumber.trim();
        if (tn) payload.tracking_number = tn;
        const pid = providerId.trim();
        if (pid) payload.provider_id = pid;
      }

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message ?? "Gagal memperbarui status pesanan.");
        return;
      }

      onSuccess(selectedStatus);
      onOpenChange(false);
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <RefreshCw className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Update Status Pesanan
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {orderNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current status */}
          <div className="flex items-center justify-between text-sm bg-muted/50 rounded-xl px-4 py-3 border border-border">
            <span className="text-muted-foreground font-body text-xs">Status saat ini</span>
            <StatusBadge status={currentStatus} size="sm" neo />
          </div>

          {/* Available transitions */}
          {hasTransitions ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground font-body">
                Pilih status baru:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availableTransitions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-body cursor-pointer",
                      selectedStatus === status
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
                      isLoading && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <StatusBadge status={status} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {STATUS_LABELS[status]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3 border border-border">
              <AlertTriangle className="size-4 shrink-0 text-warning" />
              <span>
                Tidak ada transisi status yang tersedia dari status{" "}
                <strong>{STATUS_LABELS[currentStatus] ?? currentStatus}</strong>.
              </span>
            </div>
          )}

          {/* Tracking info — hanya muncul saat memilih SHIPPED */}
          {selectedStatus === "SHIPPED" && (
            <div className="space-y-3 rounded-xl border border-primary/40 bg-primary/5 p-3">
              <p className="text-xs font-medium text-muted-foreground font-body">
                Informasi Pengiriman (opsional)
              </p>
              <div className="space-y-1.5">
                <label
                  htmlFor="tracking-number"
                  className="block text-[11px] font-semibold text-muted-foreground font-body"
                >
                  Nomor Resi
                </label>
                <Input
                  id="tracking-number"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="cth. JNT98273618293"
                  disabled={isLoading}
                  className="h-9 rounded-xl text-sm"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="tracking-provider"
                  className="block text-[11px] font-semibold text-muted-foreground font-body"
                >
                  Kurir / Provider
                </label>
                <Select
                  value={providerId}
                  onValueChange={(val) => setProviderId(val ?? "")}
                >
                  <SelectTrigger
                    id="tracking-provider"
                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm font-body cursor-pointer"
                  >
                    <SelectValue placeholder="-- Pilih kurir (opsional) --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1.5 bg-popover border border-border shadow-lg font-body z-50">
                    {providers.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        Tidak ada provider tersedia
                      </SelectItem>
                    ) : (
                      providers.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="cursor-pointer rounded-xl px-3 py-2 text-xs font-medium"
                        >
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 text-xs text-danger bg-danger-bg rounded-xl px-4 py-3 border border-danger/30">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedStatus || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Memperbarui...</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                <span>Update Status</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

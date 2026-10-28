"use client";

import * as React from "react";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  CheckCheck,
  XCircle,
  RotateCcw,
  AlertCircle,
  Edit3,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderStatus } from "@/types/enums";
import { OrderInfoCard } from "./order-info-card";

export interface OrderStatusActionCardProps {
  currentStatus: OrderStatus;
  trackingNumber?: string | null;
  courierName?: string;
  onUpdateStatus: (newStatus: OrderStatus, trackingNumber?: string) => void;
  onUpdateTrackingNumber?: (trackingNumber: string) => void;
}

/**
 * Organism/Molecule — Kartu Aksi Pengelolaan Status Pesanan Admin.
 * Memungkinkan admin memproses pesanan sesuai siklus fulfillment PRD Bab 13:
 *   - PENDING -> Konfirmasi Pembayaran (PAID), Batalkan (CANCELLED)
 *   - PAID -> Mulai Proses Pengemasan (PROCESSING), Refund (REFUNDED), Batalkan (CANCELLED)
 *   - PROCESSING -> Masukkan Resi & Tandai Dikirim (SHIPPED), Batalkan (CANCELLED)
 *   - SHIPPED -> Tandai Diterima (DELIVERED), Edit Resi
 *   - DELIVERED -> Selesaikan Pesanan (COMPLETED)
 *   - COMPLETED / CANCELLED / REFUNDED -> Status Terminal (Informasi Read-only)
 */
export function OrderStatusActionCard({
  currentStatus,
  trackingNumber,
  courierName = "Kurir",
  onUpdateStatus,
  onUpdateTrackingNumber,
}: OrderStatusActionCardProps) {
  const [resiInput, setResiInput] = React.useState(trackingNumber ?? "");
  const [resiError, setResiError] = React.useState<string | null>(null);
  const [isEditingResi, setIsEditingResi] = React.useState(false);
  const [editResiVal, setEditResiVal] = React.useState(trackingNumber ?? "");

  // Update internal state saat props berubah
  React.useEffect(() => {
    if (trackingNumber) {
      setResiInput(trackingNumber);
      setEditResiVal(trackingNumber);
    }
  }, [trackingNumber]);

  const handleShipOrder = () => {
    if (!resiInput.trim()) {
      setResiError("Nomor resi wajib diisi sebelum menandai pesanan dikirim.");
      return;
    }
    setResiError(null);
    onUpdateStatus("SHIPPED", resiInput.trim());
  };

  const handleSaveResiEdit = () => {
    if (!editResiVal.trim()) return;
    if (onUpdateTrackingNumber) {
      onUpdateTrackingNumber(editResiVal.trim());
    }
    setIsEditingResi(false);
  };

  // State: Selesai
  if (currentStatus === "COMPLETED") {
    return (
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-success-bg text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-foreground">
              Pesanan Telah Selesai
            </div>
            <div className="text-xs text-muted-foreground">
              Transaksi ini sudah ditutup dan seluruh barang telah diterima pelanggan.
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-success-bg border border-success/30 text-xs text-success font-body">
          Pelanggan dapat memberikan ulasan atau mengajukan klaim garansi untuk produk yang dibeli.
        </div>
      </div>
    );
  }

  // State: Dibatalkan
  if (currentStatus === "CANCELLED") {
    return (
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-danger-bg text-danger">
            <XCircle className="size-5" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-foreground">
              Pesanan Dibatalkan
            </div>
            <div className="text-xs text-muted-foreground">
              Pesanan ini tidak diproses lebih lanjut.
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-danger-bg border border-danger/30 text-xs text-danger font-body">
          Stok barang yang sebelumnya terkunci telah dikembalikan ke inventaris sistem.
        </div>
      </div>
    );
  }

  // State: Refund
  if (currentStatus === "REFUNDED") {
    return (
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-warning-bg text-warning">
            <RotateCcw className="size-5" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-foreground">
              Dana Telah Dikembalikan (Refund)
            </div>
            <div className="text-xs text-muted-foreground">
              Pengembalian dana kepada customer telah disetujui dan dicatat.
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-warning-bg border border-warning/30 text-xs text-warning font-body">
          Transaksi ditandai sebagai transaksi yang di-refund.
        </div>
      </div>
    );
  }

  return (
    <OrderInfoCard
      icon={<Clock className="size-4" />}
      title="Tindak Lanjut & Status Pesanan"
    >
      <div className="space-y-4 font-body text-xs">
        {/* PENDING: Konfirmasi Bayar / Batalkan */}
        {currentStatus === "PENDING" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-warning-bg border border-warning/30 text-warning flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                Pesanan masih menunggu pembayaran dari pelanggan. Admin dapat mengonfirmasi pembayaran secara manual jika bukti transfer valid.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="flex-1 gap-2 rounded-xl font-heading font-bold text-xs"
                onClick={() => onUpdateStatus("PAID")}
              >
                <CheckCircle2 className="size-3.5" />
                Konfirmasi Pembayaran
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 gap-2 rounded-xl border-2 border-border text-danger hover:text-danger font-heading font-bold text-xs"
                onClick={() => onUpdateStatus("CANCELLED")}
              >
                <XCircle className="size-3.5" />
                Batalkan Pesanan
              </Button>
            </div>
          </div>
        )}

        {/* PAID: Mulai Proses / Refund / Batalkan */}
        {currentStatus === "PAID" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-info-bg border border-info/30 text-info flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                Pembayaran telah diverifikasi. Klik tombol di bawah untuk mulai menyiapkan dan mengemas barang di gudang.
              </span>
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full gap-2 rounded-xl font-heading font-bold text-xs"
                onClick={() => onUpdateStatus("PROCESSING")}
              >
                <Package className="size-3.5" />
                Mulai Proses Pesanan (Packaging)
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 rounded-xl border-2 border-border text-warning hover:text-warning font-heading font-bold text-xs"
                  onClick={() => onUpdateStatus("REFUNDED")}
                >
                  <RotateCcw className="size-3.5" />
                  Refund Pesanan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 rounded-xl border-2 border-border text-danger hover:text-danger font-heading font-bold text-xs"
                  onClick={() => onUpdateStatus("CANCELLED")}
                >
                  <XCircle className="size-3.5" />
                  Batalkan Pesanan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PROCESSING: Input No Resi & Tandai Dikirim */}
        {currentStatus === "PROCESSING" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-info-bg border border-info/30 text-info flex items-start gap-2">
              <Package className="size-4 shrink-0 mt-0.5" />
              <span>
                Pesanan sedang dipersiapkan. Masukkan nomor resi {courierName} sebelum menandai pesanan telah dikirim ke kurir.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-heading font-bold text-foreground flex items-center justify-between">
                <span>
                  Nomor Resi Pengiriman <span className="text-danger">*</span>
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Kurir: {courierName}
                </span>
              </label>
              <Input
                type="text"
                placeholder="Contoh: JNT1234567890"
                value={resiInput}
                onChange={(e) => {
                  setResiInput(e.target.value);
                  if (resiError) setResiError(null);
                }}
                className="font-mono text-xs rounded-xl border-2 border-border"
              />
              {resiError && (
                <p className="text-[11px] font-semibold text-danger">{resiError}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="flex-1 gap-2 rounded-xl font-heading font-bold text-xs"
                onClick={handleShipOrder}
              >
                <Truck className="size-3.5" />
                Tandai Sudah Dikirim
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-2 border-border text-danger hover:text-danger font-heading font-bold text-xs"
                onClick={() => onUpdateStatus("CANCELLED")}
              >
                <XCircle className="size-3.5" />
                Batalkan
              </Button>
            </div>
          </div>
        )}

        {/* SHIPPED: Tandai Diterima & Edit Resi */}
        {currentStatus === "SHIPPED" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground flex items-start gap-2">
              <Truck className="size-4 shrink-0 mt-0.5 text-primary" />
              <span>
                Paket sedang dalam perjalanan oleh {courierName}. Jika paket telah sampai di alamat tujuan, tandai pesanan sebagai terkirim.
              </span>
            </div>

            {/* View / Edit Resi */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">No. Resi Aktif:</span>
                {!isEditingResi && (
                  <button
                    type="button"
                    onClick={() => setIsEditingResi(true)}
                    className="text-primary hover:underline flex items-center gap-1 font-heading font-bold cursor-pointer"
                  >
                    <Edit3 className="size-3" />
                    Ubah Resi
                  </button>
                )}
              </div>

              {isEditingResi ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editResiVal}
                    onChange={(e) => setEditResiVal(e.target.value)}
                    className="font-mono text-xs rounded-lg h-8 border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    className="rounded-lg h-8 px-2.5 font-heading font-bold"
                    onClick={handleSaveResiEdit}
                  >
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="rounded-lg h-8 px-2.5 font-heading font-bold"
                    onClick={() => {
                      setIsEditingResi(false);
                      setEditResiVal(trackingNumber ?? "");
                    }}
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <div className="font-mono font-bold text-sm text-foreground">
                  {trackingNumber || resiInput || "-"}
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full gap-2 rounded-xl font-heading font-bold text-xs"
              onClick={() => onUpdateStatus("DELIVERED")}
            >
              <CheckCheck className="size-3.5" />
              Tandai Sudah Diterima Pelanggan
            </Button>
          </div>
        )}

        {/* DELIVERED: Selesaikan Pesanan */}
        {currentStatus === "DELIVERED" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-success-bg border border-success/30 text-success flex items-start gap-2">
              <CheckCheck className="size-4 shrink-0 mt-0.5" />
              <span>
                Barang telah sampai di tangan customer. Admin dapat menyelesaikan pesanan ini untuk menutup siklus transaksi secara resmi.
              </span>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full gap-2 rounded-xl font-heading font-bold text-xs"
              onClick={() => onUpdateStatus("COMPLETED")}
            >
              <CheckCircle2 className="size-3.5" />
              Selesaikan Pesanan
            </Button>
          </div>
        )}
      </div>
    </OrderInfoCard>
  );
}

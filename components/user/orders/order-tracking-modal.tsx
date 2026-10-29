"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Truck, CheckCircle2, Clock, MapPin, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShipmentStatus } from "@/types";

export interface TrackingStep {
  id: string;
  status: ShipmentStatus;
  /** Bisa null di data asli (dari DB); fallback ke status saat render. */
  description: string | null;
  location: string | null;
  /** ISO datetime string dari API. */
  occurred_at: string;
}

export interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  courierName?: string;
  service?: string;
  trackingNumber?: string;
  trackings?: TrackingStep[];
}

/** Format ISO datetime → string ramah baca dalam WIB. Fallback ke input bila
 *  bukan tanggal valid (mis. string pre-formatted lama). */
function formatOccurredAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(d) + " WIB"
  );
}

export function OrderTrackingModal({
  isOpen,
  onClose,
  orderNumber,
  courierName = "J&T Express",
  service = "Regular Service",
  trackingNumber = "JNT98273618293",
  trackings = [],
}: OrderTrackingModalProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyResi = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultTrackings: TrackingStep[] = [
    {
      id: "1",
      status: "DELIVERED",
      description: "Paket telah sampai di alamat tujuan dan diterima oleh penghuni rumah.",
      location: "Jakarta Selatan, DKI Jakarta",
      occurred_at: "2023-10-27T14:32:00+07:00",
    },
    {
      id: "2",
      status: "IN_TRANSIT",
      description: "Paket sedang dibawa oleh kurir menuju alamat pengiriman.",
      location: "Hub Distribusi Jakarta Selatan",
      occurred_at: "2023-10-27T08:15:00+07:00",
    },
    {
      id: "3",
      status: "IN_TRANSIT",
      description: "Paket tiba di sorting hub pusat Jakarta.",
      location: "Sorting Center Jakarta Barat",
      occurred_at: "2023-10-26T19:40:00+07:00",
    },
    {
      id: "4",
      status: "PICKED_UP",
      description: "Paket telah diserahkan oleh penjual ke kurir.",
      location: "Drop Point Bandung",
      occurred_at: "2023-10-25T11:20:00+07:00",
    },
  ];

  const displayTrackings = trackings.length > 0 ? trackings : defaultTrackings;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border-2 border-foreground bg-card p-6 sm:p-7 rounded-3xl neo-shadow">
        <DialogHeader className="gap-1 border-b-2 border-foreground pb-4 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-soft-blue border-2 border-foreground neo-shadow-icon">
              <Truck className="w-5 h-5 text-foreground stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="font-heading font-bold text-xl text-foreground">
                Lacak Pengiriman
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-muted-foreground">
                No. Pesanan: <span className="font-bold text-foreground">{orderNumber}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Courier & Resi Info Card */}
        <div className="bg-muted p-4 rounded-2xl border-2 border-foreground flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kurir & Layanan
            </p>
            <p className="font-heading font-bold text-sm text-foreground">
              {courierName} ({service})
            </p>
          </div>

          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-xl border border-foreground">
            <div>
              <p className="text-[10px] font-body text-muted-foreground uppercase">
                Nomor Resi
              </p>
              <p className="font-heading font-bold text-xs text-foreground tracking-wide">
                {trackingNumber}
              </p>
            </div>
            <button
              onClick={handleCopyResi}
              title="Salin nomor resi"
              aria-label="Salin nomor resi"
              className="p-1 rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="flex flex-col gap-4 py-2 max-h-[340px] overflow-y-auto pr-1">
          {displayTrackings.map((track, idx) => {
            const isFirst = idx === 0;
            return (
              <div key={track.id} className="relative flex gap-4">
                {/* Timeline vertical bar */}
                {idx !== displayTrackings.length - 1 && (
                  <span
                    className="absolute left-3.5 top-7 -bottom-4 w-0.5 bg-foreground/20"
                    aria-hidden="true"
                  />
                )}

                {/* Timeline icon */}
                <div
                  className={`relative z-10 w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center shrink-0 ${
                    isFirst
                      ? "bg-accent-green text-foreground neo-shadow-icon"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isFirst ? (
                    <CheckCircle2 className="w-4 h-4 text-foreground stroke-[2.5]" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Timeline details */}
                <div className="flex flex-col gap-0.5 flex-1 pb-3">
                  <p
                    className={`font-body text-sm leading-snug ${
                      isFirst
                        ? "font-bold text-foreground"
                        : "font-medium text-foreground/80"
                    }`}
                  >
                    {track.description ?? track.status}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                    {track.location ? (
                      <>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {track.location}
                        </span>
                        <span>•</span>
                      </>
                    ) : null}
                    <span>{formatOccurredAt(track.occurred_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-foreground/10 flex justify-end">
          <Button variant="card" onClick={onClose} size="default" className="w-full sm:w-auto">
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

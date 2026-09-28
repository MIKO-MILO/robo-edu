"use client";

import * as React from "react";
import { Loader2, ShieldAlert, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminSelect } from "@/components/admin/form/select";
import { AdminTextarea } from "@/components/admin/form/textarea";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ComplaintStatus } from "@/types/enums";

const STATUS_OPTIONS: { value: ComplaintStatus; label: string }[] = [
  { value: "OPEN", label: "OPEN — Baru / Belum Ditangani" },
  { value: "IN_REVIEW", label: "IN_REVIEW — Sedang Ditinjau" },
  { value: "RESOLVED", label: "RESOLVED — Selesai Ditangani" },
  { value: "REJECTED", label: "REJECTED — Ditolak" },
];

export interface ComplaintActionPanelProps {
  currentStatus: ComplaintStatus;
  currentResolution: string | null;
  /** onSubmit dipanggil dengan nilai baru, mengembalikan Promise (untuk loading state) */
  onSubmit: (
    newStatus: ComplaintStatus,
    resolution: string
  ) => Promise<void> | void;
}

/**
 * Organism — panel tindak lanjut admin:
 * 1. Pilih status baru via dropdown
 * 2. Tulis catatan tindak lanjut manual
 * 3. Tombol simpan — dengan konfirmasi dialog khusus untuk REJECTED
 */
export function ComplaintActionPanel({
  currentStatus,
  currentResolution,
  onSubmit,
}: ComplaintActionPanelProps) {
  const [selectedStatus, setSelectedStatus] =
    React.useState<ComplaintStatus>(currentStatus);
  const [resolution, setResolution] = React.useState(currentResolution ?? "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);

  const hasChanged =
    selectedStatus !== currentStatus ||
    resolution !== (currentResolution ?? "");

  const handleSubmitClick = () => {
    if (selectedStatus === "REJECTED") {
      setShowRejectDialog(true);
    } else {
      void doSubmit();
    }
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(selectedStatus, resolution);
    } finally {
      setIsSubmitting(false);
      setShowRejectDialog(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b-2 border-border pb-3">
          <Save className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-base text-foreground">
            Tindak Lanjut Admin
          </h3>
        </div>

        {/* Status selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground font-body">
            Ubah Status Klaim
          </label>
          <AdminSelect
            value={selectedStatus}
            onValueChange={(val) => setSelectedStatus(val as ComplaintStatus)}
            options={STATUS_OPTIONS}
            placeholder="Pilih status baru..."
            selectSize="md"
          />
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-muted-foreground">Status saat ini:</span>
            <StatusBadge status={currentStatus} size="sm" neo />
          </div>
        </div>

        {/* Resolution notes */}
        <AdminTextarea
          label="Catatan Tindak Lanjut"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder='Tulis ringkasan tindak lanjut, misal: "Sudah dihubungi via WhatsApp tanggal 12/9, customer setuju dikirim unit pengganti."'
          rows={5}
          maxChars={2000}
        />

        {/* Submit button */}
        <Button
          type="button"
          variant={selectedStatus === "REJECTED" ? "danger-solid" : "default"}
          size="default"
          className="w-full gap-2 font-bold"
          disabled={!hasChanged || isSubmitting}
          onClick={handleSubmitClick}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </Button>

        {!hasChanged && (
          <p className="text-[11px] text-muted-foreground text-center">
            Belum ada perubahan yang dilakukan.
          </p>
        )}
      </div>

      {/* Rejection Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="border border-border bg-card max-w-sm p-6 rounded-2xl shadow-lg [&>button]:hidden">
          <DialogHeader className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-danger mx-auto">
              <ShieldAlert className="size-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1 text-center">
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                Konfirmasi Tolak Klaim
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-body leading-relaxed">
                Kamu akan menandai klaim ini sebagai{" "}
                <span className="font-bold text-danger">REJECTED</span>. Ini
                adalah keputusan final yang akan dilihat customer. Pastikan kamu
                sudah yakin sebelum melanjutkan.
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="default"
              neo={false}
              onClick={() => setShowRejectDialog(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger-solid"
              size="default"
              neo={false}
              onClick={() => void doSubmit()}
              disabled={isSubmitting}
              className="w-full sm:w-auto font-bold gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Ya, Tolak Klaim</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

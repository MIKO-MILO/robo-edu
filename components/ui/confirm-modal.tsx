"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Info, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ConfirmModalVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps {
  /** Kontrol buka/tutup dialog secara eksternal */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Konten */
  title: string;
  description?: string;

  /** Tipe modal — mempengaruhi warna icon & tombol konfirmasi */
  variant?: ConfirmModalVariant;

  /** Label tombol */
  confirmLabel?: string;
  cancelLabel?: string;

  /** Callback */
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;

  /** Loading state saat onConfirm sedang berjalan */
  isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant config
// ─────────────────────────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ConfirmModalVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    confirmVariant: React.ComponentProps<typeof Button>["variant"];
    defaultConfirmLabel: string;
  }
> = {
  danger: {
    icon: <Trash2 className="size-5" />,
    iconBg: "bg-danger-bg text-danger",
    confirmVariant: "danger-solid",
    defaultConfirmLabel: "Hapus",
  },
  warning: {
    icon: <AlertTriangle className="size-5" />,
    iconBg: "bg-warning-bg text-warning",
    confirmVariant: "warning-solid",
    defaultConfirmLabel: "Lanjutkan",
  },
  info: {
    icon: <Info className="size-5" />,
    iconBg: "bg-info-bg text-info",
    confirmVariant: "info-solid",
    defaultConfirmLabel: "OK",
  },
  success: {
    icon: <CheckCircle className="size-5" />,
    iconBg: "bg-success-bg text-success",
    confirmVariant: "success-solid",
    defaultConfirmLabel: "Konfirmasi",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  variant = "danger",
  confirmLabel,
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  const config = VARIANT_CONFIG[variant];

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isLoading} className="max-w-sm">
        <DialogHeader>
          {/* Icon */}
          <div
            className={cn(
              "mx-auto mb-2 flex size-12 items-center justify-center rounded-full border-2 border-border",
              config.iconBg,
            )}
          >
            {config.icon}
          </div>

          <DialogTitle className="text-center text-base font-heading font-bold">
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription className="text-center text-sm text-muted-foreground font-body mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="sm:justify-center gap-2 mt-2">
          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            <XCircle className="size-3.5" />
            {cancelLabel}
          </Button>

          {/* Confirm */}
          <Button
            type="button"
            variant={config.confirmVariant}
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              config.icon
            )}
            {confirmLabel ?? config.defaultConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook — useConfirmModal
// Cara pakai paling simpel: panggil hook, dapat openModal() dan elemen JSX-nya
// ─────────────────────────────────────────────────────────────────────────────

export interface UseConfirmModalOptions
  extends Omit<ConfirmModalProps, "open" | "onOpenChange" | "onConfirm"> {
  onConfirm: () => void | Promise<void>;
}

export function useConfirmModal(options: UseConfirmModalOptions) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const openModal = React.useCallback(() => setOpen(true), []);
  const closeModal = React.useCallback(() => setOpen(false), []);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await options.onConfirm();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const modal = (
    <ConfirmModal
      {...options}
      open={open}
      onOpenChange={setOpen}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    />
  );

  return { openModal, closeModal, modal, isLoading };
}

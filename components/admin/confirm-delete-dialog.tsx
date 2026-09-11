"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { cn } from "@/lib/utils";

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  requireConfirmationWord?: boolean;
  confirmationWord?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Konfirmasi Hapus Data",
  description = "Tindakan ini tidak dapat dibatalkan. Data yang telah dihapus akan hilang secara permanen dari sistem.",
  itemName,
  onConfirm,
  isLoading = false,
  confirmText = "Ya, Hapus Data",
  cancelText = "Batal",
  requireConfirmationWord = false,
  confirmationWord = "HAPUS",
}: ConfirmDeleteDialogProps) {
  const [inputWord, setInputWord] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setInputWord("");
    }
  }, [open]);

  const isConfirmDisabled =
    isLoading || (requireConfirmationWord && inputWord !== confirmationWord);

  const handleConfirm = async () => {
    if (isConfirmDisabled) return;
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border bg-card max-w-md p-6 rounded-2xl shadow-lg">
        <DialogHeader className="flex flex-col items-center sm:items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg text-danger">
            <AlertTriangle className="size-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <DialogTitle className="text-lg font-bold font-heading text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-body leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        {itemName && (
          <div className="my-2 p-3 rounded-2xl bg-muted/60 border border-border/60 text-xs font-body">
            <span className="text-muted-foreground">Item yang akan dihapus: </span>
            <span className="font-bold text-foreground font-mono">{itemName}</span>
          </div>
        )}

        {requireConfirmationWord && (
          <div className="space-y-1.5 my-2">
            <label className="text-xs font-medium text-foreground">
              Ketik <span className="font-bold text-danger font-mono">{confirmationWord}</span> untuk mengonfirmasi:
            </label>
            <AdminInput
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder={`Tulis "${confirmationWord}" di sini`}
              inputSize="sm"
            />
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="default"
            neo={false}
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant="danger-solid"
            size="default"
            neo={false}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="w-full sm:w-auto font-bold gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>{confirmText}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

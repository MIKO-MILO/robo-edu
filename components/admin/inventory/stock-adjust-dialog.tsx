"use client";

import React, { useState, useEffect } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import {
  SaveIcon,
  MinusIcon,
  PlusIcon,
  PackageIcon,
  AlertTriangleIcon,
} from "lucide-react";
import type { UUID, AdjustMode } from "@/types";

export interface AdjustTargetVariant {
  id: UUID;
  variant_name: string;
  variant_sku: string;
  stock: number;
  product_name: string;
  product_id?: UUID;
}

export interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: AdjustTargetVariant | null;
  onConfirm: (variantId: UUID, newStock: number, productId?: UUID) => Promise<void>;
  isLoading?: boolean;
}

export function StockAdjustDialog({
  open,
  onOpenChange,
  variant,
  onConfirm,
  isLoading = false,
}: StockAdjustDialogProps) {
  const [mode, setMode] = useState<AdjustMode>("set");
  const [value, setValue] = useState<string>("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset state setiap kali dialog dibuka dengan variant baru
  useEffect(() => {
    if (open && variant) {
      setMode("set");
      setValue(String(variant.stock));
      setNote("");
      setError(null);
    }
  }, [open, variant]);

  if (!variant) return null;

  const parsedValue = value === "" ? NaN : Number(value);

  const computedStock =
    mode === "set"
      ? parsedValue
      : variant.stock + (isNaN(parsedValue) ? 0 : parsedValue);

  const isValueInvalid = isNaN(parsedValue);
  const isStockNegative = computedStock < 0;
  const isSubmitDisabled = isLoading || isValueInvalid || isStockNegative;

  const handleModeChange = (newMode: AdjustMode) => {
    setMode(newMode);
    setValue(newMode === "set" ? String(variant.stock) : "0");
    setError(null);
  };

  const handleDeltaQuick = (delta: number) => {
    const current = isNaN(parsedValue) ? 0 : parsedValue;
    setValue(String(current + delta));
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;
    if (computedStock < 0) {
      setError("Stok tidak boleh negatif.");
      return;
    }
    setError(null);
    await onConfirm(variant.id, computedStock, variant.product_id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-yellow/30 border border-border">
              <PackageIcon className="size-5 text-foreground" />
            </div>
            <div>
              <DialogTitle className="font-heading text-base font-bold text-foreground">
                Atur Stok Varian
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-muted-foreground">
                Ubah kuota/kapasitas produksi varian ini.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Info Variant */}
        <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 space-y-0.5">
          <p className="font-heading text-sm font-bold text-foreground">
            {variant.product_name}
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Varian:{" "}
            <span className="font-semibold text-foreground">
              {variant.variant_name}
            </span>{" "}
            &middot; SKU:{" "}
            <code className="font-mono">{variant.variant_sku}</code>
          </p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            Stok saat ini:{" "}
            <span className="font-bold text-foreground text-sm">
              {variant.stock}
            </span>
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="space-y-3">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Mode Penyesuaian
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleModeChange("set")}
              className={`rounded-2xl border-2 px-3 py-2.5 text-left transition-colors ${
                mode === "set"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <p className="font-heading text-xs font-bold text-foreground">
                Set Langsung
              </p>
              <p className="font-body text-[11px] text-muted-foreground">
                Masukkan nilai stok baru
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("delta")}
              className={`rounded-2xl border-2 px-3 py-2.5 text-left transition-colors ${
                mode === "delta"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <p className="font-heading text-xs font-bold text-foreground">
                Tambah / Kurangi
              </p>
              <p className="font-body text-[11px] text-muted-foreground">
                Masukkan selisih +/-
              </p>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          {mode === "set" ? (
            <div className="space-y-1.5">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Stok Baru <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                min={0}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(null);
                }}
                placeholder="contoh: 50"
                aria-invalid={isValueInvalid || isStockNegative}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Selisih (+/-) <span className="text-danger">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  neo={false}
                  onClick={() => handleDeltaQuick(-1)}
                  title="Kurangi 1"
                >
                  <MinusIcon className="size-3.5" />
                </Button>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setError(null);
                  }}
                  placeholder="contoh: 10 atau -5"
                  className="text-center"
                  aria-invalid={isStockNegative}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  neo={false}
                  onClick={() => handleDeltaQuick(1)}
                  title="Tambah 1"
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </div>
              {/* Shortcut delta buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[-10, -5, +5, +10, +20, +50].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => handleDeltaQuick(delta)}
                    className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview hasil */}
          {!isValueInvalid && (
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                isStockNegative
                  ? "bg-danger-bg text-danger border border-danger/20"
                  : "bg-success-bg text-success border border-success/20"
              }`}
            >
              {isStockNegative ? (
                <AlertTriangleIcon className="size-4 shrink-0" />
              ) : (
                <PackageIcon className="size-4 shrink-0" />
              )}
              <span className="font-body text-xs">
                {mode === "delta" ? (
                  <>
                    {variant.stock}{" "}
                    {parsedValue >= 0 ? `+ ${parsedValue}` : `- ${Math.abs(parsedValue)}`}{" "}
                    ={" "}
                    <strong>{computedStock}</strong>
                  </>
                ) : (
                  <>
                    Stok akan menjadi{" "}
                    <strong>{computedStock}</strong>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Error */}
          {(error || isStockNegative) && (
            <p className="text-xs font-medium text-danger">
              {error ?? "Stok tidak boleh negatif."}
            </p>
          )}
        </div>

        {/* Catatan */}
        <div className="space-y-1.5">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Catatan{" "}
            <span className="font-normal normal-case text-muted-foreground">
              (Opsional)
            </span>
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="contoh: Restock batch ke-3 dari supplier..."
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 font-body text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <p className="text-[11px] text-muted-foreground">
            Catatan hanya disimpan secara lokal untuk referensi admin.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="default"
            neo={false}
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="default"
            neo={false}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <SaveIcon className="size-4" />
                <span>Terapkan Perubahan</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

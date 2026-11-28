"use client";

import { useState } from "react";
import { Tag, X, CheckCircle2, AlertCircle, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ValidateVoucherResponseData } from "@/types/voucher";

interface CheckoutVoucherWidgetProps {
  /** Voucher yang sudah berhasil diaplikasikan (null = belum ada) */
  appliedVoucher: ValidateVoucherResponseData | null;
  onApply: (code: string) => Promise<{ success: boolean; error?: string }>;
  onRemove: () => void;
}

/**
 * CheckoutVoucherWidget
 * Widget input & display kode promo/voucher di sidebar checkout.
 * - Empty state: tampilkan placeholder info
 * - Applied state: tampilkan chip voucher hijau dengan nominal diskon
 * Data dikirim ke POST /vouchers/validate (types/voucher.ts ValidateVoucherRequestBody)
 */
export function CheckoutVoucherWidget({
  appliedVoucher,
  onApply,
  onRemove,
}: CheckoutVoucherWidgetProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setIsLoading(true);
    const result = await onApply(code.trim().toUpperCase());
    setIsLoading(false);
    if (result.success) {
      setCode("");
    } else {
      setError(result.error ?? "Kode voucher tidak valid.");
    }
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-extrabold text-base text-foreground">
            Voucher &amp; Promo
          </h3>
        </div>
        <span className="text-xs font-bold text-primary hover:underline cursor-pointer">
          Lihat Promo
        </span>
      </div>

      {/* Applied State */}
      {appliedVoucher ? (
        <div className="mb-3 p-3 rounded-xl bg-accent-green/40 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <div className="font-heading font-bold text-xs text-foreground flex items-center gap-1.5">
                {appliedVoucher.code}
                <span className="text-[10px] font-black bg-emerald-800 text-white px-1.5 py-0.5 rounded">
                  {appliedVoucher.discount_type === "PERCENTAGE"
                    ? `Hemat ${appliedVoucher.discount_value}%`
                    : "Hemat Tetap"}
                </span>
              </div>
              <p className="text-[11px] text-emerald-950 font-medium">
                Potongan diskon diterapkan berhasil
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            title="Hapus Voucher"
            className="w-6 h-6 rounded-full bg-card/80 text-foreground hover:bg-danger-bg flex items-center justify-center shrink-0 transition-colors shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Empty State */
        <div className="mb-3 p-3 rounded-xl border border-dashed border-border/20 bg-muted/20 flex items-center gap-2.5">
          <Ticket className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="font-bold text-foreground text-xs">
              Belum ada voucher yang digunakan
            </p>
            <p className="text-[11px] text-muted-foreground">
              Gunakan kode promo untuk mendapatkan potongan harga
            </p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleApply} className="flex gap-2">
        <Input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder={appliedVoucher ? "Masukkan kode promo lain" : "Masukkan kode promo"}
          className="flex-grow text-xs uppercase tracking-wider font-bold rounded-xl border border-border/20 bg-card px-3.5 h-10 focus-visible:ring-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="card"
          size="sm"
          neo={false}
          disabled={isLoading || !code.trim()}
          className="shrink-0 rounded-xl bg-accent-soft-yellow hover:bg-accent-soft-yellow/80 text-foreground font-medium text-xs shadow-xs transition-colors"
        >
          {isLoading ? "..." : "Terapkan"}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-danger font-semibold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

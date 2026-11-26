"use client";

import React, { useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoucherCopyButtonProps {
  kode?: string;
  bgClass?: string;
  textClass?: string;
  borderClass?: string;
  className?: string;
  onUseDiscount?: () => void;
}

/**
 * Atom — Tombol salin kode voucher atau tombol navigasi "Gunakan Diskon".
 */
export function VoucherCopyButton({
  kode,
  bgClass = "bg-primary",
  textClass = "text-primary-foreground",
  borderClass = "border-primary-700",
  className,
  onUseDiscount,
}: VoucherCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!kode) {
      onUseDiscount?.();
      return;
    }

    navigator.clipboard?.writeText(kode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!kode) {
    return (
      <button
        type="button"
        onClick={onUseDiscount}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 font-body font-bold text-xs uppercase tracking-wider transition-all duration-150 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-xs",
          bgClass,
          textClass,
          borderClass,
          className
        )}
      >
        <span>Gunakan Diskon</span>
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Kode berhasil disalin" : `Salin kode ${kode}`}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 font-body font-bold text-xs uppercase tracking-wider transition-all duration-150 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-xs",
        bgClass,
        textClass,
        borderClass,
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Tersalin!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>Kode: {kode}</span>
        </>
      )}
    </button>
  );
}

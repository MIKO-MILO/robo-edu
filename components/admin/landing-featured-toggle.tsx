"use client";

/**
 * LandingFeaturedToggle
 *
 * Reusable toggle button untuk menandai item (voucher / review) agar tampil
 * di landing page. Menampilkan tooltip saat diblokir karena limit atau karena
 * item tidak memenuhi syarat (non-aktif / non-PUBLISHED).
 */

import React, { useRef, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LandingFeaturedToggleProps {
  /** Apakah item ini saat ini sudah di-featured */
  isFeatured: boolean;
  /** Sedang loading (fetch awal data featured) */
  isLoading?: boolean;
  /** Sedang dalam proses toggle (mutasi sedang berjalan) */
  isPending?: boolean;
  /**
   * Jika diisi, tombol akan disabled dan pesan ini tampil sebagai tooltip.
   * Contoh: "Maksimal 6 voucher dapat ditampilkan di landing page"
   * atau "Hanya voucher aktif yang dapat ditampilkan di landing page"
   */
  disabledReason?: string;
  onToggle: () => void;
  className?: string;
}

export function LandingFeaturedToggle({
  isFeatured,
  isLoading = false,
  isPending = false,
  disabledReason,
  onToggle,
  className,
}: LandingFeaturedToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDisabled = !!disabledReason || isLoading || isPending;

  const handleClick = () => {
    if (isDisabled) {
      // Muncul tooltip sementara jika user klik item yang disabled
      setShowTooltip(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowTooltip(false), 2500);
      return;
    }
    onToggle();
  };

  const baseClasses =
    "relative inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1 text-xs font-heading font-bold transition-all duration-150 select-none";

  const activeClasses =
    "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 cursor-pointer";

  const inactiveClasses =
    "border-border bg-card text-muted-foreground hover:bg-muted hover:border-border/80 cursor-pointer";

  const disabledClasses =
    "border-border bg-card/50 text-muted-foreground/40 cursor-not-allowed opacity-60";

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => disabledReason && setShowTooltip(true)}
        onMouseLeave={() => { setShowTooltip(false); if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
        onFocus={() => disabledReason && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-pressed={isFeatured}
        aria-label={
          isFeatured
            ? "Hapus dari landing page"
            : disabledReason ?? "Tampilkan di landing page"
        }
        className={cn(
          baseClasses,
          isDisabled ? disabledClasses : isFeatured ? activeClasses : inactiveClasses,
          className,
        )}
      >
        {isPending || isLoading ? (
          <Loader2 className="size-3 animate-spin shrink-0" />
        ) : (
          <Globe
            className={cn(
              "size-3 shrink-0",
              isFeatured && !isDisabled ? "fill-primary/20" : "",
            )}
            aria-hidden="true"
          />
        )}
        <span>{isFeatured ? "Di Landing" : "Landing"}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && disabledReason && (
        <div
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
            "w-max max-w-[220px] rounded-xl border border-border bg-popover px-3 py-2",
            "text-xs text-popover-foreground font-body shadow-md text-center leading-snug",
            "pointer-events-none",
          )}
        >
          {disabledReason}
          {/* Arrow */}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-border" />
        </div>
      )}
    </div>
  );
}

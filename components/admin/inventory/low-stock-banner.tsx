"use client";

import React, { useState } from "react";
import type { LowStockItem } from "@/types";
import { AlertTriangleIcon, XIcon, PackageIcon } from "lucide-react";

export interface LowStockBannerProps {
  items: LowStockItem[];
  isLoading?: boolean;
}

const MAX_VISIBLE = 3;

export function LowStockBanner({ items, isLoading }: LowStockBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Jangan render jika sedang loading, tidak ada item, atau sudah di-dismiss
  if (isLoading || items.length === 0 || dismissed) return null;

  const visible = items.slice(0, MAX_VISIBLE);
  const overflow = items.length - MAX_VISIBLE;

  return (
    <div className="relative rounded-2xl border-2 border-amber-400/60 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-950/20">
      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-lg p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors"
        title="Tutup notifikasi"
        aria-label="Tutup notifikasi stok menipis"
      >
        <XIcon className="size-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
          <AlertTriangleIcon className="size-4" />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <p className="font-heading text-sm font-bold text-amber-800 dark:text-amber-300">
              {items.length} varian dengan stok menipis
            </p>
            <p className="font-body text-xs text-amber-700 dark:text-amber-400">
              Segera lakukan penyesuaian stok sebelum kehabisan.
            </p>
          </div>

          {/* List item low stock */}
          <div className="flex flex-wrap gap-2">
            {visible.map((item) => (
              <div
                key={item.variant_id}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300/60 bg-white px-2.5 py-1 dark:border-amber-600/30 dark:bg-amber-950/40"
              >
                <PackageIcon className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="font-body text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">{item.product_name}</span>
                  {" — "}
                  {item.variant_name}
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    item.stock === 0
                      ? "text-danger"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  ({item.stock})
                </span>
              </div>
            ))}

            {overflow > 0 && (
              <div className="flex items-center rounded-xl border border-amber-300/60 bg-white px-2.5 py-1 dark:border-amber-600/30 dark:bg-amber-950/40">
                <span className="font-body text-xs font-semibold text-amber-700 dark:text-amber-400">
                  +{overflow} varian lainnya
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

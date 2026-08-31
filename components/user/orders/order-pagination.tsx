"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hitung array nomor halaman yang ditampilkan.
 * Selalu tampilkan max 5 halaman dengan elipsis implisit.
 */
function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface OrderPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function OrderPagination({ meta, onPageChange, className }: OrderPaginationProps) {
  const { current_page, total_pages } = meta;

  if (total_pages <= 1) return null;

  const pages = getPageRange(current_page, total_pages);
  const isFirst = current_page === 1;
  const isLast = current_page === total_pages;

  return (
    <nav
      role="navigation"
      aria-label="Navigasi halaman pesanan"
      className={cn("flex items-center justify-center gap-2 flex-wrap", className)}
    >
      {/* Prev */}
      <Button
        variant="card"
        size="icon-sm"
        neo
        disabled={isFirst}
        onClick={() => onPageChange(current_page - 1)}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="size-8 flex items-center justify-center text-sm text-muted-foreground font-body select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === current_page ? "primary" : "card"}
            size="icon-sm"
            neo={page !== current_page}
            onClick={() => page !== current_page && onPageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={page === current_page ? "page" : undefined}
            className={cn(
              "font-semibold text-sm",
              page === current_page && "cursor-default",
            )}
          >
            {page}
          </Button>
        ),
      )}

      {/* Next */}
      <Button
        variant="card"
        size="icon-sm"
        neo
        disabled={isLast}
        onClick={() => onPageChange(current_page + 1)}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

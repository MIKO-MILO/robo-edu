"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Custom callback jika digunakan secara client-side tanpa URL params */
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  // Helper otomatis untuk generate URL paginasi dari URL searchParams saat ini
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ""}`;
  };

  // Hitung deretan angka halaman dengan kelipatan ellipsis jika > 5 halaman
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const renderPageItem = (page: number | string, index: number) => {
    if (typeof page === "string") {
      return (
        <span
          key={`ellipsis-${index}`}
          className="px-2 py-1 font-body text-sm text-muted-foreground select-none"
        >
          ...
        </span>
      );
    }

    const isActive = page === currentPage;

    if (onPageChange) {
      return (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          variant={isActive ? "primary" : "card"}
          size="icon-sm"
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "font-heading font-bold text-xs",
            isActive && "scale-105"
          )}
        >
          {page}
        </Button>
      );
    }

    return (
      <Link key={page} href={getPageUrl(page)}>
        <Button
          variant={isActive ? "primary" : "card"}
          size="icon-sm"
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "font-heading font-bold text-xs",
            isActive && "scale-105"
          )}
        >
          {page}
        </Button>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Paginasi Halaman"
      className={cn("flex items-center justify-center gap-2 py-4", className)}
    >
      {/* Previous Button */}
      {onPageChange ? (
        <Button
          variant="card"
          size="icon-sm"
          disabled={isFirstPage}
          onClick={() => onPageChange(prevPage)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3px]" />
        </Button>
      ) : (
        <Link
          href={isFirstPage ? "#" : getPageUrl(prevPage)}
          tabIndex={isFirstPage ? -1 : 0}
          className={cn(isFirstPage && "pointer-events-none opacity-40")}
        >
          <Button
            variant="card"
            size="icon-sm"
            disabled={isFirstPage}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          </Button>
        </Link>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map(renderPageItem)}
      </div>

      {/* Next Button */}
      {onPageChange ? (
        <Button
          variant="card"
          size="icon-sm"
          disabled={isLastPage}
          onClick={() => onPageChange(nextPage)}
          aria-label="Halaman selanjutnya"
        >
          <ChevronRight className="w-4 h-4 stroke-[3px]" />
        </Button>
      ) : (
        <Link
          href={isLastPage ? "#" : getPageUrl(nextPage)}
          tabIndex={isLastPage ? -1 : 0}
          className={cn(isLastPage && "pointer-events-none opacity-40")}
        >
          <Button
            variant="card"
            size="icon-sm"
            disabled={isLastPage}
            aria-label="Halaman selanjutnya"
          >
            <ChevronRight className="w-4 h-4 stroke-[3px]" />
          </Button>
        </Link>
      )}
    </nav>
  );
}

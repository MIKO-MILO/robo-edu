"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Star, Calendar, Package, Loader2, AlertCircle, InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MyReview {
  id: string;
  product_id: string;
  product_name: string;
  order_item_id: string;
  rating: number;
  comment: string | null;
  status: string;
  images: string[];
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={[
            "w-3.5 h-3.5",
            i < rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40",
          ].join(" ")}
        />
      ))}
      <span className="ml-1 font-body text-xs text-muted-foreground">{rating}/5</span>
    </span>
  );
}

const ITEMS_PER_PAGE = 20;

// ── Inner content ──────────────────────────────────────────────────────────────

function MyReviewsContent() {
  const [rows, setRows] = useState<MyReview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (page: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      const res = await fetch(`/api/reviews?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error((json as { message?: string }).message ?? "Gagal memuat ulasan.");
      setRows((json.data as MyReview[]) ?? []);
      // The endpoint currently returns all with no meta; set totalPages = 1 for now
      if (json.meta) {
        const total: number = json.meta.total ?? (json.data as unknown[]).length;
        setTotalPages(Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat ulasan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReviews(currentPage);
  }, [fetchReviews, currentPage]);

  return (
    <main className="w-full flex-1 min-w-0">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
            Ulasan Saya
          </h1>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="font-body text-sm">Memuat ulasan...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && loadError && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="font-body text-sm text-muted-foreground">{loadError}</p>
            <Button variant="outline" size="sm" onClick={() => void fetchReviews(currentPage)}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !loadError && rows.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="p-4 rounded-full bg-muted border-2 border-foreground">
              <InboxIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-bold text-base text-foreground">
                Belum ada ulasan
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Ulasan yang kamu tulis setelah menerima produk akan muncul di sini.
              </p>
            </div>
            <Link href="/profile/orders">
              <Button variant="outline" size="sm">Lihat Pesanan</Button>
            </Link>
          </div>
        )}

        {/* List */}
        {!isLoading && !loadError && rows.length > 0 && (
          <div className="flex flex-col gap-3">
            {rows.map((review) => (
              <div
                key={review.id}
                className="bg-card border-2 border-foreground rounded-2xl px-5 py-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Product + comment */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <p className="font-heading font-bold text-sm text-foreground truncate">
                        {review.product_name}
                      </p>
                    </div>
                    <StarRow rating={review.rating} />
                    {review.comment && (
                      <p className="font-body text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                    {review.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {review.images.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="foto ulasan"
                              className="w-14 h-14 rounded-xl object-cover border-2 border-foreground hover:border-primary transition-colors"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(review.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !loadError && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </main>
  );
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function MyReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <MyReviewsContent />
    </Suspense>
  );
}

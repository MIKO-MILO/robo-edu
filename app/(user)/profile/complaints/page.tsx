"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  Calendar,
  Package,
  Loader2,
  AlertCircle,
  InboxIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/admin/status-badge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ComplaintAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
}

interface ComplaintRow {
  id: string;
  order_item_id: string;
  subject: string;
  description: string;
  status: string;
  resolution: string | null;
  resolved_at: string | null;
  attachments: ComplaintAttachment[];
  created_at: string;
  updated_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Map lowercase DB status → uppercase for StatusBadge */
function normalizeStatus(raw: string): string {
  const map: Record<string, string> = {
    open: "OPEN",
    in_review: "IN_REVIEW",
    resolved: "RESOLVED",
    closed: "REJECTED",
  };
  return map[raw.toLowerCase()] ?? raw.toUpperCase();
}

const ITEMS_PER_PAGE = 10;

// ── Inner content (uses Suspense-aware hooks) ──────────────────────────────────

function ComplaintsContent() {
  const [rows, setRows] = useState<ComplaintRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async (page: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      const res = await fetch(`/api/complaints?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal memuat daftar komplain.");
      setRows((json.data as ComplaintRow[]) ?? []);
      // The user complaints endpoint currently returns a flat array; meta may not be present
      if (json.meta) {
        const totalCount: number = json.meta.total_count ?? json.meta.total ?? 0;
        const perPage: number = json.meta.per_page ?? json.meta.limit ?? ITEMS_PER_PAGE;
        setTotalPages(Math.max(1, Math.ceil(totalCount / perPage)));
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat daftar komplain.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchComplaints(currentPage);
  }, [fetchComplaints, currentPage]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return (
    <main className="w-full flex-1 min-w-0">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-tight flex items-center gap-3">
            <MessageSquareWarning className="w-7 h-7 text-orange-500" />
            Komplain Saya
          </h1>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="font-body text-sm">Memuat daftar komplain...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && loadError && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="font-body text-sm text-muted-foreground">{loadError}</p>
            <Button variant="outline" size="sm" onClick={() => void fetchComplaints(currentPage)}>
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
                Belum ada komplain
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Komplain yang kamu ajukan dari halaman detail pesanan akan muncul di sini.
              </p>
            </div>
          </div>
        )}

        {/* List */}
        {!isLoading && !loadError && rows.length > 0 && (
          <div className="flex flex-col gap-3">
            {rows.map((complaint) => (
              <Link
                key={complaint.id}
                href={`/profile/complaints/${complaint.id}`}
                className="block"
              >
                <div className="bg-card border-2 border-foreground rounded-2xl px-5 py-4 hover:border-primary hover:shadow-sm transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Subject + product info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {complaint.subject}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {complaint.description}
                      </p>
                    </div>

                    {/* Status + date */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                      <StatusBadge
                        status={normalizeStatus(complaint.status)}
                        size="sm"
                        neo
                      />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {formatDate(complaint.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Attachment count badge */}
                  {complaint.attachments.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Package className="w-3.5 h-3.5 shrink-0" />
                      {complaint.attachments.length} lampiran
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !loadError && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </main>
  );
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function ProfileComplaintsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <ComplaintsContent />
    </Suspense>
  );
}

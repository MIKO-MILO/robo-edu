"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { Button, BackButton } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ResellerStatus } from "@/types/enums";

export interface ResellerDetailHeaderProps {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resellerStatus: ResellerStatus;
  resellerAppliedAt: string | null;
  resellerApprovedAt: string | null;
  isActive: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

/**
 * Molecule — Header detail pengajuan reseller.
 * Menampilkan breadcrumb, info pemohon, status, dan tombol aksi approve/reject.
 * Tombol aksi hanya muncul jika status PENDING.
 */
export function ResellerDetailHeader({
  id,
  name,
  email,
  phone,
  resellerStatus,
  resellerAppliedAt,
  resellerApprovedAt,
  isActive,
  onApprove,
  onReject,
}: ResellerDetailHeaderProps) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : null;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="space-y-4">
      {/* Back link */}
      <div>
        <BackButton href="/admin/resellers" label="Kembali ke Daftar Reseller" />
      </div>

      {/* Main Header Container */}
      <div className="bg-card p-6 rounded-2xl border-2 border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-primary/10 border-2 border-primary/30 text-primary font-heading font-bold text-xl flex items-center justify-center shrink-0">
            {getInitials(name)}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {name}
              </h1>
              <StatusBadge
                status={resellerStatus}
                size="sm"
                neo
                customLabel={
                  resellerStatus === "PENDING"
                    ? "Menunggu Review"
                    : resellerStatus === "APPROVED"
                    ? "Reseller Aktif"
                    : "Pengajuan Ditolak"
                }
              />
              <StatusBadge
                status={isActive ? "ACTIVE" : "INACTIVE"}
                size="sm"
                customLabel={isActive ? "Akun Aktif" : "Nonaktif"}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="size-3.5" />
                <span>{email}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  <span>{phone}</span>
                </div>
              )}
              <span className="text-[11px] bg-muted px-2 py-0.5 rounded-md font-mono text-muted-foreground">
                ID: {id}
              </span>
            </div>

            {/* Timeline info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {resellerAppliedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>Diajukan: {formatDateTime(resellerAppliedAt)}</span>
                </div>
              )}
              {resellerApprovedAt && (
                <div className="flex items-center gap-1 text-success">
                  <Calendar className="size-3" />
                  <span>Disetujui: {formatDateTime(resellerApprovedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {waUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl border-2 border-border font-heading font-bold text-xs"
            >
              <a href={waUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </Button>
          )}

          {resellerStatus === "PENDING" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl text-danger hover:text-danger border-2 border-border font-heading font-bold text-xs"
                onClick={onReject}
              >
                <XCircle className="size-4" />
                <span>Tolak</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 rounded-xl bg-primary hover:bg-primary-600 font-heading font-bold text-xs"
                onClick={onApprove}
              >
                <CheckCircle2 className="size-4" />
                <span>Setujui Reseller</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

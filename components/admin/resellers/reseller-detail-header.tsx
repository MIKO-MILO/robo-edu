"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronRight,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/button";
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

const STATUS_CONFIG: Record<
  ResellerStatus,
  { label: string; bgColor: string; dotColor: string; textColor: string }
> = {
  PENDING: {
    label: "PENDING REVIEW",
    bgColor: "bg-warning-bg",
    dotColor: "bg-warning animate-ping",
    textColor: "text-foreground",
  },
  APPROVED: {
    label: "APPROVED",
    bgColor: "bg-success-bg",
    dotColor: "bg-success",
    textColor: "text-success",
  },
  REJECTED: {
    label: "REJECTED",
    bgColor: "bg-danger-bg",
    dotColor: "bg-danger",
    textColor: "text-danger",
  },
  NOT_RESELLER: {
    label: "BUKAN RESELLER",
    bgColor: "bg-muted",
    dotColor: "bg-muted-foreground",
    textColor: "text-muted-foreground",
  },
};

/**
 * Molecule — Header detail pengajuan reseller (Neo-Brutalist).
 * Menampilkan breadcrumb, status badge, profil pemohon, dan tombol aksi CTA.
 * Layout: top action bar → profile bento card.
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
  const statusCfg = STATUS_CONFIG[resellerStatus] ?? STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-4">
      {/* ── Top Action Bar & Breadcrumbs ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Back button — Neo style */}
          <BackButton
            href="/admin/resellers"
            label="KEMBALI KE DAFTAR RESELLER"
          />

          {/* Breadcrumb trail */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="size-3" />
            <span>Reseller</span>
            <ChevronRight className="size-3" />
            <span className="text-foreground bg-warning-bg px-2 py-0.5 border border-border">
              Verifikasi ({id.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Status + ID chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "border border-border rounded-full px-3 py-1",
              "font-heading text-xs font-bold flex items-center gap-1.5",
              statusCfg.bgColor,
              statusCfg.textColor
            )}
          >
            <span className={cn("size-2 rounded-full shrink-0", statusCfg.dotColor)} />
            STATUS: {statusCfg.label}
          </span>
          <span className="border border-border rounded-full bg-accent-soft-blue px-2.5 py-1 text-xs font-mono font-bold">
            ID: {id.toUpperCase()}
          </span>
          <span className="border border-border bg-muted px-2.5 py-1 text-xs font-body font-medium flex items-center gap-1 text-muted-foreground">
            <Shield className="size-3.5" />
            superadmin / admin_sales
          </span>
        </div>
      </header>

      {/* ── Bento Profile Overview ── */}
      <section className="border border-border rounded-2xl bg-card p-5 md:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Left: Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar initials */}
            <div
              className={cn(
                "size-20 rounded-full bg-accent-soft-blue border border-border",
                "flex items-center justify-center shrink-0",
                "font-heading font-extrabold text-2xl text-primary"
              )}
            >
              {getInitials(name)}
            </div>

            {/* Info block */}
            <div className="space-y-1.5">
              {/* Name + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {name}
                </h1>
                {isActive && (
                  <span className="border border-border bg-success-bg rounded-full px-2.5 py-0.5 text-xs font-bold font-heading uppercase text-success">
                    Customer Aktif
                  </span>
                )}
                <span className="border-2 border-border bg-warning-bg px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-foreground">
                  Reseller Applicant
                </span>
              </div>

              {/* Contact meta row */}
              <div className="flex flex-wrap gap-y-1 gap-x-4 pt-1 text-xs font-body font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" />
                  {email}
                </span>
                {phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-primary" />
                    {phone}
                  </span>
                )}
                {resellerAppliedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    Diajukan: {formatDateTime(resellerAppliedAt)}
                  </span>
                )}
                {resellerApprovedAt && (
                  <span className="flex items-center gap-1.5 text-success">
                    <Calendar className="size-3.5" />
                    Disetujui: {formatDateTime(resellerApprovedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Decision CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "border-2 border-border neo-shadow-icon bg-card hover:bg-muted",
                  "text-xs font-heading font-bold px-3 py-2.5",
                  "flex items-center justify-center gap-1.5 flex-1 sm:flex-initial",
                  "neo-shadow-hover transition-all duration-100"
                )}
              >
                <MessageCircle className="size-4 text-green-700" />
                WHATSAPP
              </a>
            )}
            {resellerStatus === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={onReject}
                  className={cn(
                    "border-2 border-border neo-shadow bg-danger-bg hover:bg-accent-pink text-danger",
                    "text-xs font-heading font-bold px-4 py-2.5",
                    "flex items-center justify-center gap-1.5 flex-1 sm:flex-initial",
                    "neo-shadow-hover transition-all duration-100"
                  )}
                >
                  <XCircle className="size-4" />
                  TOLAK
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  className={cn(
                    "border-2 border-border neo-shadow bg-primary hover:bg-primary-600 text-white",
                    "text-xs font-heading font-bold px-5 py-2.5",
                    "flex items-center justify-center gap-1.5 flex-1 sm:flex-initial",
                    "neo-shadow-hover transition-all duration-100"
                  )}
                >
                  <CheckCircle2 className="size-4" />
                  SETUJUI RESELLER
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

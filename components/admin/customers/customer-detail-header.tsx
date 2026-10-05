"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { Button, BackButton, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ResellerStatus } from "@/types/enums";

export interface CustomerDetailHeaderProps {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resellerStatus: ResellerStatus;
  isActive: boolean;
  createdAt: string;
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

/**
 * Molecule — Header detail pelanggan dengan navigasi kembali,
 * profil ringkas, status badges, dan tombol aksi (WhatsApp, setujui reseller).
 */
export function CustomerDetailHeader({
  id,
  name,
  email,
  phone,
  resellerStatus,
  isActive,
}: CustomerDetailHeaderProps) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : null;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="space-y-4">
      {/* Back link */}
      <div>
        <BackButton href="/admin/customers" label="Kembali ke Daftar Pelanggan" />
      </div>

      {/* Main Header Container */}
      <div className="bg-card p-6 rounded-2xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 border border-primary/30 text-primary font-heading font-bold text-xl flex items-center justify-center shrink-0">
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
                  resellerStatus === "NOT_RESELLER"
                    ? "Pelanggan Reguler"
                    : resellerStatus === "APPROVED"
                    ? "Reseller Aktif"
                    : resellerStatus === "PENDING"
                    ? "Pengajuan Reseller"
                    : "Reseller Ditolak"
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
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5 rounded-xl border-2 border-border font-heading font-bold text-xs",
              })}
            >
              <MessageCircle className="size-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          )}

          {resellerStatus === "PENDING" && (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 rounded-xl bg-primary hover:bg-primary-600 font-heading font-bold text-xs"
              onClick={() => alert(`Pengajuan reseller ${name} disetujui`)}
            >
              <CheckCircle2 className="size-4" />
              <span>Setujui Reseller</span>
            </Button>
          )}

          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl text-destructive hover:text-destructive border-2 border-border font-heading font-bold text-xs"
              onClick={() => alert(`Akun ${name} dinonaktifkan`)}
            >
              <Ban className="size-4" />
              <span>Suspend</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl text-success hover:text-success border-2 border-border font-heading font-bold text-xs"
              onClick={() => alert(`Akun ${name} diaktifkan kembali`)}
            >
              <ShieldCheck className="size-4" />
              <span>Aktifkan</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Award,
  CreditCard,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import type { UserAddress } from "@/types/user";

export interface CustomerProfileCardProps {
  name: string;
  email: string;
  phone: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  taxId?: string | null;
  taxCountry?: string | null;
  resellerApprovedAt?: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  addresses: UserAddress[];
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoString));
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
 * Molecule — Kartu informasi profil lengkap & daftar alamat pengiriman customer.
 */
export function CustomerProfileCard({
  name,
  email,
  phone,
  gender,
  taxId,
  taxCountry,
  resellerApprovedAt,
  createdAt,
  lastLoginAt,
  addresses,
}: CustomerProfileCardProps) {
  return (
    <div className="space-y-6">
      {/* 1. Data Diri & Kontak */}
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-3">
          <User className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Data Pribadi &amp; Kontak
          </h3>
        </div>

        <div className="space-y-3 text-xs font-body">
          <div>
            <div className="text-muted-foreground">Nama Lengkap</div>
            <div className="font-semibold text-foreground mt-0.5">{name}</div>
          </div>

          <div>
            <div className="text-muted-foreground">Email</div>
            <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="size-3.5 text-muted-foreground" />
              <span>{email}</span>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Nomor Telepon / WhatsApp</div>
            <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
              <Phone className="size-3.5 text-muted-foreground" />
              <span>{phone || "-"}</span>
            </div>
          </div>

          {gender && (
            <div>
              <div className="text-muted-foreground">Jenis Kelamin</div>
              <div className="font-semibold text-foreground mt-0.5">
                {gender === "MALE" ? "Laki-laki" : gender === "FEMALE" ? "Perempuan" : "Lainnya"}
              </div>
            </div>
          )}

          {taxId && (
            <div>
              <div className="text-muted-foreground">Nomor Pokok Wajib Pajak (NPWP / Tax ID)</div>
              <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <CreditCard className="size-3.5 text-muted-foreground" />
                <span>
                  {taxId} {taxCountry && `(${taxCountry})`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Daftar Alamat Tersimpan */}
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <h3 className="font-heading font-bold text-sm text-foreground">
              Alamat Pengiriman
            </h3>
          </div>
          <span className="text-[11px] font-heading font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {addresses.length} Alamat
          </span>
        </div>

        <div className="space-y-3">
          {addresses.length === 0 ? (
            <div className="text-xs text-muted-foreground italic py-3 text-center">
              Belum ada alamat pengiriman yang didaftarkan.
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-heading font-bold text-foreground">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span>{addr.label || "Alamat Pengiriman"}</span>
                  </div>
                  {addr.is_primary && (
                    <span className="bg-primary/15 text-primary text-[10px] font-heading font-bold px-2 py-0.5 rounded-full border border-primary/30">
                      Utama
                    </span>
                  )}
                </div>

                <div className="font-semibold text-foreground">
                  {addr.recipient_name}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({addr.phone})
                  </span>
                </div>

                <div className="text-muted-foreground leading-relaxed">
                  {addr.address}, {addr.village && `${addr.village}, `}
                  {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Metadata Akun */}
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b-2 border-border pb-2.5">
          <Clock className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Informasi Akun
          </h3>
        </div>

        <div className="space-y-2 text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> Tanggal Terdaftar:
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> Terakhir Login:
            </span>
            <span className="font-semibold text-foreground">
              {lastLoginAt ? formatDateTime(lastLoginAt) : "Belum pernah"}
            </span>
          </div>

          {resellerApprovedAt && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Award className="size-3 text-purple-600" /> Reseller Disetujui:
              </span>
              <span className="font-semibold text-foreground">
                {formatDate(resellerApprovedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

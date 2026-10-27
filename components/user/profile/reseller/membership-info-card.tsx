import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CalendarClock, Tag, Truck, AlertTriangle, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembershipStatusBadge } from "./membership-status-badge";
import type { MembershipPurchase } from "@/types";

/**
 * MembershipInfoCard
 * ------------------
 * Card hero untuk user berstatus MEMBER.
 * Layout: 2 kolom — teks di kiri, maskot di kanan.
 *
 * Konten (PRD Bab 6.8):
 *   - Badge "Member Aktif"
 *   - "Membership Anda aktif hingga [tanggal]"
 *   - Deskripsi benefit aktif
 *   - CTA: Perpanjang / Lihat Produk
 *   - Peringatan bila sisa < 7 hari
 *   - Grid info: tanggal mulai, tanggal akhir, sisa hari
 *   - 2 benefit chip: Harga Member, Dropship
 *
 * PRD Bab 6.8 | US-011, US-013
 */

interface MembershipInfoCardProps {
  membershipExpiresAt: string;
  purchases: MembershipPurchase[];
}

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return DATE_FORMAT.format(new Date(iso));
}

function getDaysRemaining(expiresAt: string): number {
  const now = new Date();
  const exp = new Date(expiresAt);
  const diff = exp.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function MembershipInfoCard({
  membershipExpiresAt,
  purchases,
}: MembershipInfoCardProps) {
  const daysRemaining = getDaysRemaining(membershipExpiresAt);
  const isExpiringSoon = daysRemaining <= 7;

  const latestPaidPurchase = purchases.find((p) => p.status === "PAID");
  const startsAt = latestPaidPurchase?.starts_at ?? null;

  return (
    <div className="space-y-4">
      {/* ── Peringatan expiry (hanya bila < 7 hari) ─────────────── */}
      {isExpiringSoon && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/50 bg-warning-bg/60 px-5 py-4">
          <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-heading text-xs font-bold text-warning">
              Membership hampir berakhir!
            </p>
            <p className="font-body text-xs text-warning/80 mt-0.5">
              Sisa {daysRemaining} hari. Perpanjang sekarang agar benefit tidak terputus.
            </p>
          </div>
        </div>
      )}

      {/* ── Hero card: teks kiri + maskot kanan ─────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-8 shadow-sm">
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-6 -top-6 size-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-16 -bottom-8 size-36 rounded-full bg-white/5" />

        <div className="flex items-start justify-between gap-4 sm:pr-56">
          {/* ── Konten kiri ── */}
          <div className="flex-1 min-w-0 z-10">
            <MembershipStatusBadge status="MEMBER" className="mb-4 bg-white/20 text-white border-white/30" />

            <p className="font-body text-sm text-white/70 mb-1">
              Membership Anda aktif hingga
            </p>
            <h2 className="font-heading text-2xl font-bold text-white leading-tight mb-3">
              {formatDate(membershipExpiresAt)}
            </h2>
            <p className="font-body text-sm text-white/80 mb-6 leading-relaxed">
              Nikmati harga member dan akses dropship di semua produk RoboEdu.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="font-heading font-bold rounded-2xl bg-white text-primary hover:bg-white/90 shadow-none border-0"
              >
                <Link href="/reseller">
                  <RotateCcw className="size-4" />
                  Perpanjang Membership
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="font-heading font-bold rounded-2xl text-white hover:bg-white/15 hover:text-white border-0 shadow-none"
              >
                <Link href="/product">
                  Lihat Produk
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Maskot kanan (absolute — di luar flex flow agar bebas membesar) ──
              Absolute ke bottom-right card. overflow-hidden di parent memotong rapi.
               Ukuran w-56 h-full memenuhi tinggi card secara dinamis.           */}
          <div className="hidden sm:block absolute bottom-0 right-16 w-56 h-full pointer-events-none z-10">
            <Image
              src="/assets/images/maskotrobo.png"
              alt="RoboEdu Maskot"
              fill
              className="object-contain object-bottom select-none drop-shadow-lg"
              priority
            />
          </div>
        </div>
      </div>

      {/* ── Info grid: tanggal + sisa hari ──────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-[#C7C4BB] px-4 py-4 shadow-sm">
          <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Berlaku mulai
          </p>
          <p className="font-body text-sm font-semibold text-foreground">
            {formatDate(startsAt)}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#C7C4BB] px-4 py-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarClock className="size-3 text-muted-foreground" />
            <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Berlaku hingga
            </p>
          </div>
          <p className="font-body text-sm font-semibold text-foreground">
            {formatDate(membershipExpiresAt)}
          </p>
        </div>

        <div
          className={`rounded-2xl px-4 py-4 border shadow-sm ${isExpiringSoon
              ? "bg-warning-bg/50 border-warning/30"
              : "bg-success-bg/40 border-success/20"
            }`}
        >
          <p
            className={`font-heading text-[10px] font-bold uppercase tracking-widest mb-1 ${isExpiringSoon ? "text-warning" : "text-success"
              }`}
          >
            Sisa waktu
          </p>
          <p
            className={`font-heading text-xl font-bold ${isExpiringSoon ? "text-warning" : "text-success"
              }`}
          >
            {daysRemaining}{" "}
            <span className="font-body text-xs font-normal">hari</span>
          </p>
        </div>
      </div>

      {/* ── Benefit aktif ────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-[#C7C4BB] px-5 py-4 shadow-sm">
        <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Benefit aktif
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent-yellow shrink-0">
              <Tag className="size-4 text-foreground" />
            </div>
            <div>
              <p className="font-heading text-xs font-bold text-foreground">Harga Member</p>
              <p className="font-body text-xs text-muted-foreground">
                Berlaku di katalog, cart, dan checkout
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent-green shrink-0">
              <Truck className="size-4 text-foreground" />
            </div>
            <div>
              <p className="font-heading text-xs font-bold text-foreground">Dropship</p>
              <p className="font-body text-xs text-muted-foreground">
                Kirim ke pembeli akhir atas namamu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

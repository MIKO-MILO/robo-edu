"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CrownIcon,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Clock,
  Loader2,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CheckoutPaymentMethodSelector,
  type SelectedPayment,
} from "@/components/user/checkout/checkout-payment-method-selector";
import { membershipService } from "@/lib/api/services/membership.service";
import type { MembershipPurchase } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface PlanInfo {
  plan_name: string;
  price: number;
  duration_months: number;
  currency: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(d: Date | string): string {
  return DATE_FMT.format(typeof d === "string" ? new Date(d) : d);
}

/** Add `months` calendar months to `date` without day-overflow. */
function addMonthsSafe(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  result.setFullYear(targetYear, normalizedMonth, Math.min(result.getDate(), lastDay));
  return result;
}

/** Compute projected start and end dates for the new membership period.
 *  - New member: starts today, ends today + duration.
 *  - Renewal (already MEMBER): starts from existing expiry, ends expiry + duration.
 */
function computePeriod(
  durationMonths: number,
  membershipExpiresAt: string | null,
  isMember: boolean,
): { startsAt: Date; endsAt: Date } {
  const base = isMember && membershipExpiresAt
    ? new Date(membershipExpiresAt)
    : new Date();
  const endsAt = addMonthsSafe(base, durationMonths);
  return { startsAt: base, endsAt };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MembershipConfirmPage() {
  const router = useRouter();

  // ── Data state ──────────────────────────────────────────────────────────
  const [userData, setUserData] = useState<UserData | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [membershipData, setMembershipData] = useState<{
    membership_status: string;
    membership_expires_at: string | null;
    purchases: MembershipPurchase[];
  } | null>(null);

  // ── UI state ────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<SelectedPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Load page data ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const [meRes, planRes, membershipRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/membership/plan-info"),
        membershipService.getMembershipStatus().catch(() => null),
      ]);

      // Auth check — redirect if not logged in
      if (meRes.status === 401) {
        router.replace("/login?redirect=/reseller");
        return;
      }
      if (!meRes.ok) throw new Error("Gagal memuat data akun.");
      if (!planRes.ok) throw new Error("Gagal memuat informasi paket.");

      const meJson = await meRes.json();
      const planJson = await planRes.json();

      setUserData(meJson.data as UserData);
      setPlanInfo(planJson.data as PlanInfo);

      if (membershipRes?.success) {
        setMembershipData(membershipRes.data);
      }
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Derived values ──────────────────────────────────────────────────────
  const isMember = membershipData?.membership_status === "MEMBER";
  const membershipExpiresAt = membershipData?.membership_expires_at ?? null;

  // Find any PENDING purchase the user hasn't paid yet
  const pendingPurchase = membershipData?.purchases.find(
    (p) => p.status === "PENDING",
  ) ?? null;

  const period = planInfo
    ? computePeriod(planInfo.duration_months, membershipExpiresAt, isMember)
    : null;

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selectedPayment) {
      setSubmitError("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await membershipService.createCheckout({
        paymentMethod: selectedPayment.method.method,
        paymentChannel: selectedPayment.method.channel,
        payerPhoneNumber: selectedPayment.ovoPhone,
      });
      if (!res.success) throw new Error((res as { message?: string }).message ?? "Gagal membuat transaksi.");
      router.push(`/membership/payment/${res.data.purchaseId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setIsSubmitting(false);
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-body text-sm">Memuat halaman konfirmasi…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (pageError || !userData || !planInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="size-10 text-destructive" />
          <p className="font-body text-sm text-muted-foreground">
            {pageError ?? "Gagal memuat halaman."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Coba Lagi
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/membership">Kembali</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── PENDING purchase guard ───────────────────────────────────────────────
  // If there's already a PENDING purchase, don't let the user create another.
  if (pendingPurchase) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 pt-32 pb-16">
          <Link
            href="/membership"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke Membership
          </Link>

          <div className="rounded-3xl bg-white border border-[#C7C4BB] shadow-sm p-8 text-center space-y-5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-yellow mx-auto">
              <Clock className="size-7 text-foreground" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Ada pembayaran yang menunggu
              </h2>
              <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Kamu sudah memiliki satu transaksi membership yang belum selesai
                dibayar. Selesaikan pembayaran itu terlebih dahulu.
              </p>
            </div>

            <div className="rounded-2xl border border-[#C7C4BB] bg-muted/40 px-5 py-4 text-left space-y-1">
              <p className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Nomor Pembelian
              </p>
              <p className="font-body text-sm font-semibold text-foreground">
                {pendingPurchase.purchase_number}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Dibuat: {formatDate(pendingPurchase.created_at)}
              </p>
            </div>

            <Button
              asChild
              variant="primary"
              size="lg"
              className="w-full font-heading font-bold rounded-2xl"
            >
              <Link href={`/membership/payment/${pendingPurchase.id}`}>
                <ExternalLink className="size-4" />
                Lanjutkan Pembayaran
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
              <Link href="/profile/membership">Lihat Riwayat Membership</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main confirmation screen ─────────────────────────────────────────────
  const durationLabel =
    planInfo.duration_months === 1
      ? "1 bulan"
      : `${planInfo.duration_months} bulan`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="max-w-2xl mx-auto px-4 pt-32 pb-4">
        <div className="bg-card rounded-2xl p-4 sm:p-5 border-2 border-border flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight">
              {isMember ? "Perpanjang Membership" : "Konfirmasi Membership"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isMember
                ? "Perpanjang masa berlaku Member Plus-mu"
                : "Satu langkah lagi untuk jadi Member Plus"}
            </p>
          </div>
          <Link
            href="/membership"
            className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full border-2 border-border bg-card text-foreground font-body font-semibold text-xs neo-shadow neo-shadow-hover transition-all"
          >
            <ArrowLeft className="size-3.5" />
            Kembali
          </Link>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-5">
        {/* ── 1. Ringkasan paket ────────────────────────────────── */}
        <section className="bg-card rounded-2xl border-2 border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border/60">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent-butter">
              <CrownIcon className="size-5 text-foreground" />
            </div>
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ringkasan Paket
              </p>
              <h2 className="font-heading text-base font-bold text-foreground">
                Membership {planInfo.plan_name}
              </h2>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-3">
            {/* Price row */}
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">Harga</span>
              <span className="font-heading text-xl font-black text-primary">
                {formatRupiah(planInfo.price)}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">Durasi</span>
              <span className="font-body text-sm font-semibold text-foreground">
                {durationLabel}
              </span>
            </div>

            {/* Period */}
            {period && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Berlaku mulai
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {formatDate(period.startsAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Berlaku hingga
                  </span>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {formatDate(period.endsAt)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Renewal notice for existing MEMBERs */}
          {isMember && membershipExpiresAt && (
            <div className="mx-6 mb-5 flex items-start gap-2.5 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3">
              <RotateCcw className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="font-body text-xs text-foreground leading-relaxed">
                Masa berlaku akan <strong>diperpanjang dari {formatDate(membershipExpiresAt)}</strong>,
                sehingga kamu tidak kehilangan sisa hari yang ada.
              </p>
            </div>
          )}
        </section>

        {/* ── 2. Data akun (read-only) ──────────────────────────── */}
        <section className="bg-card rounded-2xl border-2 border-border overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border/60">
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Data Akun
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Data hanya untuk verifikasi, tidak dapat diubah di sini
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center gap-3">
              <User className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="font-body text-xs text-muted-foreground">Nama</p>
                <p className="font-body text-sm font-semibold text-foreground">
                  {userData.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="font-body text-xs text-muted-foreground">Email</p>
                <p className="font-body text-sm font-semibold text-foreground">
                  {userData.email}
                </p>
              </div>
            </div>

            {userData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="font-body text-xs text-muted-foreground">Telepon</p>
                  <p className="font-body text-sm font-semibold text-foreground">
                    {userData.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 3. Metode pembayaran ───────────────────────────────── */}
        <section className="bg-card rounded-2xl border-2 border-border px-6 py-5">
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Metode Pembayaran
          </p>
          <p className="font-body text-xs text-muted-foreground mb-3">
            Pembayaran diproses aman oleh Midtrans
          </p>

          {/* Reuse the same selector component from ticket 01 */}
          <CheckoutPaymentMethodSelector
            value={selectedPayment}
            onChange={setSelectedPayment}
          />
        </section>

        {/* ── Error ─────────────────────────────────────────────── */}
        {submitError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        {/* ── Submit ───────────────────────────────────────────── */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full font-heading font-black text-base rounded-2xl py-6"
            disabled={isSubmitting || !selectedPayment}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Memproses…
              </>
            ) : (
              <>
                <CrownIcon className="size-5" />
                {isMember
                  ? `Perpanjang — ${formatRupiah(planInfo.price)}`
                  : `Beli Membership Plus — ${formatRupiah(planInfo.price)}`}
              </>
            )}
          </Button>

          <p className="text-center font-body text-xs text-muted-foreground">
            Tidak ada voucher untuk pembelian membership. Harga sudah final.
          </p>
        </div>
      </main>
    </div>
  );
}

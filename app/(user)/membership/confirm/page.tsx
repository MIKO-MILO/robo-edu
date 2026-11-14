"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Crown,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CheckoutPaymentMethodSelector,
  type SelectedPayment,
} from "@/components/user/checkout/checkout-payment-method-selector";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanInfo {
  price: number;
  duration_months: number;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface MembershipInfo {
  membership_status: "MEMBER" | "NOT_MEMBER";
  membership_expires_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Compute estimated start and end dates.
 * - If user is currently MEMBER with an active expiry, start = expiry (renewal from that date).
 * - Otherwise start = today (rounded to start of day).
 */
function computeDateRange(
  durationMonths: number,
  membershipInfo: MembershipInfo | null,
): { startDate: Date; endDate: Date } {
  let startDate: Date;

  if (
    membershipInfo?.membership_status === "MEMBER" &&
    membershipInfo.membership_expires_at
  ) {
    const expiresAt = new Date(membershipInfo.membership_expires_at);
    // Only use expiry as start if it's in the future
    startDate =
      expiresAt > new Date() ? expiresAt : new Date();
  } else {
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
  }

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);

  return { startDate, endDate };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MembershipConfirmPage() {
  const router = useRouter();

  // ── Loading / error ──────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // ── Fetched data ─────────────────────────────────────────────────────
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);

  // ── UI / submit state ─────────────────────────────────────────────────
  const [selectedPayment, setSelectedPayment] = useState<SelectedPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── 409 pending purchase ──────────────────────────────────────────────
  const [pendingPurchaseId, setPendingPurchaseId] = useState<string | null>(null);

  // ── Load page data ────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);
    setPendingPurchaseId(null);

    try {
      // Check auth first (non-parallel so we can redirect early)
      const authRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!authRes.ok) {
        router.replace("/login?next=/membership/confirm");
        return;
      }
      const authJson = await authRes.json();
      const user: AuthUser = authJson.data;
      setAuthUser(user);

      // Fetch plan info and membership status in parallel
      const [planRes, memberRes] = await Promise.all([
        fetch("/api/membership/plan-info", { cache: "no-store" }),
        fetch("/api/membership/me", { cache: "no-store" }),
      ]);

      const [planJson, memberJson] = await Promise.all([
        planRes.json(),
        memberRes.json(),
      ]);

      if (!planRes.ok) {
        throw new Error(
          planJson.message ?? "Gagal memuat informasi paket membership.",
        );
      }

      setPlanInfo(planJson.data as PlanInfo);

      // Membership status is optional — if the endpoint fails, we degrade
      // gracefully (no extension info shown, treat as NOT_MEMBER)
      if (memberRes.ok && memberJson.success) {
        setMembershipInfo({
          membership_status: memberJson.data.membership_status,
          membership_expires_at: memberJson.data.membership_expires_at,
        });
      }
    } catch (err) {
      setPageError(
        err instanceof Error
          ? err.message
          : "Gagal memuat halaman konfirmasi.",
      );
    } finally {
      setPageLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selectedPayment) return;

    // Guard OVO: nomor HP wajib
    if (
      selectedPayment.method.channel === "ovo" &&
      !selectedPayment.ovoPhone
    ) {
      setSubmitError("Masukkan nomor HP OVO terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setPendingPurchaseId(null);

    try {
      const res = await fetch("/api/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: "PLUS",
          payment_method: selectedPayment.method.method,
          payment_channel: selectedPayment.method.channel,
          ...(selectedPayment.method.channel === "ovo" && {
            payer_phone_number: selectedPayment.ovoPhone,
          }),
        }),
      });

      const json = await res.json();

      // 409 — PENDING_PURCHASE_EXISTS
      if (res.status === 409 && json.code === "PENDING_PURCHASE_EXISTS") {
        setPendingPurchaseId(json.purchase_id as string);
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        throw new Error(json.message ?? "Gagal membuat transaksi membership.");
      }

      // Success → redirect to payment instruction page
      router.push(`/membership/payment/${json.data.purchase_id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
      setIsSubmitting(false);
    }
  }

  // ─── Derived values ───────────────────────────────────────────────────
  const isMember = membershipInfo?.membership_status === "MEMBER";
  const isRenewal =
    isMember &&
    membershipInfo?.membership_expires_at != null &&
    new Date(membershipInfo.membership_expires_at) > new Date();

  const dateRange =
    planInfo && membershipInfo
      ? computeDateRange(planInfo.duration_months, membershipInfo)
      : planInfo
        ? computeDateRange(planInfo.duration_months, null)
        : null;

  // ── Can submit: payment selected + OVO phone filled (if OVO) ──────────
  const canSubmit =
    !!selectedPayment &&
    (selectedPayment.method.channel !== "ovo" || !!selectedPayment.ovoPhone);

  // ─── Loading screen ────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="font-body text-sm">Memuat informasi paket…</p>
        </div>
      </div>
    );
  }

  // ─── Error screen ──────────────────────────────────────────────────────
  if (pageError || !planInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="font-body text-sm text-muted-foreground">
            {pageError ?? "Informasi paket tidak tersedia."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => void loadData()}>
              Coba Lagi
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/membership">Kembali</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back link */}
        <Link
          href="/membership"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke halaman membership
        </Link>

        {/* Page header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-6 h-6 text-amber-500" />
            <h1 className="font-heading font-extrabold text-2xl text-foreground">
              {isRenewal ? "Perpanjang Membership" : "Konfirmasi Membership Plus"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            {isRenewal
              ? "Perpanjang masa berlaku keanggotaan RoboEdu Plus kamu."
              : "Periksa detail paket dan pilih metode pembayaran sebelum melanjutkan."}
          </p>
        </div>

        {/* ── PENDING PURCHASE BANNER ─────────────────────────────────── */}
        {pendingPurchaseId && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800 font-body">
                  Kamu sudah memiliki pembayaran yang belum selesai
                </p>
                <p className="text-xs text-amber-700 font-body mt-0.5">
                  Selesaikan pembayaran yang ada sebelum membuat pembelian baru.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Link href={`/membership/payment/${pendingPurchaseId}`}>
                Lanjutkan Pembayaran
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* ── RENEWAL INFO BANNER ─────────────────────────────────────── */}
        {isRenewal && membershipInfo?.membership_expires_at && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-800 font-body">
                Perpanjangan otomatis dari tanggal berakhir
              </p>
              <p className="text-xs text-blue-700 font-body mt-0.5">
                Masa berlaku saat ini berakhir pada{" "}
                <span className="font-semibold">
                  {formatDate(new Date(membershipInfo.membership_expires_at))}
                </span>
                . Pembaruan akan memperpanjang dari tanggal tersebut.
              </p>
            </div>
          </div>
        )}

        {/* ── PACKAGE SUMMARY ─────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/40">
            <h2 className="text-sm font-bold text-foreground font-heading">
              Ringkasan Paket
            </h2>
          </div>
          <div className="px-5 py-4 space-y-3">

            {/* Plan name */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground font-body">Paket</span>
              <span className="flex items-center gap-1.5 font-semibold text-sm font-body">
                <Crown className="w-4 h-4 text-amber-500" />
                Membership Plus
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground font-body">Harga</span>
              <span className="font-bold text-base text-foreground font-heading">
                {formatRupiah(planInfo.price)}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground font-body">Durasi</span>
              <span className="font-semibold text-sm font-body">
                {planInfo.duration_months} bulan
              </span>
            </div>

            {/* Date range */}
            {dateRange && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground font-body flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Estimasi mulai
                  </span>
                  <span className="font-semibold text-sm font-body">
                    {formatDate(dateRange.startDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground font-body flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Estimasi berakhir
                  </span>
                  <span className="font-semibold text-sm font-body">
                    {formatDate(dateRange.endDate)}
                  </span>
                </div>
              </>
            )}

            {/* Total divider */}
            <div className="pt-2 mt-1 border-t border-border flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-foreground font-heading">Total</span>
              <span className="text-lg font-black text-primary font-heading">
                {formatRupiah(planInfo.price)}
              </span>
            </div>
          </div>
        </section>

        {/* ── ACCOUNT INFO ────────────────────────────────────────────── */}
        {authUser && (
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/40">
              <h2 className="text-sm font-bold text-foreground font-heading">
                Data Akun
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground font-body">Nama</p>
                  <p className="text-sm font-semibold font-body text-foreground">
                    {authUser.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground font-body">Email</p>
                  <p className="text-sm font-semibold font-body text-foreground">
                    {authUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground font-body">Telepon</p>
                  <p className="text-sm font-semibold font-body text-foreground">
                    {authUser.phone ?? (
                      <span className="text-muted-foreground italic text-xs">
                        Belum diisi
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── PAYMENT METHOD ───────────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/40">
            <h2 className="text-sm font-bold text-foreground font-heading">
              Metode Pembayaran
            </h2>
          </div>
          <div className="px-5 py-4">
            <CheckoutPaymentMethodSelector
              value={selectedPayment}
              onChange={setSelectedPayment}
              variant="expand"
            />
          </div>
        </section>

        {/* ── SUBMIT ERROR ─────────────────────────────────────────────── */}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-body">{submitError}</p>
          </div>
        )}

        {/* ── SUBMIT BUTTON ────────────────────────────────────────────── */}
        <div className="pb-8">
          <Button
            size="lg"
            className="w-full font-heading font-bold text-base gap-2"
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {isRenewal
                  ? "Bayar & Perpanjang Membership"
                  : "Bayar & Aktifkan Membership Plus"}
              </>
            )}
          </Button>
          {!canSubmit && !isSubmitting && (
            <p className="text-center text-xs text-muted-foreground font-body mt-2">
              Pilih metode pembayaran untuk melanjutkan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

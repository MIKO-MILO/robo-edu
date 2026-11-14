"use client";

/**
 * PaymentInstructionPage
 * ─────────────────────────────────────────────────────────────────────────────
 * Halaman pembayaran kustom RoboEdu (Core API UI). Menggantikan Snap popup
 * Midtrans dengan instruksi bayar per payment_channel.
 *
 * Digunakan oleh:
 *   - /payment/[orderId]        → context="order"  → redirect ke /profile/orders/:id
 *   - /membership/payment/[id]  → context="membership" → redirect ke /profile/membership
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Smartphone,
  Store,
  CreditCard,
  QrCode,
  Landmark,
  ArrowRight,
  RotateCcw,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckoutPaymentMethodSelector,
  type SelectedPayment,
} from "@/components/user/checkout/checkout-payment-method-selector";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentContext = "order" | "membership";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

interface PaymentInfo {
  status: PaymentStatus;
  payment_type: string;
  payment_channel: string;
  amount: number;
  expiry_time: string | null;
  transaction_time: string | null;
  /** Dari Core API — null = backend belum tersedia, tampilkan mock */
  payment_instruction: Record<string, unknown> | null;
}

interface OrderInfo {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

export interface PaymentInstructionPageProps {
  /** ID order (untuk konteks "order") atau purchase ID (untuk konteks "membership") */
  transactionId: string;
  context?: PaymentContext;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Deteksi mobile sederhana — untuk tombol deeplink */
function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// ─── Mock payment_instruction per channel ────────────────────────────────────
// Digunakan saat backend Core API belum tersedia (payment_instruction = null).
// Tiap objek mencerminkan shape yang akan dikirim backend nantinya.

type MockInstruction =
  | { type: "va"; bank_code: string; va_number: string }
  | { type: "echannel"; company_code: string; bill_key: string }
  | { type: "cstore"; payment_code: string; store_name: string }
  | { type: "qr"; qr_string: string; deeplink_url: string }
  | { type: "dana"; deeplink_url: string }
  | { type: "ovo"; status_message: string }
  | { type: "credit_card"; redirect_url: string };

function getMockInstruction(channel: string): MockInstruction {
  switch (channel) {
    case "bca_va":
      return { type: "va", bank_code: "BCA", va_number: "1234567890123" };
    case "bni_va":
      return { type: "va", bank_code: "BNI", va_number: "9876543219876" };
    case "bri_va":
      return { type: "va", bank_code: "BRI", va_number: "1122334455667" };
    case "permata_va":
      return { type: "va", bank_code: "Permata", va_number: "8800112233445" };
    case "cimb_va":
      return { type: "va", bank_code: "CIMB", va_number: "7700998877665" };
    case "mandiri_va":
    case "echannel":
      return { type: "echannel", company_code: "70012", bill_key: "9988776655443" };
    case "alfamart":
      return { type: "cstore", payment_code: "ALFA-9988-7766-5544", store_name: "Alfamart" };
    case "indomaret":
      return { type: "cstore", payment_code: "INDO-5544-3322-1100", store_name: "Indomaret" };
    case "gopay":
      return {
        type: "qr",
        qr_string: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMDAnIGhlaWdodD0nMjAwJyB2aWV3Qm94PScwIDAgMjAwIDIwMCc+PHJlY3Qgd2lkdGg9JzIwMCcgaGVpZ2h0PScyMDAnIGZpbGw9JyNmM2VmZTQnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZScgdGV4dC1hbmNob3I9J21pZGRsZScgZm9udC1mYW1pbHk9J21vbm9zcGFjZScgZm9udC1zaXplPScxNCcgZmlsbD0nIzNkMjkwMCc+UVIgTW9jazwvdGV4dD48L3N2Zz4=",
        deeplink_url: "gojek://gopay/pay?token=mock_gopay_token",
      };
    case "shopeepay":
      return {
        type: "qr",
        qr_string: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMDAnIGhlaWdodD0nMjAwJyB2aWV3Qm94PScwIDAgMjAwIDIwMCc+PHJlY3Qgd2lkdGg9JzIwMCcgaGVpZ2h0PScyMDAnIGZpbGw9JyNmM2VmZTQnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZScgdGV4dC1hbmNob3I9J21pZGRsZScgZm9udC1mYW1pbHk9J21vbm9zcGFjZScgZm9udC1zaXplPScxNCcgZmlsbD0nIzNkMjkwMCc+UVIgTW9jazwvdGV4dD48L3N2Zz4=",
        deeplink_url: "shopee://wallet/pay?token=mock_shopeepay_token",
      };
    case "qris":
      return {
        type: "qr",
        qr_string: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMDAnIGhlaWdodD0nMjAwJyB2aWV3Qm94PScwIDAgMjAwIDIwMCc+PHJlY3Qgd2lkdGg9JzIwMCcgaGVpZ2h0PScyMDAnIGZpbGw9JyNmM2VmZTQnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZScgdGV4dC1hbmNob3I9J21pZGRsZScgZm9udC1mYW1pbHk9J21vbm9zcGFjZScgZm9udC1zaXplPScxNCcgZmlsbD0nIzNkMjkwMCc+UVIgTW9jazwvdGV4dD48L3N2Zz4=",
        deeplink_url: "https://qris.id/pay?data=mock_qris_data",
      };
    case "dana":
      return { type: "dana", deeplink_url: "dana://pay?amount=50000&info=RoboEdu" };
    case "ovo":
      return { type: "ovo", status_message: "Periksa notifikasi push di aplikasi OVO Anda." };
    case "credit_card":
      return { type: "credit_card", redirect_url: "/payment/3ds-placeholder" };
    default:
      return { type: "va", bank_code: "Bank", va_number: "0000000000000" };
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; dot: string; text: string }
> = {
  PENDING: {
    label: "Menunggu Bayar",
    bg: "bg-accent-yellow",
    dot: "bg-warning",
    text: "text-warning",
  },
  PAID: {
    label: "Lunas",
    bg: "bg-accent-green",
    dot: "bg-success",
    text: "text-success",
  },
  FAILED: {
    label: "Gagal",
    bg: "bg-accent-peach",
    dot: "bg-danger",
    text: "text-danger",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    bg: "bg-muted",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
  },
  REFUNDED: {
    label: "Dikembalikan",
    bg: "bg-accent-soft-blue",
    dot: "bg-info",
    text: "text-info",
  },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-foreground text-xs font-heading font-bold shadow-[1px_1px_0px_0px_#3D2900]",
        cfg.bg,
        cfg.text,
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full animate-pulse", cfg.dot)}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(expiryIso: string | null) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (!expiryIso) return 0;
    return Math.max(0, new Date(expiryIso).getTime() - Date.now());
  });

  useEffect(() => {
    if (!expiryIso) return;
    const tick = () =>
      setRemaining(Math.max(0, new Date(expiryIso).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiryIso]);

  if (!expiryIso || remaining <= 0)
    return { expired: true, display: "Kadaluarsa", urgent: false };

  const totalSeconds = Math.floor(remaining / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} jam`);
  parts.push(`${m.toString().padStart(2, "0")} mnt`);
  parts.push(`${s.toString().padStart(2, "0")} dtk`);

  return { expired: false, display: parts.join(" "), urgent: totalSeconds < 300 };
}

function CountdownDisplay({ expiryTime }: { expiryTime: string | null }) {
  const { expired, display, urgent } = useCountdown(expiryTime);
  if (!expiryTime) return null;
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-foreground text-sm font-heading font-bold tabular-nums",
        expired
          ? "bg-muted text-muted-foreground line-through"
          : urgent
            ? "bg-accent-peach text-danger animate-pulse"
            : "bg-accent-yellow text-warning",
      )}
    >
      <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{expired ? "Waktu habis" : display}</span>
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({
  value,
  label = "Salin",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCopy() {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Salin ${value}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 h-8 rounded-full border-2 border-foreground text-xs font-body font-semibold transition-all duration-100",
        copied
          ? "bg-accent-green text-success shadow-[1px_1px_0px_0px_#3D2900]"
          : "bg-muted text-foreground neo-shadow neo-shadow-hover",
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          Tersalin
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );
}

// ─── Info Row (label : value + copy) ─────────────────────────────────────────

function InfoRow({
  label,
  value,
  copyable = false,
  mono = false,
  large = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-body text-xs text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "break-all",
            mono ? "font-mono" : "font-heading font-bold",
            large ? "text-2xl sm:text-3xl" : "text-base sm:text-lg",
            "text-foreground",
          )}
        >
          {value}
        </span>
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function InstructionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border-2 border-foreground rounded-2xl neo-shadow overflow-hidden">
      <div className="px-5 py-4 border-b-2 border-foreground bg-muted/30 flex items-center gap-2">
        <span className="font-heading font-bold text-sm text-foreground uppercase tracking-wide">
          Instruksi Pembayaran
        </span>
      </div>
      <div className="p-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}

// ─── VA Layout ────────────────────────────────────────────────────────────────

function VALayout({
  instruction,
  amount,
}: {
  instruction: Extract<MockInstruction, { type: "va" }>;
  amount: number;
}) {
  return (
    <InstructionCard>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-soft-blue border-2 border-foreground">
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-foreground">
            {instruction.bank_code} Virtual Account
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Transfer ke nomor VA berikut
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 divide-y-2 divide-dashed divide-border/40">
        <InfoRow
          label="Nomor Virtual Account"
          value={instruction.va_number}
          copyable
          mono
          large
        />
        <div className="pt-4">
          <InfoRow
            label="Total Pembayaran"
            value={formatRupiah(amount)}
            copyable
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 border border-border/40">
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Lakukan transfer ke nomor VA di atas melalui ATM, mobile banking, atau
          internet banking {instruction.bank_code}. Pembayaran akan dikonfirmasi
          secara otomatis setelah dana diterima.
        </p>
      </div>
    </InstructionCard>
  );
}

// ─── Echannel (Mandiri) Layout ────────────────────────────────────────────────

function EchannelLayout({
  instruction,
  amount,
}: {
  instruction: Extract<MockInstruction, { type: "echannel" }>;
  amount: number;
}) {
  return (
    <InstructionCard>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-yellow border-2 border-foreground">
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5 text-warning" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-foreground">
            Mandiri Bill Payment
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Gunakan dua kode berikut di ATM / Livin&apos;
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-muted/40 rounded-xl p-4 border-2 border-foreground">
          <InfoRow
            label="Kode Perusahaan"
            value={instruction.company_code}
            copyable
            mono
            large
          />
        </div>
        <div className="bg-muted/40 rounded-xl p-4 border-2 border-foreground">
          <InfoRow
            label="Kode Bayar"
            value={instruction.bill_key}
            copyable
            mono
            large
          />
        </div>
      </div>

      <div className="pt-1">
        <InfoRow
          label="Total Pembayaran"
          value={formatRupiah(amount)}
          copyable
        />
      </div>

      <div className="bg-muted/50 rounded-xl p-4 border border-border/40">
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Buka ATM Mandiri, Livin&apos; by Mandiri, atau Mandiri Online. Pilih
          menu <strong>Bayar</strong> → <strong>Multi Payment</strong>. Masukkan
          Kode Perusahaan, lalu Kode Bayar.
        </p>
      </div>
    </InstructionCard>
  );
}

// ─── Cstore Layout ────────────────────────────────────────────────────────────

function CstoreLayout({
  instruction,
  amount,
}: {
  instruction: Extract<MockInstruction, { type: "cstore" }>;
  amount: number;
}) {
  const isAlfamart = instruction.store_name.toLowerCase().includes("alfa");
  return (
    <InstructionCard>
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border-2 border-foreground",
          isAlfamart ? "bg-accent-peach" : "bg-accent-soft-blue",
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-foreground">
            {instruction.store_name}
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Bayar di kasir {instruction.store_name} terdekat
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 divide-y-2 divide-dashed divide-border/40">
        <InfoRow
          label="Kode Pembayaran"
          value={instruction.payment_code}
          copyable
          mono
          large
        />
        <div className="pt-4">
          <InfoRow
            label="Total Pembayaran"
            value={formatRupiah(amount)}
            copyable
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 border border-border/40">
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Tunjukkan kode pembayaran di atas kepada kasir {instruction.store_name}.
          Simpan struk bukti pembayaran Anda.
        </p>
      </div>
    </InstructionCard>
  );
}

// ─── QR Layout (GoPay, ShopeePay, QRIS) ──────────────────────────────────────

function QRLayout({
  instruction,
  channel,
  amount,
}: {
  instruction: Extract<MockInstruction, { type: "qr" }>;
  channel: string;
  amount: number;
}) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobileDevice());
  }, []);

  const channelLabel =
    channel === "gopay"
      ? "GoPay"
      : channel === "shopeepay"
        ? "ShopeePay"
        : "QRIS";

  return (
    <InstructionCard>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green border-2 border-foreground">
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
          <QrCode className="w-5 h-5 text-success" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-foreground">
            {channelLabel}
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Scan QR dengan aplikasi e-wallet Anda
          </p>
        </div>
      </div>

      {/* QR Image */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-foreground overflow-hidden neo-shadow flex items-center justify-center bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={instruction.qr_string}
            alt={`QR Code ${channelLabel}`}
            className="w-full h-full object-contain p-2"
          />
        </div>
        <p className="font-body text-xs text-muted-foreground text-center">
          Buka aplikasi {channelLabel} dan scan kode QR di atas
        </p>

        {mobile && (
          <a
            href={instruction.deeplink_url}
            className={cn(
              "inline-flex items-center gap-2 px-5 h-10 rounded-full border-2 border-foreground text-sm font-body font-semibold neo-shadow neo-shadow-hover transition-all bg-primary text-primary-100",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Smartphone className="w-4 h-4" aria-hidden="true" />
            Buka Aplikasi {channelLabel}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      <div className="pt-1">
        <InfoRow
          label="Total Pembayaran"
          value={formatRupiah(amount)}
          copyable
        />
      </div>
    </InstructionCard>
  );
}

// ─── DANA Layout ──────────────────────────────────────────────────────────────

function DanaLayout({
  instruction,
  amount,
}: {
  instruction: Extract<MockInstruction, { type: "dana" }>;
  amount: number;
}) {
  return (
    <InstructionCard>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-soft-blue border-2 border-foreground">
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-info" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-foreground">DANA</p>
          <p className="font-body text-xs text-muted-foreground">
            Lanjutkan pembayaran di aplikasi DANA
          </p>
        </div>
      </div>

      <div>
        <InfoRow label="Total Pembayaran" value={formatRupiah(amount)} copyable />
      </div>

      <a
        href={instruction.deeplink_url}
        className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-full border-2 border-foreground bg-accent-soft-blue text-foreground text-sm font-body font-semibold neo-shadow neo-shadow-hover transition-all"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Smartphone className="w-4 h-4" aria-hidden="true" />
        Bayar dengan DANA
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </a>

      <div className="bg-muted/50 rounded-xl p-4 border border-border/40">
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Klik tombol di atas untuk membuka aplikasi DANA dan menyelesaikan
          pembayaran. Pastikan Anda sudah login dan saldo DANA mencukupi.
        </p>
      </div>
    </InstructionCard>
  );
}

// ─── OVO Layout ───────────────────────────────────────────────────────────────

function OVOLayout({ amount }: { amount: number }) {
  const [ovoSeconds, setOvoSeconds] = useState(60);
  const ovoExpired = ovoSeconds <= 0;

  useEffect(() => {
    if (ovoExpired) return;
    const id = setInterval(
      () => setOvoSeconds((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [ovoExpired]);

  return (
    <InstructionCard>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-purple border-2 border-foreground">
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-foreground">OVO</p>
          <p className="font-body text-xs text-muted-foreground">
            Konfirmasi pembayaran di aplikasi OVO
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-2">
        <div
          className={cn(
            "w-20 h-20 rounded-full border-2 border-foreground flex items-center justify-center transition-all",
            ovoExpired ? "bg-muted" : "bg-accent-purple neo-shadow",
          )}
        >
          <span
            className={cn(
              "font-heading font-black text-2xl tabular-nums",
              ovoExpired ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {ovoSeconds}
          </span>
        </div>
        <p className="font-body text-sm text-center text-foreground max-w-xs">
          {ovoExpired
            ? "Waktu konfirmasi habis. Hubungi tim RoboEdu jika sudah melakukan pembayaran."
            : "Periksa notifikasi push di aplikasi OVO Anda dan tekan Konfirmasi Bayar."}
        </p>
      </div>

      <div>
        <InfoRow label="Total Pembayaran" value={formatRupiah(amount)} copyable />
      </div>

      <div className="bg-muted/50 rounded-xl p-4 border border-border/40">
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          Notifikasi akan muncul di aplikasi OVO Anda dalam beberapa detik.
          Jika tidak muncul, buka aplikasi OVO dan periksa bagian{" "}
          <strong>Transaksi Tertunda</strong>.
        </p>
      </div>
    </InstructionCard>
  );
}

// ─── Credit Card (3DS) Layout ─────────────────────────────────────────────────

function CreditCardLayout({ amount }: { amount: number }) {
  return (
    <InstructionCard>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-butter border-2 border-foreground">
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-bold text-sm text-foreground">
            Kartu Kredit / Debit (3D Secure)
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Verifikasi 3DS akan dimuat di bawah
          </p>
        </div>
      </div>

      <div>
        <InfoRow label="Total Pembayaran" value={formatRupiah(amount)} copyable />
      </div>

      {/* 3DS iframe placeholder */}
      <div className="w-full min-h-56 rounded-xl border-2 border-dashed border-foreground bg-muted/30 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted border-2 border-foreground flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Area verifikasi 3D Secure akan muncul di sini saat backend Core API
          tersedia.
        </p>
        <span className="inline-block px-3 py-1 rounded-full bg-accent-yellow border border-foreground text-xs font-body font-semibold text-foreground">
          Placeholder UI
        </span>
      </div>
    </InstructionCard>
  );
}

// ─── Instruction Dispatcher ───────────────────────────────────────────────────

function PaymentInstructionLayout({
  channel,
  instruction,
  amount,
}: {
  channel: string;
  instruction: MockInstruction;
  amount: number;
}) {
  switch (instruction.type) {
    case "va":
      return <VALayout instruction={instruction} amount={amount} />;
    case "echannel":
      return <EchannelLayout instruction={instruction} amount={amount} />;
    case "cstore":
      return <CstoreLayout instruction={instruction} amount={amount} />;
    case "qr":
      return <QRLayout instruction={instruction} channel={channel} amount={amount} />;
    case "dana":
      return <DanaLayout instruction={instruction} amount={amount} />;
    case "ovo":
      return <OVOLayout amount={amount} />;
    case "credit_card":
      return <CreditCardLayout amount={amount} />;
    default:
      return null;
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 bg-card border-2 border-foreground px-5 py-3.5 rounded-2xl neo-shadow flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="p-1 rounded-full bg-accent-green border border-foreground">
        <Check className="w-4 h-4 text-foreground" aria-hidden="true" />
      </div>
      <span className="font-body font-bold text-sm text-foreground">{message}</span>
    </div>
  );
}

// ─── Change Method Modal ──────────────────────────────────────────────────────

interface ChangeMethodModalProps {
  isOpen: boolean;
  isRetrying: boolean;
  onClose: () => void;
  onConfirm: (selected: SelectedPayment) => void;
}

function ChangeMethodModal({
  isOpen,
  isRetrying,
  onClose,
  onConfirm,
}: ChangeMethodModalProps) {
  const [selected, setSelected] = useState<SelectedPayment | null>(null);

  // Reset selection every time modal opens
  useEffect(() => {
    if (isOpen) setSelected(null);
  }, [isOpen]);

  // Trap focus / close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ganti Metode Pembayaran"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 p-0"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel
          – Mobile: slides up from bottom, full width, capped at 90svh
          – Desktop: centred, capped at 36rem wide, capped at 85svh
          The inner body gets overflow-y-auto so the whole list is scrollable
          without clipping the dropdown inside its own scroll container.
      */}
      <div
        className={cn(
          "relative w-full sm:max-w-xl",
          "bg-card border-2 border-foreground",
          "rounded-t-3xl sm:rounded-2xl neo-shadow",
          "flex flex-col",
          "max-h-[90svh] sm:max-h-[85svh]",
          "animate-in fade-in slide-in-from-bottom-4 duration-200",
        )}
      >
        {/* Header — sticky */}
        <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4 border-b-2 border-foreground bg-muted/30 shrink-0 rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="font-heading font-black text-lg text-foreground">
              Ganti Metode Pembayaran
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-0.5">
              Pilih metode baru, lalu konfirmasi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="shrink-0 w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>

        {/* Body — grows with the in-flow expand list; overflow-y-auto kicks in at max-h */}
        <div className="overflow-y-auto px-6 py-2 pb-4">
          <CheckoutPaymentMethodSelector
            value={selected}
            onChange={setSelected}
            variant="expand"
          />
        </div>

        {/* Footer — sticky */}
        <div className="flex gap-3 px-6 py-5 border-t-2 border-border/40 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={isRetrying}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1 gap-2"
            disabled={!selected || isRetrying}
            onClick={() => {
              if (selected) onConfirm(selected);
            }}
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Memproses…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                Konfirmasi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentInstructionPage({
  transactionId,
  context = "order",
}: PaymentInstructionPageProps) {
  const router = useRouter();

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Retry / change-method state ─────────────────────────────────────────
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const retryIdempotencyKey = useRef(crypto.randomUUID());

  // ── Redirect target after PAID ──────────────────────────────────────────
  const successRedirect =
    context === "membership"
      ? "/profile/membership"
      : `/profile/orders/${transactionId}`;

  // ── Fetch payment info ──────────────────────────────────────────────────
  const fetchPaymentInfo = useCallback(async () => {
    // Order context polls the Core API payment endpoint (returns real
    // payment_instruction from Midtrans). Membership still uses payment-info
    // until its Core API migration is complete.
    const url =
      context === "membership"
        ? `/api/membership/payment-info/${transactionId}`
        : `/api/orders/${transactionId}/payment`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      // For membership context, 404 on this endpoint is expected until implemented
      // Fall back gracefully
      if (!res.ok) {
        if (res.status === 404 && context === "membership") {
          // Membership payment-info not yet wired — show generic pending UI
          setPageError(null);
          setIsLoading(false);
          return;
        }
        throw new Error(
          json.message ?? "Gagal memuat informasi pembayaran.",
        );
      }

      const { order, payment } = json.data as {
        order: OrderInfo;
        payment: PaymentInfo | null;
      };

      setOrderInfo(order);
      setPaymentInfo(payment);
      setIsLoading(false);

      // Redirect to right path if already NOT pending
      if (order.status !== "PENDING" || payment?.status === "PAID") {
        stopPolling();
        setTimeout(() => router.replace(successRedirect), 1500);
      } else if (
        payment?.status === "FAILED" ||
        payment?.status === "EXPIRED"
      ) {
        stopPolling();
      }
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
      setIsLoading(false);
    }
  }, [transactionId, context, router, successRedirect]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Polling ─────────────────────────────────────────────────────────────
  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  useEffect(() => {
    void fetchPaymentInfo();
    // Poll every 4 seconds
    pollingRef.current = setInterval(() => void fetchPaymentInfo(), 4000);
    return () => stopPolling();
  }, [fetchPaymentInfo]);

  // ── Manual check status ─────────────────────────────────────────────────
  async function handleCheckStatus() {
    setIsCheckingStatus(true);
    try {
      const res = await fetch(
        context === "order"
          ? `/api/orders/${transactionId}/payment/check`
          : `/api/membership/payment/check/${transactionId}`,
        { method: "POST" },
      );

      // Membership check endpoint doesn't exist yet — 404/405 means the
      // feature isn't wired. For order context the endpoint exists, so a
      // 404 means the order wasn't found (handled as a regular error below).
      if (
        context === "membership" &&
        (res.status === 404 || res.status === 405)
      ) {
        setToast("Fitur cek status belum tersedia.");
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        setToast(json.message ?? "Gagal cek status.");
        return;
      }

      // Re-fetch payment info to update the UI without a page reload.
      // The check endpoint syncs the DB, then this GET returns the fresh state.
      await fetchPaymentInfo();
      setToast("Status pembayaran diperbarui.");
    } catch {
      setToast("Gagal menghubungi server. Coba lagi.");
    } finally {
      setIsCheckingStatus(false);
    }
  }

  // ─── Handle retry / change method ──────────────────────────────────────
  const handleRetry = useCallback(
    async (selected: SelectedPayment) => {
      setIsRetrying(true);
      setShowMethodModal(false);
      try {
        // Route differs by context:
        //   order      → POST /api/orders/:id/payment/retry
        //   membership → POST /api/membership-purchases/:id/payment/retry
        const retryUrl =
          context === "membership"
            ? `/api/membership-purchases/${transactionId}/payment/retry`
            : `/api/orders/${transactionId}/payment/retry`;

        const res = await fetch(retryUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": retryIdempotencyKey.current,
          },
          body: JSON.stringify({
            paymentMethod: selected.method.method,
            paymentChannel: selected.method.channel,
            // Order retry uses "ovoPhone"; membership retry uses "payerPhoneNumber"
            ovoPhone:
              selected.method.channel === "ovo" ? selected.ovoPhone : undefined,
            payerPhoneNumber:
              selected.method.channel === "ovo" ? selected.ovoPhone : undefined,
          }),
        });

        const json = await res.json() as {
          success: boolean;
          code?: string;
          message?: string;
          // Order retry response
          data?: {
            payment?: PaymentInfo;
            // Membership retry response (flat under data)
            payment_instruction?: Record<string, unknown>;
            expiry_time?: string | null;
            status?: string;
            amount?: number;
          };
        };

        if (res.status === 409 && json.code === "ORDER_ALREADY_PAID") {
          setToast("Pesanan sudah dibayar.");
          setTimeout(() => router.replace(successRedirect), 1500);
          return;
        }

        if (!res.ok) {
          if (json.code === "MAX_ATTEMPTS_REACHED") {
            setMaxAttemptsReached(true);
            setToast("Batas percobaan pembayaran telah tercapai.");
            return;
          }
          throw new Error(json.message ?? "Gagal melakukan retry.");
        }

        // ── Normalise retry response into PaymentInfo shape ────────────────
        if (context === "membership" && json.data) {
          // Membership retry returns flat data (not nested under data.payment)
          const d = json.data;
          setPaymentInfo((prev) => ({
            status: (d.status ?? "PENDING") as PaymentInfo["status"],
            payment_type: selected.method.method,
            payment_channel: selected.method.channel,
            amount: d.amount ?? prev?.amount ?? 0,
            expiry_time: d.expiry_time ?? null,
            transaction_time: new Date().toISOString(),
            payment_instruction:
              d.payment_instruction ?? null,
          }));
        } else if (json.data?.payment) {
          setPaymentInfo(json.data.payment);
        }

        const newAttempts = retryAttempts + 1;
        setRetryAttempts(newAttempts);
        if (newAttempts >= 5) setMaxAttemptsReached(true);
        setToast("Metode pembayaran berhasil diubah.");

        // Restart polling now that payment is PENDING again
        stopPolling();
        pollingRef.current = setInterval(() => void fetchPaymentInfo(), 4000);
      } catch (err) {
        setToast(
          err instanceof Error ? err.message : "Gagal mengubah metode. Coba lagi.",
        );
      } finally {
        setIsRetrying(false);
        // Always rotate the idempotency key after each attempt
        retryIdempotencyKey.current = crypto.randomUUID();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, transactionId, retryAttempts, router, successRedirect],
  );

  // ─── Resolve payment_instruction ────────────────────────────────────────
  // Use backend instruction if available, otherwise mock by channel
  const channel = paymentInfo?.payment_channel ?? "bank_transfer";
  const instruction: MockInstruction =
    paymentInfo?.payment_instruction != null
      ? (paymentInfo.payment_instruction as unknown as MockInstruction)
      : getMockInstruction(channel);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="font-body text-sm">Memuat informasi pembayaran…</p>
        </div>
      </div>
    );
  }

  // ── Page error ───────────────────────────────────────────────────────────
  if (pageError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card border-2 border-foreground rounded-3xl neo-shadow p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-peach border-2 border-foreground flex items-center justify-center">
            <XCircle className="w-8 h-8 text-danger" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-heading font-black text-xl text-foreground">
              Tidak Dapat Dimuat
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              {pageError}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchPaymentInfo()}
            >
              Coba Lagi
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/profile/orders">Pesanan Saya</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const paymentStatus = (paymentInfo?.status ?? "PENDING") as PaymentStatus;
  const amount = paymentInfo?.amount ?? orderInfo?.total ?? 0;

  // ── Retry actions visibility ─────────────────────────────────────────────
  // "Ganti Metode" only on PENDING; "Coba Lagi" on FAILED / EXPIRED.
  // Both disappear once expiry_time has passed OR max 5 attempts reached.
  const orderExpired = paymentInfo?.expiry_time
    ? new Date(paymentInfo.expiry_time) < new Date()
    : false;
  const showRetryActions =
    context === "order" && !orderExpired && !maxAttemptsReached;

  // ── PAID state ───────────────────────────────────────────────────────────
  if (paymentStatus === "PAID" || orderInfo?.status === "PAID") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card border-2 border-foreground rounded-3xl neo-shadow p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-green border-2 border-foreground flex items-center justify-center animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-9 h-9 text-foreground" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-heading font-black text-xl text-foreground">
              Pembayaran Berhasil!
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-2">
              {context === "membership"
                ? "Selamat! Kamu sekarang menjadi Member RoboEdu Plus."
                : "Pesananmu sedang diproses. Mengalihkan ke detail pesanan…"}
            </p>
            <p className="font-heading font-bold text-primary text-xl mt-3">
              {formatRupiah(amount)}
            </p>
          </div>
          <Button variant="primary" size="sm" asChild>
            <Link href={successRedirect}>
              {context === "membership" ? "Lihat Membership" : "Lihat Pesanan"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── FAILED / EXPIRED state ───────────────────────────────────────────────
  if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
    const isExpired = paymentStatus === "EXPIRED";
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-card border-2 border-foreground rounded-3xl neo-shadow p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-peach border-2 border-foreground flex items-center justify-center">
              {isExpired ? (
                <AlertTriangle className="w-8 h-8 text-danger" aria-hidden="true" />
              ) : (
                <XCircle className="w-8 h-8 text-danger" aria-hidden="true" />
              )}
            </div>
            <div>
              <h1 className="font-heading font-black text-xl text-foreground">
                {isExpired ? "Pembayaran Kadaluarsa" : "Pembayaran Gagal"}
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-2">
                {isExpired
                  ? "Batas waktu pembayaran telah habis."
                  : "Pembayaran tidak berhasil. Silakan coba metode pembayaran lain."}
              </p>
            </div>

            {/* Max attempts message */}
            {maxAttemptsReached && (
              <div className="w-full flex items-start gap-2 bg-accent-peach/60 border-2 border-danger/30 rounded-xl px-4 py-3 text-left">
                <AlertTriangle
                  className="w-4 h-4 text-danger shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="font-body text-sm text-danger font-semibold">
                  Batas percobaan pembayaran telah tercapai.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              {/* "Coba Lagi" button — only when not expired and within attempts limit */}
              {showRetryActions && (
                <Button
                  variant="primary"
                  size="default"
                  className="w-full gap-2"
                  onClick={() => setShowMethodModal(true)}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Memproses…
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                      Coba Lagi
                    </>
                  )}
                </Button>
              )}

              <div className="flex gap-3 flex-wrap justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/orders">Riwayat Pesanan</Link>
                </Button>
                {!showRetryActions && (
                  <Button variant="primary" size="sm" asChild>
                    <Link href={context === "membership" ? "/membership" : "/product"}>
                      {context === "membership" ? "Ke Halaman Membership" : "Belanja Lagi"}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Change Method Modal — also needed here for "Coba Lagi" flow */}
        <ChangeMethodModal
          isOpen={showMethodModal}
          isRetrying={isRetrying}
          onClose={() => setShowMethodModal(false)}
          onConfirm={(selected) => void handleRetry(selected)}
        />

        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  // ── PENDING — main payment instruction UI ────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-36 sm:pt-40 lg:pt-44 pb-4">
          <div className="bg-card rounded-2xl p-4 sm:p-5 border-2 border-border flex flex-wrap items-center justify-between gap-4 neo-shadow">
            <div>
              <h1 className="font-heading font-black text-xl sm:text-2xl text-foreground tracking-tight">
                Selesaikan Pembayaran
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {context === "membership"
                  ? "Proses pembayaran Membership RoboEdu Plus"
                  : `Pesanan #${orderInfo?.order_number ?? "–"}`}
              </p>
            </div>
            <StatusBadge status={paymentStatus} />
          </div>
        </div>

        {/* Body */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 flex flex-col gap-5">

          {/* Amount + Countdown card */}
          <div className="bg-card border-2 border-foreground rounded-2xl neo-shadow overflow-hidden">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    Total Pembayaran
                  </p>
                  <p className="font-heading font-black text-3xl sm:text-4xl text-foreground">
                    {formatRupiah(amount)}
                  </p>
                </div>
                <StatusBadge status={paymentStatus} />
              </div>

              {paymentInfo?.expiry_time && (
                <div className="flex flex-col gap-1.5">
                  <p className="font-body text-xs text-muted-foreground">
                    Bayar sebelum:
                  </p>
                  <CountdownDisplay expiryTime={paymentInfo.expiry_time} />
                </div>
              )}
            </div>
          </div>

          {/* Payment instruction per channel */}
          <PaymentInstructionLayout
            channel={channel}
            instruction={instruction}
            amount={amount}
          />

          {/* Ganti Metode — only for order context, while retry is still allowed */}
          {showRetryActions && (
            <div className="bg-card border-2 border-foreground rounded-2xl neo-shadow overflow-hidden">
              <div className="p-5 flex flex-col gap-3">
                {maxAttemptsReached ? (
                  <div className="flex items-start gap-2 bg-accent-peach/60 border-2 border-danger/30 rounded-xl px-4 py-3">
                    <AlertTriangle
                      className="w-4 h-4 text-danger shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <p className="font-body text-sm text-danger font-semibold">
                      Batas percobaan pembayaran telah tercapai.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-body text-xs text-muted-foreground">
                      Ingin menggunakan metode pembayaran yang berbeda?
                    </p>
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full gap-2"
                      onClick={() => setShowMethodModal(true)}
                      disabled={isRetrying}
                      aria-label="Ganti metode pembayaran"
                    >
                      {isRetrying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          Memproses…
                        </>
                      ) : (
                        <>
                          <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
                          Ganti Metode Pembayaran
                        </>
                      )}
                    </Button>
                    {retryAttempts > 0 && (
                      <p className="font-body text-[11px] text-muted-foreground text-center">
                        Percobaan {retryAttempts} dari 5
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Check Status + Info */}
          <div className="bg-card border-2 border-foreground rounded-2xl neo-shadow overflow-hidden">
            <div className="p-5 flex flex-col gap-3">
              <p className="font-body text-xs text-muted-foreground">
                Sudah melakukan pembayaran? Klik tombol di bawah untuk memperbarui
                status pesanan.
              </p>
              <Button
                variant="primary"
                size="default"
                className="w-full gap-2"
                onClick={() => void handleCheckStatus()}
                disabled={isCheckingStatus}
                aria-label="Cek status pembayaran"
              >
                {isCheckingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                )}
                {isCheckingStatus ? "Memeriksa…" : "Cek Status Pembayaran"}
              </Button>

              <div className="flex items-start gap-2 pt-1">
                <ShoppingBag
                  className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Pembayaran akan dikonfirmasi otomatis. Halaman ini diperbarui
                  setiap beberapa detik.{" "}
                  {context === "order" && (
                    <Link
                      href={`/profile/orders/${transactionId}`}
                      className="text-primary underline underline-offset-2"
                    >
                      Lihat detail pesanan
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="flex justify-center pt-1">
            <Link
              href={context === "membership" ? "/membership" : "/profile/orders"}
              className="font-body text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              {context === "membership"
                ? "Kembali ke halaman Membership"
                : "Kembali ke riwayat pesanan"}
            </Link>
          </div>
        </div>
      </div>

      {/* Change Method Modal */}
      <ChangeMethodModal
        isOpen={showMethodModal}
        isRetrying={isRetrying}
        onClose={() => setShowMethodModal(false)}
        onConfirm={(selected) => void handleRetry(selected)}
      />

      {toast && (
        <Toast message={toast} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}

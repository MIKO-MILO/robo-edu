"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageState =
  | "loading"          // Mengambil snap token
  | "opening_snap"     // Snap token OK, membuka popup
  | "waiting_payment"  // Popup Midtrans sedang terbuka
  | "success"          // Pembayaran berhasil (PAID)
  | "pending"          // Pembayaran masih menunggu (PENDING — e.g. VA belum transfer)
  | "failed"           // Pembayaran gagal / expired
  | "cancelled"        // User menutup popup tanpa bayar
  | "error";           // Error teknis (network, token gagal, dll.)

interface OrderSummary {
  id: string;
  order_number: string;
  total: number;
  snap_token: string;
}

// ── Midtrans Snap global type ─────────────────────────────────────────────────
// midtrans-client exports its own `Snap` class that conflicts with the global
// window.snap object. We use a local interface to avoid the naming collision.

interface MidtransSnapWindow {
  pay: (
    token: string,
    options: {
      onSuccess: (result: Record<string, string>) => void;
      onPending: (result: Record<string, string>) => void;
      onError: (result: Record<string, string>) => void;
      onClose: () => void;
    },
  ) => void;
  hide: () => void;
}

// Helper to get snap with proper typing (avoids conflict with midtrans-client's Snap class)
function getWindowSnap(): MidtransSnapWindow | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).snap as MidtransSnapWindow | undefined;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Page component ────────────────────────────────────────────────────────────

interface PaymentPageProps {
  params: Promise<{ orderId: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = use(params);
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snapScriptLoaded, setSnapScriptLoaded] = useState(false);
  const snapOpenedRef = useRef(false);

  // ── Load Midtrans Snap.js ─────────────────────────────────────────────
  useEffect(() => {
    // Jangan load ulang kalau sudah ada
    if (document.getElementById("midtrans-snap-script")) {
      setSnapScriptLoaded(true);
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      setPageState("error");
      setErrorMessage("Konfigurasi pembayaran tidak lengkap. Hubungi tim RoboEdu.");
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap-script";
    script.src =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => setSnapScriptLoaded(true);
    script.onerror = () => {
      setPageState("error");
      setErrorMessage("Gagal memuat modul pembayaran. Periksa koneksi internet Anda.");
    };

    document.head.appendChild(script);
  }, []);

  // ── Fetch snap token dari API ─────────────────────────────────────────
  const fetchSnapToken = useCallback(async () => {
    setPageState("loading");
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/snap-token`);
      const json = await res.json();

      if (!res.ok) {
        // 409 = order sudah bukan PENDING (sudah dibayar / dibatalkan)
        if (res.status === 409) {
          const status = json.status as string | undefined;
          if (status === "PAID" || status === "PROCESSING" || status === "SHIPPED" ||
              status === "DELIVERED" || status === "COMPLETED") {
            setPageState("success");
          } else {
            setPageState("failed");
          }
          return;
        }
        throw new Error(json.message ?? "Gagal memuat informasi pembayaran.");
      }

      setOrder(json.data as OrderSummary);
      setPageState("opening_snap");
    } catch (err) {
      setPageState("error");
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    }
  }, [orderId]);

  useEffect(() => {
    void fetchSnapToken();
  }, [fetchSnapToken]);

  // ── Buka Snap popup saat token + script sudah siap ───────────────────
  useEffect(() => {
    if (
      pageState !== "opening_snap" ||
      !snapScriptLoaded ||
      !order?.snap_token ||
      snapOpenedRef.current
    ) return;

    if (!window.snap) {
      // Script mungkin belum sepenuhnya initialized — coba lagi sebentar
      const timer = setTimeout(() => {
        if (getWindowSnap()) {
          openSnap();
        } else {
          setPageState("error");
          setErrorMessage("Modul pembayaran gagal diinisialisasi. Refresh halaman dan coba lagi.");
        }
      }, 800);
      return () => clearTimeout(timer);
    }

    openSnap();

    function openSnap() {
      if (!order?.snap_token || snapOpenedRef.current) return;
      const snapInst = getWindowSnap();
      if (!snapInst) return;
      snapOpenedRef.current = true;
      setPageState("waiting_payment");

      snapInst.pay(order.snap_token, {
        onSuccess(result) {
          console.info("[Snap] Payment success:", result);
          setPageState("success");
        },
        onPending(result) {
          console.info("[Snap] Payment pending:", result);
          setPageState("pending");
        },
        onError(result) {
          console.error("[Snap] Payment error:", result);
          setPageState("failed");
        },
        onClose() {
          // User menutup popup tanpa menyelesaikan pembayaran
          snapOpenedRef.current = false;
          setPageState("cancelled");
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState, snapScriptLoaded, order?.snap_token]);

  // ── Auto-redirect saat sukses ─────────────────────────────────────────
  useEffect(() => {
    if (pageState !== "success") return;
    const timer = setTimeout(() => {
      router.replace(`/profile/orders/${orderId}`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [pageState, orderId, router]);

  // ── Re-open snap ──────────────────────────────────────────────────────
  function handleRetryOpen() {
    if (!order?.snap_token) {
      // Tidak ada token — fetch ulang
      snapOpenedRef.current = false;
      void fetchSnapToken();
      return;
    }
    snapOpenedRef.current = false;
    setPageState("opening_snap");
  }

  // ── UI ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center border-2 border-foreground neo-shadow-icon group-hover:scale-105 transition-transform">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <span className="font-heading font-black text-xl text-foreground tracking-tight">
          RoboEdu
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-card border-2 border-foreground rounded-3xl neo-shadow overflow-hidden">

        {/* ── LOADING ─────────────────────────────────────────────── */}
        {(pageState === "loading" || pageState === "opening_snap") && (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Menyiapkan Pembayaran
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1.5">
                Mohon tunggu, kami sedang membuka jendela pembayaran…
              </p>
            </div>
          </div>
        )}

        {/* ── WAITING (popup terbuka) ──────────────────────────────── */}
        {pageState === "waiting_payment" && (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-yellow border-2 border-foreground flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Jendela Pembayaran Terbuka
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1.5">
                Selesaikan pembayaran di jendela Midtrans yang sudah terbuka.
                Jangan tutup halaman ini.
              </p>
              {order && (
                <p className="font-heading font-bold text-primary text-lg mt-3">
                  {formatRupiah(order.total)}
                </p>
              )}
            </div>
            <p className="font-body text-xs text-muted-foreground">
              Nomor Pesanan:{" "}
              <span className="font-bold text-foreground font-mono">
                {order?.order_number}
              </span>
            </p>
          </div>
        )}

        {/* ── SUCCESS ─────────────────────────────────────────────── */}
        {pageState === "success" && (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-green border-2 border-foreground flex items-center justify-center animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="w-9 h-9 text-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Pembayaran Berhasil!
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1.5">
                Terima kasih! Pesananmu sedang diproses. Kamu akan dialihkan ke
                detail pesanan dalam beberapa detik…
              </p>
            </div>
            <Link href={`/profile/orders/${orderId}`}>
              <Button variant="primary" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Lihat Pesanan
              </Button>
            </Link>
          </div>
        )}

        {/* ── PENDING (e.g. VA / QRIS belum dibayar) ──────────────── */}
        {pageState === "pending" && (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-yellow border-2 border-foreground flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-foreground animate-spin" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Menunggu Pembayaran
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1.5">
                Instruksi pembayaran sudah dibuat. Selesaikan transfer sesuai
                batas waktu yang ditentukan.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link href={`/profile/orders/${orderId}`}>
                <Button variant="primary" size="sm" className="w-full gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Lihat Instruksi Pembayaran
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleRetryOpen}
              >
                <RefreshCw className="w-4 h-4" />
                Buka Kembali Jendela Bayar
              </Button>
            </div>
          </div>
        )}

        {/* ── CANCELLED (ditutup tanpa bayar) ─────────────────────── */}
        {pageState === "cancelled" && (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-foreground flex items-center justify-center">
              <XCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Pembayaran Ditutup
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1.5">
                Kamu menutup jendela pembayaran. Pesananmu masih tersimpan dan
                belum dibatalkan.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="primary"
                size="sm"
                className="w-full gap-2"
                onClick={handleRetryOpen}
              >
                <CreditCard className="w-4 h-4" />
                Lanjutkan Bayar
              </Button>
              <Link href="/profile/orders">
                <Button variant="outline" size="sm" className="w-full">
                  Kembali ke Riwayat Pesanan
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── FAILED ──────────────────────────────────────────────── */}
        {pageState === "failed" && (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-peach border-2 border-foreground flex items-center justify-center">
              <XCircle className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Pembayaran Gagal
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1.5">
                Transaksi tidak berhasil atau sudah kadaluarsa. Kamu dapat
                mencoba membayar ulang.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="primary"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  snapOpenedRef.current = false;
                  void fetchSnapToken();
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Coba Bayar Lagi
              </Button>
              <Link href="/profile/orders">
                <Button variant="outline" size="sm" className="w-full">
                  Kembali ke Riwayat Pesanan
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── ERROR (teknis) ───────────────────────────────────────── */}
        {pageState === "error" && (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-orange/30 border-2 border-foreground flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                Terjadi Kesalahan
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1.5">
                {errorMessage ?? "Gagal memuat halaman pembayaran. Silakan coba lagi."}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="primary"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  snapOpenedRef.current = false;
                  void fetchSnapToken();
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </Button>
              <Link href="/profile/orders">
                <Button variant="outline" size="sm" className="w-full">
                  Kembali ke Riwayat Pesanan
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Footer order info strip */}
        {order && pageState !== "loading" && pageState !== "opening_snap" && (
          <div className="border-t-2 border-foreground bg-muted/30 px-6 py-3 flex justify-between items-center text-xs font-body text-muted-foreground">
            <span>Pesanan {order.order_number}</span>
            <span className="font-bold text-foreground">{formatRupiah(order.total)}</span>
          </div>
        )}
      </div>

      <p className="mt-6 font-body text-xs text-muted-foreground text-center max-w-sm">
        Pembayaran diproses secara aman oleh Midtrans. RoboEdu tidak menyimpan
        data kartu atau akun pembayaranmu.
      </p>
    </div>
  );
}

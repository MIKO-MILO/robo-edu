import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { OrderTabValue } from "./order-status-tabs";

// ─────────────────────────────────────────────────────────────────────────────
// Config copy per tab — beda tab, beda pesan kosong.
// ─────────────────────────────────────────────────────────────────────────────
interface EmptyConfig {
  emoji: string;
  heading: string;
  subtext: string;
  showCta: boolean;
}

const EMPTY_CONFIG: Record<OrderTabValue, EmptyConfig> = {
  ALL: {
    emoji: "🤖",
    heading: "Belum Ada Pesanan",
    subtext: "Kamu belum pernah melakukan pemesanan. Yuk, mulai eksplorasi produk robot seru kami!",
    showCta: true,
  },
  PENDING: {
    emoji: "⏰",
    heading: "Tidak Ada Pesanan Menunggu Pembayaran",
    subtext: "Semua pesananmu sudah dibayar. Terima kasih!",
    showCta: false,
  },
  PROCESSING: {
    emoji: "⚙️",
    heading: "Tidak Ada Pesanan Diproses",
    subtext: "Belum ada pesanan yang sedang dipersiapkan saat ini.",
    showCta: false,
  },
  PAID: {
    emoji: "⚙️",
    heading: "Tidak Ada Pesanan Diproses",
    subtext: "Belum ada pesanan yang sedang dipersiapkan saat ini.",
    showCta: false,
  },
  SHIPPED: {
    emoji: "🚚",
    heading: "Tidak Ada Pesanan Dikirim",
    subtext: "Belum ada paket yang sedang dalam perjalanan.",
    showCta: false,
  },
  DELIVERED: {
    emoji: "📦",
    heading: "Tidak Ada Pesanan Tiba",
    subtext: "Belum ada paket yang baru tiba.",
    showCta: false,
  },
  COMPLETED: {
    emoji: "✅",
    heading: "Belum Ada Pesanan Selesai",
    subtext: "Pesanan yang sudah diterima dan dikonfirmasi akan muncul di sini.",
    showCta: true,
  },
  CANCELLED: {
    emoji: "🚫",
    heading: "Tidak Ada Pesanan Dibatalkan",
    subtext: "Bagus! Tidak ada pesanan yang dibatalkan.",
    showCta: false,
  },
  REFUNDED: {
    emoji: "↩️",
    heading: "Tidak Ada Pengembalian Dana",
    subtext: "Tidak ada pesanan yang sedang dalam proses refund.",
    showCta: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface OrderEmptyStateProps {
  activeTab: OrderTabValue;
}

export function OrderEmptyState({ activeTab }: OrderEmptyStateProps) {
  const config = EMPTY_CONFIG[activeTab] ?? EMPTY_CONFIG.ALL;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
      {/* Ilustrasi emoji dengan border neo-brutalism */}
      <div
        className="size-24 sm:size-28 rounded-3xl bg-accent-butter border-2 border-foreground neo-shadow
                   flex items-center justify-center text-5xl sm:text-6xl
                   select-none"
        aria-hidden="true"
      >
        {config.emoji}
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground">
          {config.heading}
        </h2>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          {config.subtext}
        </p>
      </div>

      {/* CTA — hanya tampil di tab yang relevan */}
      {config.showCta && (
        <Button variant="primary" size="default" neo asChild>
          <Link href="/products">Mulai Belanja</Link>
        </Button>
      )}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageOpen, ArrowRight, RotateCcw } from "lucide-react";
import { OrderTabKey } from "./order-status-tabs";

export interface OrderEmptyStateProps {
  activeTab: OrderTabKey;
  onResetFilter?: () => void;
}

const TAB_EMPTY_MESSAGES: Record<
  OrderTabKey,
  { title: string; description: string; icon: string }
> = {
  all: {
    title: "Belum Ada Riwayat Pesanan",
    description:
      "Kamu belum memiliki pesanan apa pun. Yuk temukan robot kit edukatif menarik untuk memulai petualangan sains & teknologimu!",
    icon: "📦",
  },
  processing: {
    title: "Tidak Ada Pesanan yang Diproses",
    description:
      "Saat ini tidak ada pesananmu yang sedang menunggu pembayaran atau dalam proses pengemasan.",
    icon: "⏳",
  },
  shipped: {
    title: "Tidak Ada Pesanan dalam Pengiriman",
    description:
      "Tidak ada paket yang sedang dalam perjalanan kurir saat ini.",
    icon: "🚚",
  },
  completed: {
    title: "Belum Ada Pesanan Selesai",
    description:
      "Semua pesanan yang telah selesai dan berhasil diterima akan tercatat di sini.",
    icon: "🎉",
  },
  cancelled: {
    title: "Tidak Ada Pesanan Dibatalkan",
    description:
      "Bagus! Kamu tidak memiliki transaksi yang dibatalkan atau direfund.",
    icon: "✨",
  },
};

export function OrderEmptyState({ activeTab, onResetFilter }: OrderEmptyStateProps) {
  const content = TAB_EMPTY_MESSAGES[activeTab] || TAB_EMPTY_MESSAGES.all;

  return (
    <div className="bg-card border-2 border-foreground rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center neo-shadow my-4 max-w-2xl mx-auto">
      {/* Icon Badge */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-accent-soft-blue border-2 border-foreground flex items-center justify-center text-4xl sm:text-5xl neo-shadow mb-6 animate-bounce">
        {content.icon}
      </div>

      {/* Title & Description */}
      <h3 className="font-heading font-bold text-xl sm:text-2xl text-foreground mb-2">
        {content.title}
      </h3>
      <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
        {content.description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {activeTab !== "all" && onResetFilter && (
          <Button
            variant="card"
            size="lg"
            onClick={onResetFilter}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            Lihat Semua Pesanan
          </Button>
        )}

        <Link href="/product" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <PackageOpen className="w-5 h-5" />
            <span>Mulai Belanja</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ShoppingBag, Layers, BarChart3, Users, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  bgColor: string;
}

const actions: QuickActionItem[] = [
  {
    title: "Tambah Produk",
    description: "Buat produk baru di katalog",
    href: "/admin/products/create",
    icon: <PlusCircle className="size-5" />,
    bgColor: "bg-accent-blue/40 text-primary-900",
  },
  {
    title: "Kelola Pesanan",
    description: "Cek & proses pesanan masuk",
    href: "/admin/orders",
    icon: <ShoppingBag className="size-5" />,
    bgColor: "bg-accent-yellow/50 text-secondary",
  },
  {
    title: "Kelola Pelanggan",
    description: "Data user & institusi",
    href: "/admin/customers",
    icon: <Users className="size-5" />,
    bgColor: "bg-accent-purple/40 text-[#2E1065]",
  },
  {
    title: "Kategori & Varian",
    description: "Atur kelompok produk",
    href: "/admin/categories",
    icon: <Layers className="size-5" />,
    bgColor: "bg-accent-green/40 text-[#1A472A]",
  },
  {
    title: "Laporan Penjualan",
    description: "Analisis grafik & omzet",
    href: "/admin/reports",
    icon: <BarChart3 className="size-5" />,
    bgColor: "bg-accent-orange/40 text-[#7C2D12]",
  },
  {
    title: "Voucher Promo",
    description: "Buat diskon & kupon",
    href: "/admin/vouchers",
    icon: <Ticket className="size-5" />,
    bgColor: "bg-accent-pink/40 text-[#831843]",
  },
];

export interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight">
          Aksi Cepat Admin
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">
          Pintasan navigasi utama
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className="group relative flex flex-col justify-between p-4 rounded-2xl border-2 border-border bg-card neo-shadow neo-shadow-hover transition-all duration-200"
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl border border-border neo-shadow-icon mb-3 transition-transform group-hover:scale-110",
                act.bgColor
              )}
            >
              {act.icon}
            </div>

            <div>
              <p className="font-body font-bold text-xs md:text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                {act.title}
              </p>
              <p className="font-body text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                {act.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { TrendingUp, Clock, BookOpen, Headphones, ArrowUpRight, Download, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenefitCardProps {
  number: number;
  badge: string;
  title: string;
  description: string;
  footer: string;
  footerIcon: React.ComponentType<{ className?: string }>;
  isLastItem?: boolean;
}

function BenefitCard({
  number,
  badge,
  title,
  description,
  footer,
  footerIcon: FooterIcon,
  isLastItem = false,
}: BenefitCardProps) {
  return (
    <div className="relative flex items-center justify-center w-full">
      <article
        className={cn(
          "relative flex flex-col items-center justify-between text-center w-full max-w-[280px]",
          "border border-[#1C6CAE]/30 rounded-[100px] px-6 py-10",
          "min-h-[420px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          "bg-gradient-to-b from-white via-sky-50/40 to-sky-100/30 dark:from-background dark:via-background dark:to-sky-950/20 shadow-md"
        )}
      >
        {/* Aksen Dekoratif Garis Kecil */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1C6CAE]/20 rounded-full" />

        {/* Nomor Bagian Atas */}
        <span className="text-xs font-bold text-[#1C6CAE] bg-sky-100 dark:bg-sky-950/60 px-3 py-1 rounded-full mb-2 mt-2">
          0{number}
        </span>

        {/* Konten Utama */}
        <div className="flex flex-col items-center gap-3 my-auto w-full">
          <p className="font-body font-extrabold text-[10px] sm:text-xs text-[#1C6CAE] uppercase tracking-widest bg-sky-100/60 dark:bg-sky-900/30 px-3 py-1 rounded-md">
            {badge}
          </p>

          <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground leading-snug">
            {title}
          </h3>

          <p className="font-body text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-[220px]">
            {description}
          </p>
        </div>

        {/* Footer Card */}
        <div className="w-full mt-6 pt-4 border-t border-[#1C6CAE]/20 flex items-center justify-between px-2">
          <span className="font-body font-bold text-xs text-[#1C6CAE] text-left">
            {footer}
          </span>
          <div className="w-7 h-7 bg-[#1C6CAE] rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <FooterIcon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </article>

      {/* Panah Penghubung Antar Kartu */}
      {!isLastItem && (
        <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center text-[#1C6CAE]">
          <ArrowRight className="w-6 h-6 stroke-[2.5] drop-shadow-sm" />
        </div>
      )}
    </div>
  );
}

const benefits: Omit<BenefitCardProps, "number">[] = [
  {
    badge: "Profit Tinggi",
    title: "Harga Spesial & Margin Menjanjikan",
    description:
      "Akses langsung ke harga grosir reseller di katalog produk kit robotika dan sparepart original, tanpa perantara distributor pihak ketiga.",
    footer: "Hemat s/d 35%",
    footerIcon: ArrowUpRight,
  },
  {
    badge: "Kuota Dijamin",
    title: "Prioritas Kuota Produksi",
    description:
      "Mengingat produk RoboEdu made-by-order dengan uji presisi, pesanan mitra reseller otomatis mendapatkan alokasi kapasitas produksi prioritas.",
    footer: "Lead Time Lebih Singkat",
    footerIcon: ExternalLink,
  },
  {
    badge: "Siap Jual",
    title: "Materi Pemasaran & Modul STEM",
    description:
      "Dapatkan aset foto resolusi tinggi, lembar panduan kurikulum STEM, dan spesifikasi teknis siap cetak untuk presentasi ke sekolah & instansi.",
    footer: "Brosur & Silabus Lengkap",
    footerIcon: Download,
  },
  {
    badge: "VIP Assistance",
    title: "Dukungan Teknis & Konsultasi VIP",
    description:
      "Akses jalur cepat WhatsApp ke tim teknisi RoboEdu untuk konsultasi kit lomba robotika, kustomisasi sensor, klaim garansi, dan penggantian sparepart.",
    footer: "Respon CS Khusus < 2 Jam",
    footerIcon: ShieldCheck,
  },
];

export function ResellerBenefitsSection() {
  return (
    <section
      id="keuntungan"
      className="w-full pt-16 sm:pt-24 pb-0 bg-background overflow-hidden flex flex-col justify-between"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 sm:gap-16 w-full">
        {/* Section Header: Judul di Kiri & Deskripsi di Kanan */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1C6CAE] tracking-tight leading-tight max-w-xl">
            4 Keuntungan Eksklusif Mitra Resmi
          </h2>

          <p className="font-body text-xs sm:text-sm text-muted-foreground max-w-md lg:text-right leading-relaxed">
            Kami merancang ekosistem RoboEdu agar reseller, sekolah vokasi,
            dan toko hobi dapat berkembang sehat dengan dukungan teknis
            menyeluruh.
          </p>
        </div>

        {/* Grid Kartu Oval Vertikal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center mb-20 justify-items-center">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              number={index + 1}
              badge={benefit.badge}
              title={benefit.title}
              description={benefit.description}
              footer={benefit.footer}
              footerIcon={benefit.footerIcon}
              isLastItem={index === benefits.length - 1}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
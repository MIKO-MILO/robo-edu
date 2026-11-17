"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenefitCardProps {
  number: number;
  badge: string;
  title: string;
  description: string;
  isLastItem?: boolean;
}

function BenefitCard({
  number,
  badge,
  title,
  description,
  isLastItem = false,
}: BenefitCardProps) {
  return (
    <div className="relative flex items-center justify-center w-full">
      <article
        className={cn(
          "relative flex flex-col items-center justify-center text-center w-full max-w-[280px]",
          "rounded-[96px] px-6 py-7 sm:py-8",
          "min-h-[380px] sm:min-h-[390px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5",
          "bg-gradient-to-b from-white via-sky-50/50 to-sky-100/40 dark:from-background dark:via-background dark:to-sky-950/20 shadow-md"
        )}
      >
        {/* Nomor Bagian Atas dengan warna #D5ECFA */}
        <span className="inline-flex items-center justify-center w-8 h-7 text-xs font-extrabold text-[#1C6CAE] bg-[#D5ECFA] dark:bg-sky-900/60 rounded-full shrink-0 mb-2.5">
          0{number}
        </span>

        {/* Konten Utama */}
        <div className="flex flex-col items-center w-full">
          {/* Badge dengan tambahan margin bawah (gap) */}
          <p className="font-body font-extrabold text-[10px] sm:text-xs text-[#1C6CAE] uppercase tracking-widest bg-sky-100/70 dark:bg-sky-900/40 px-3.5 py-0.5 rounded-full shrink-0 mb-2">
            {badge}
          </p>

          {/* Judul dengan Tinggi Tetap agar Garis & Deskripsi Sejajar Lurus */}
          <h3 className="font-heading font-bold text-base sm:text-lg text-foreground leading-snug h-[4rem] sm:h-[4.2rem] flex items-center justify-center px-1 mt-3">
            {title}
          </h3>

          {/* Aksen Dekoratif Garis Kecil */}
          <div className="w-12 h-1 bg-[#1C6CAE]/25 rounded-full mt-1.5 mb-3 shrink-0" />

          {/* Deskripsi (Rata dari atas, sejajar lurus di semua kartu) */}
          <p className="font-body text-xs sm:text-[13px] text-foreground/75 leading-relaxed max-w-[215px]">
            {description}
          </p>
        </div>
      </article>

      {/* Panah Penghubung Antar Kartu */}
      {!isLastItem && (
        <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center text-[#1C6CAE]/80">
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </div>
      )}
    </div>
  );
}

const benefits = [
  {
    badge: "Profit Tinggi",
    title: "Harga Spesial & Margin Menjanjikan",
    description:
      "Akses langsung ke harga grosir reseller di katalog produk kit robotika dan sparepart original, tanpa perantara distributor pihak ketiga.",
  },
  {
    badge: "Kuota Dijamin",
    title: "Prioritas Kuota Produksi",
    description:
      "Mengingat produk RoboEdu made-by-order dengan uji presisi, pesanan mitra reseller otomatis mendapatkan alokasi kapasitas produksi prioritas.",
  },
  {
    badge: "Siap Jual",
    title: "Materi Pemasaran & Modul STEM",
    description:
      "Dapatkan aset foto resolusi tinggi, lembar panduan kurikulum STEM, dan spesifikasi teknis siap cetak untuk presentasi ke sekolah & instansi.",
  },
  {
    badge: "VIP Assistance",
    title: "Dukungan Teknis & Konsultasi VIP",
    description:
      "Akses jalur cepat WhatsApp ke tim teknisi RoboEdu untuk konsultasi kit lomba robotika, kustomisasi sensor, klaim garansi, dan penggantian sparepart.",
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
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1C6CAE] tracking-tight leading-tight max-w-xl">
            4 Keuntungan Eksklusif Mitra Resmi
          </h3>

          <p className="font-body text-xs sm:text-sm text-muted-foreground max-w-md lg:text-right leading-relaxed">
            Kami merancang ekosistem RoboEdu agar reseller, sekolah vokasi,
            dan toko hobi dapat berkembang sehat dengan dukungan teknis
            menyeluruh.
          </p>
        </div>

        {/* Grid Kartu Oval Vertikal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-20 justify-items-center">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              number={index + 1}
              badge={benefit.badge}
              title={benefit.title}
              description={benefit.description}
              isLastItem={index === benefits.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Timer, Clock, CheckCircle2 } from "lucide-react";

interface StepCardProps {
  step: number;
  badgeLabel: string;
  title: string;
  description: string;
  footerText: string;
  footerIcon: React.ComponentType<{ className?: string }>;
  bgColorClass: string;
}

function StepCard({
  step,
  badgeLabel,
  title,
  description,
  footerText,
  footerIcon: FooterIcon,
  bgColorClass,
}: StepCardProps) {
  return (
    <div className="relative w-full flex flex-col h-full">
      {/* SVG Container untuk Pinggiran Bergerigi 4 Sisi (Stamp Edge) */}
      <div className="relative w-full h-full flex flex-col p-6 sm:p-8">
        
        {/* SVG Border Stamp 4-Sisi Background */}
        <svg
          className="absolute inset-0 w-full h-full drop-shadow-sm pointer-events-none z-0"
          viewBox="0 0 498 489"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Atas */}
          <path
            d="M34.9531 0.999023C34.9531 0.999023 41.686 11.0095 47.9531 10.499C53.6104 10.0382 58.9531 0.999023 58.9531 0.999023H82.4531C82.4531 0.999023 87.8389 9.66322 93.4531 10.499C100.311 11.52 108.453 0.999023 108.453 0.999023H133.953C133.953 0.999023 139.628 10.499 145.453 10.499C151.278 10.499 156.953 0.999023 156.953 0.999023H179.953C179.953 0.999023 187.347 10.6114 193.953 10.499C200.399 10.3894 207.453 0.999023 207.453 0.999023H231.453C231.453 0.999023 237.822 10.499 243.953 10.499C250.084 10.499 256.453 0.999023 256.453 0.999023H279.453C279.453 0.999023 284.852 9.58069 290.453 10.499C297.459 11.6477 305.953 0.999023 305.953 0.999023H327.953C327.953 0.999023 334.326 10.2743 340.453 10.499C346.895 10.7353 353.953 0.999023 353.953 0.999023H376.453C376.453 0.999023 384.924 11.4939 391.953 10.499C397.721 9.68273 403.453 0.999023 403.453 0.999023H426.453C426.453 0.999023 432.823 10.3838 438.953 10.499C445.24 10.6172 451.953 0.999023 451.953 0.999023H474.953L481.453 10.499L488.953 13.499V35.999H34.9531V0.999023Z"
            fill="currentColor"
            className={bgColorClass}
          />
          {/* Bawah */}
          <path
            d="M42.9531 488.999C42.9531 488.999 49.686 478.989 55.9531 479.499C61.6104 479.96 66.9531 488.999 66.9531 488.999H90.4531C90.4531 488.999 95.8389 480.335 101.453 479.499C108.311 478.478 116.453 488.999 116.453 488.999H141.953C141.953 488.999 147.628 479.499 153.453 479.499C159.278 479.499 164.953 488.999 164.953 488.999H187.953C187.953 488.999 195.347 479.387 201.953 479.499C208.399 479.609 215.453 488.999 215.453 488.999H239.453C239.453 488.999 245.822 479.499 251.953 479.499C258.084 479.499 264.453 488.999 264.453 488.999H287.453C287.453 488.999 292.852 480.417 298.453 479.499C305.459 478.35 313.953 488.999 313.953 488.999H335.953C335.953 488.999 342.326 479.724 348.453 479.499C354.895 479.263 361.953 488.999 361.953 488.999H384.453C384.453 488.999 392.924 478.504 399.953 479.499C405.721 480.315 411.453 488.999 411.453 488.999H434.453C434.453 488.999 440.823 479.614 446.953 479.499C453.24 479.381 459.953 488.999 459.953 488.999H482.953L489.453 479.499L496.953 476.499V453.999H42.9531V488.999Z"
            fill="currentColor"
            className={bgColorClass}
          />
          {/* Kanan */}
          <path
            d="M497.172 453.925C497.172 453.925 487.041 447.374 487.438 441.099C487.796 435.434 496.737 429.929 496.737 429.929L496.311 406.433C496.311 406.433 487.551 401.205 486.614 395.606C485.469 388.768 495.84 380.437 495.84 380.437L495.379 354.941C495.379 354.941 485.777 349.439 485.672 343.615C485.566 337.791 494.962 331.945 494.962 331.945L494.545 308.949C494.545 308.949 484.801 301.73 484.793 295.123C484.786 288.676 494.047 281.453 494.047 281.453L493.612 257.457C493.612 257.457 483.999 251.262 483.888 245.131C483.776 239.001 493.16 232.461 493.16 232.461L492.743 209.465C492.743 209.465 484.065 204.223 483.045 198.639C481.77 191.655 492.263 182.969 492.263 182.969L491.864 160.973C491.864 160.973 482.475 154.769 482.139 148.647C481.786 142.21 491.393 134.977 491.393 134.977L490.986 112.481C490.986 112.481 480.339 104.202 481.207 97.1555C481.918 91.3739 490.497 85.4853 490.497 85.4853L490.08 62.489C490.08 62.489 480.581 56.2904 480.355 50.1632C480.123 43.8796 489.618 36.9932 489.618 36.9932L489.201 13.997L479.585 7.67016L476.45 0.225734L453.954 0.63331L462.178 454.559L497.172 453.925Z"
            fill="currentColor"
            className={bgColorClass}
          />
          {/* Kiri */}
          <path
            d="M8.52344 488.582C8.52344 488.582 18.4061 481.192 17.778 474.485C17.2111 468.43 8.07307 462.863 8.07307 462.863L7.63208 437.68C7.63208 437.68 16.1939 431.757 16.9242 425.726C17.8164 418.359 7.14419 409.819 7.14419 409.819L6.66567 382.492C6.66567 382.492 16.0577 376.245 15.9484 370.003C15.8391 363.76 6.23407 357.845 6.23407 357.845L5.80246 333.198C5.80246 333.198 15.2746 325.107 15.0383 318.029C14.8077 311.124 5.28642 303.729 5.28642 303.729L4.83605 278.01C4.83605 278.01 14.2151 271.019 14.1 264.449C13.985 257.878 4.36692 251.22 4.36692 251.22L3.93531 226.573C3.93531 226.573 12.4144 220.637 13.2274 214.619C14.2444 207.091 3.43803 198.175 3.43803 198.175L3.02519 174.6C3.02519 174.6 12.1794 167.608 12.2892 161.038C12.4045 154.13 2.5373 146.738 2.5373 146.738L2.11508 122.626C2.11508 122.626 12.4494 113.366 11.3228 105.85C10.3984 99.6836 1.60841 93.6929 1.60841 93.6929L1.17681 69.0459C1.17681 69.0459 10.4406 62.0557 10.4408 55.4844C10.4409 48.7453 0.698292 41.7197 0.698292 41.7197L0.26669 17.0727L9.64326 9.94084L12.5021 1.85122L34.9986 1.45728L43.5181 487.969L8.52344 488.582Z"
            fill="currentColor"
            className={bgColorClass}
          />
          {/* Tengah (Isi Card) */}
          <rect
            x="34.9531"
            y="35.999"
            width="441"
            height="428"
            fill="currentColor"
            className={bgColorClass}
          />
        </svg>

        {/* Konten Utama Di Dalam Card */}
        <div className="relative z-10 flex flex-col gap-4 h-full p-2">
          {/* Top row: step number + badge */}
          <div className="flex items-center justify-between">
            {/* Step number badge */}
            <div
              className={cn(
                "w-10 h-10 rounded-xl border-2 border-[#1C6CAE] flex items-center justify-center shrink-0",
                step === 3 ? "bg-[#1C6CAE] text-white" : "bg-[#60B9F8]/30 text-[#1C6CAE]"
              )}
            >
              <span className="font-heading font-bold text-base">
                {step}
              </span>
            </div>

            {/* Status badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full border-2 border-[#1C6CAE] bg-white font-body font-bold text-[10px] sm:text-xs text-foreground tracking-wide">
              {badgeLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-foreground leading-snug">
            {title}
          </h3>

          {/* Description */}
          <p className="font-body text-xs sm:text-sm text-foreground/75 leading-relaxed">
            {description}
          </p>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-[#1C6CAE]/25 mt-auto pt-3" />

          {/* Footer */}
          <div className="flex items-center gap-2 pt-1">
            <FooterIcon className="w-4 h-4 text-[#1C6CAE] shrink-0" />
            <span className="font-body font-bold text-xs sm:text-sm text-[#1C6CAE]">
              {footerText}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export function ResellerStepsSection() {
  return (
    <section className="w-full pt-6 sm:pt-10 pb-16 sm:pb-24 bg-[#F3EFE4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 sm:gap-16">

        {/* Section Header (Judul Sejajar Lurus Dalam Satu Baris) */}
        <div className="flex flex-col items-center text-center gap-3 max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1C6CAE] leading-tight whitespace-nowrap">
            Alur Cepat 3 Langkah Menjadi Mitra
          </h2>

          <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Proses pendaftaran reseller RoboEdu dirancang simpel dan cepat —
            dari pengajuan hingga akun aktif hanya dalam 1–2 hari kerja.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Step 1 */}
          <StepCard
            step={1}
            badgeLabel="ONLINE FORM"
            title="Isi Formulir Pengajuan"
            description="Lengkapi data diri/pemohon, profil institusi atau toko, tautan media sosial/marketplace, serta estimasi volume pengadaan bulanan di halaman pengajuan. Pendaftaran gratis dan pembayaran pertama dilakukan setelah akun disetujui saat melakukan pemesanan awal."
            footerText="Estimasi pengisian: ~3 Menit"
            footerIcon={Timer}
            bgColorClass="text-white"
          />

          {/* Step 2 */}
          <StepCard
            step={2}
            badgeLabel="PROSES REVIEW"
            title="Verifikasi & Review Admin"
            description="Tim operasional RoboEdu meninjau pengajuan dalam 1–2 hari kerja via verifikasi kelayakan dokumen atau konfirmasi cepat via nomor WhatsApp aktif Anda."
            footerText="Waktu respon: 1–2 Hari Kerja"
            footerIcon={Clock}
            bgColorClass="text-white"
          />

          {/* Step 3 */}
          <StepCard
            step={3}
            badgeLabel="SIAP TRANSAKSI"
            title="Akun Aktif & Mulai Belanja"
            description="Begitu status menjadi APPROVED, tier harga reseller otomatis terkunci dan tampil di seluruh katalog produk, keranjang belanja, hingga checkout!"
            footerText="Harga Reseller Langsung Terbuka"
            footerIcon={CheckCircle2}
            bgColorClass="text-white"
          />
        </div>
      </div>
    </section>
  );
}
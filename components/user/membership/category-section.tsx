"use client";

import Link from "next/link";
import { Store, GraduationCap, CheckCircle2 } from "lucide-react";

export function ResellerCategorySection() {
  return (
    <section className="relative w-full bg-primary overflow-hidden">
      {/* ── Top Scalloped Curves ── */}
      <div className="w-full -mb-1 leading-none overflow-hidden relative z-20">
        <svg
          viewBox="0 0 1440 70"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          {/* Garis Lengkungan Warna membership-blue-mid */}
          <path
            d="M0,58 
               C55,18 150,18 205,58 
               C250,25 320,25 365,58 
               C430,8 560,8 625,58 
               C670,22 730,22 775,58 
               C820,30 890,30 935,58 
               C1010,5 1170,5 1245,58 
               C1295,20 1385,20 1440,58"
            fill="none"
            stroke="var(--color-membership-blue-mid)"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area Lengkungan Atas Warna Background */}
          <path
            d="M0,48 
               C55,8 150,8 205,48 
               C250,15 320,15 365,48 
               C430,-2 560,-2 625,48 
               C670,12 730,12 775,48 
               C820,20 890,20 935,48 
               C1010,-5 1170,-5 1245,48 
               C1295,10 1385,10 1440,48 
               L1440,0 L0,0 Z"
            fill="var(--background)"
          />
        </svg>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col gap-12">

        {/* Section Header - Center Layout */}
        <div className="flex flex-col items-center text-center gap-2 max-w-4xl mx-auto w-full">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mt-10">
            Kategori & Syarat Kemitraan
          </h2>

          <p className="font-body font-normal text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl mb-10">
            RoboEdu membuka peluang bagi berbagai skala mitra edukasi. Kami membagi pemohon ke dalam dua profil utama dengan persyaratan administrasi yang simpel dan transparan.
          </p>
        </div>

        {/* Two Category Cards (Lebar container grid diperbesar sedikit ke samping) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto w-full">

          {/* Card A: Toko & Individu */}
          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-3xl p-8 sm:p-10 flex flex-col gap-6 shadow-xl hover:bg-white/15 transition-all w-full">
            <div className="flex flex-col gap-6">
              {/* Header Top Row (Angka Besar + Teks Sesuai Gambar) */}
              <div className="flex items-center gap-4">
                <span className="font-heading font-black text-4xl sm:text-5xl text-accent-pale-yellow/80 tracking-tight shrink-0">
                  01
                </span>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-[10px] sm:text-xs text-accent-pale-yellow tracking-wider uppercase drop-shadow-sm">
                    Kategori A
                  </span>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-white leading-snug">
                    Toko & Individu Kreatif
                  </h3>
                </div>
              </div>

              <p className="font-body font-normal text-xs sm:text-sm text-white/80 leading-relaxed">
                Dirancang untuk hobby shop, pengajar privat, kreator edukasi, maupun reseller e-commerce.
              </p>

              {/* Requirements List */}
              <div className="flex flex-col gap-3">
                {[
                  "Memiliki toko fisik, gerai marketplace aktif (Tokopedia/Shopee), atau kanal Instagram/TikTok hobi.",
                  "Komitmen awal pemesanan fleksibel (mulai dari paket uji coba <10 unit hingga rutin bulanan).",
                  "Menjaga reputasi layanan dan ketersediaan stok sparepart cadangan bagi pembeli akhir.",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-sm shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-accent-pale-yellow shrink-0 drop-shadow-sm" />
                    <span className="font-body text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card B: Institusi & Komunitas */}
          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-3xl p-8 sm:p-10 flex flex-col gap-6 shadow-xl hover:bg-white/15 transition-all w-full">
            <div className="flex flex-col gap-6">
              {/* Header Top Row (Angka Besar + Teks Sesuai Gambar) */}
              <div className="flex items-center gap-4">
                <span className="font-heading font-black text-4xl sm:text-5xl text-accent-pale-yellow/80 tracking-tight shrink-0">
                  02
                </span>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-[10px] sm:text-xs text-accent-pale-yellow tracking-wider uppercase drop-shadow-sm">
                    Kategori B
                  </span>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-white leading-snug">
                    Institusi & Komunitas
                  </h3>
                </div>
              </div>

              <p className="font-body font-normal text-xs sm:text-sm text-white/80 leading-relaxed">
                Dikhususkan bagi Sekolah SD/SMP/SMA/SMK, LPK robotika, universitas, dan komunitas pendidikan.
              </p>

              {/* Requirements List */}
              <div className="flex flex-col gap-3">
                {[
                  "Memiliki badan hukum, SK yayasan, surat penunjukan ekskul, atau nomor pokok sekolah nasional (NPSN).",
                  "Proyeksi serapan kurikulum kelas berulang (10–50+ unit per semester/tahun ajaran).",
                  "Berhak mendapatkan pelatihan Train-the-Trainer untuk guru pembina robotika RoboEdu.",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-sm shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-accent-pale-yellow shrink-0 drop-shadow-sm" />
                    <span className="font-body text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom Scalloped Curves ── */}
      <div className="w-full -mt-1 leading-none overflow-hidden relative z-20">
        <svg
          viewBox="0 0 1440 70"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          {/* Garis Lengkungan Warna membership-blue-mid */}
          <path
            d="M0,60 
               C55,15 150,15 205,60 
               C250,25 320,25 365,60 
               C430,10 560,10 625,60 
               C670,22 730,22 775,60 
               C820,30 890,30 935,60 
               C1010,8 1170,8 1245,60 
               C1295,20 1385,20 1440,60"
            fill="none"
            stroke="var(--color-membership-blue-mid)"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area Utama Lengkungan Bawah (Putih/Background) */}
          <path
            d="M0,68 
               C55,23 150,23 205,68 
               C250,33 320,33 365,68 
               C430,18 560,18 625,68 
               C670,30 730,30 775,68 
               C820,38 890,38 935,68 
               C1010,16 1170,16 1245,68 
               C1295,28 1385,28 1440,68 
               L1440,70 L0,70 Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  );
}
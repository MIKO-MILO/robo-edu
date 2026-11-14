"use client";

import Link from "next/link";
import { Store, GraduationCap, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export function ResellerCategorySection() {
  return (
    <section className="relative w-full bg-[#2483D0] overflow-hidden">
      {/* ── Top Scalloped Curves ── */}
      <div className="w-full -mb-1 leading-none overflow-hidden relative z-20">
        <svg
          viewBox="0 0 1440 70"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          {/* Garis Biru Muda (#97CEF9) Dibuat Lebih Tebal (strokeWidth 28) */}
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
            stroke="#97CEF9"
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
        <div className="flex flex-col items-center text-center gap-1 max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mt-10">
            Kategori &amp; Syarat Kemitraan
          </h2>

          {/* Aksen SVG Dekoratif di Bawah Judul */}
          <div className="w-60 sm:w-80 lg:w-[26rem] h-auto mt-1 mb-6 translate-x-6 sm:translate-x-12">
            <svg
              viewBox="0 0 134 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto drop-shadow-sm"
            >
              <path
                d="M89 0.8C97.16 0.5 128.89 -0.8 131.95 0.5C135.5 2.0 132.99 2.8 95.5 3.8C70.04 4.5 0 9.5 0 9.5C0 9.5 54.15 2.2 89 0.8Z"
                fill="#FEF08A"
              />
            </svg>
          </div>

          <p className="font-body text-sm sm:text-base text-white/90 leading-relaxed mb-8">
            RoboEdu membuka peluang bagi berbagai skala mitra edukasi. Kami membagi pemohon ke dalam dua profil utama dengan persyaratan administrasi yang simpel dan transparan.
          </p>
        </div>

        {/* Two Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* Card A: Toko & Individu */}
          <div className="bg-white/15 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between gap-6 shadow-xl hover:bg-white/20 transition-all">
            <div className="flex flex-col gap-6">
              {/* Header Top Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center shrink-0 text-[#2483D0] shadow-md">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-xs text-[#FEF08A] tracking-wider uppercase drop-shadow-sm">
                      Kategori A
                    </span>
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-white leading-snug">
                      Toko &amp; Individu Kreatif
                    </h3>
                  </div>
                </div>
                <span className="font-heading font-extrabold text-3xl text-[#FEF08A]/60">
                  01
                </span>
              </div>

              <p className="font-body text-xs sm:text-sm text-white/90 leading-relaxed">
                Dirancang untuk hobby shop, pengajar privat, kreator edukasi, maupun reseller e-commerce.
              </p>

              {/* Requirements List */}
              <div className="flex flex-col gap-3">
                {[
                  "Memiliki toko fisik, gerai marketplace aktif (Tokopedia/Shopee), atau kanal Instagram/TikTok hobi.",
                  "Komitmen awal pemesanan fleksibel (mulai dari paket uji coba <10 unit hingga rutin bulanan).",
                  "Menjaga reputasi layanan dan ketersediaan stok sparepart cadangan bagi pembeli akhir.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#FEF08A] shrink-0 mt-0.5 drop-shadow-sm" />
                    <span className="font-body text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card B: Institusi & Komunitas */}
          <div className="bg-white/15 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between gap-6 shadow-xl hover:bg-white/20 transition-all">
            <div className="flex flex-col gap-6">
              {/* Header Top Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center shrink-0 text-[#2483D0] shadow-md">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-xs text-[#FEF08A] tracking-wider uppercase drop-shadow-sm">
                      Kategori B
                    </span>
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-white leading-snug">
                      Institusi &amp; Komunitas
                    </h3>
                  </div>
                </div>
                <span className="font-heading font-extrabold text-3xl text-[#FEF08A]/60">
                  02
                </span>
              </div>

              <p className="font-body text-xs sm:text-sm text-white/90 leading-relaxed">
                Dikhususkan bagi Sekolah SD/SMP/SMA/SMK, LPK robotika, universitas, dan komunitas pendidikan.
              </p>

              {/* Requirements List */}
              <div className="flex flex-col gap-3">
                {[
                  "Memiliki badan hukum, SK yayasan, surat penunjukan ekskul, atau nomor pokok sekolah nasional (NPSN).",
                  "Proyeksi serapan kurikulum kelas berulang (10–50+ unit per semester/tahun ajaran).",
                  "Berhak mendapatkan pelatihan Train-the-Trainer untuk guru pembina robotika RoboEdu.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#FEF08A] shrink-0 mt-0.5 drop-shadow-sm" />
                    <span className="font-body text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* MAP Policy Banner */}
        <div className="bg-white/15 mb-10 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] flex items-center justify-center shrink-0 text-[#2483D0] shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-base sm:text-lg text-white leading-snug">
                Standar Etika Harga RoboEdu (MAP Policy)
              </p>
              <p className="font-body text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
                Seluruh mitra wajib mematuhi batas harga jual minimum eceran resmi demi melindungi margin bersama di ekosistem edukasi.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 shrink-0 bg-[#FEF08A] text-[#2483D0] hover:bg-[#fde047] font-heading font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-colors shadow-md"
          >
            DAFTAR SEKARANG
            <ArrowRight className="w-4 h-4" />
          </Link>
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
          {/* Garis Biru Muda (#97CEF9) Dibuat Lebih Tebal (strokeWidth 28) */}
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
            stroke="#97CEF9"
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
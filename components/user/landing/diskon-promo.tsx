"use client";

import { useState } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";

const PROMOS = [
  {
    id: 1,
    kode: "MERDEKA24",
    nama: "Diskon Kemerdekaan",
    tipeDiskon: "PROMO TERBATAS",
    nilaiDiskon: "Diskon 20%",
    minPembelian: "Min. Rp 150rb",
    maxDiskon: "Maks. Rp 50rb",
    tanggalBerakhir: "31 Agt 2026",
    bgColor: "bg-[#E8808C]", // Pink Soft sesuai gambar
    imgUrl: "images/product.webp",
    imagePosition: "right", // Gambar di Kanan, Teks di Kiri
  },
  {
    id: 2,
    nama: "Spesial Robotik Anak",
    kode: "AUTO_APPLIED",
    tipeDiskon: "DISKON OTOMATIS",
    nilaiDiskon: "Potongan Rp 75rb",
    minPembelian: "Min. Rp 300rb",
    maxDiskon: null,
    tanggalBerakhir: "15 Jul 2026",
    bgColor: "bg-[#6AA2B8]", // Biru Soft sesuai gambar
    imgUrl: "images/product2.webp",
    imagePosition: "left", // Gambar di Kiri, Teks di Kanan
  },
];

export default function DiskonPromo() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (kode: string) => {
    navigator.clipboard.writeText(kode);
    setCopiedCode(kode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="bg-[#F3EFE4] py-10 px-4 font-sans flex flex-col items-center mb-5 mt-5">
      {/* SVG ClipPath Gelombang Scallop Lebih Halus (Lengkungan Lebih Tipis) */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id="scalloped-card-subtle" clipPathUnits="objectBoundingBox">
            <path d="
              M 0.08, 0 
              Q 0.12, 0.015 0.16, 0 Q 0.20, -0.015 0.24, 0 Q 0.28, 0.015 0.32, 0 Q 0.36, -0.015 0.40, 0 
              Q 0.44, 0.015 0.48, 0 Q 0.52, -0.015 0.56, 0 Q 0.60, 0.015 0.64, 0 Q 0.68, -0.015 0.72, 0 
              Q 0.76, 0.015 0.80, 0 Q 0.84, -0.015 0.88, 0 Q 0.92, 0.015 0.96, 0 Q 1, 0 1, 0.08
              Q 0.985, 0.12 1, 0.16 Q 1.015, 0.20 1, 0.24 Q 0.985, 0.28 1, 0.32 Q 1.015, 0.36 1, 0.40
              Q 0.985, 0.44 1, 0.48 Q 1.015, 0.52 1, 0.56 Q 0.985, 0.60 1, 0.64 Q 1.015, 0.68 1, 0.72
              Q 0.985, 0.76 1, 0.80 Q 1.015, 0.84 1, 0.88 Q 0.985, 0.92 1, 0.96 Q 1, 1 0.92, 1
              Q 0.88, 0.985 0.84, 1 Q 0.80, 1.015 0.76, 1 Q 0.72, 0.985 0.68, 1 Q 0.64, 1.015 0.60, 1
              Q 0.56, 0.985 0.52, 1 Q 0.48, 1.015 0.44, 1 Q 0.40, 0.985 0.36, 1 Q 0.32, 1.015 0.28, 1
              Q 0.24, 0.985 0.20, 1 Q 0.16, 1.015 0.12, 1 Q 0.08, 0.985 0.04, 1 Q 0, 1 0, 0.92
              Q 0.015, 0.88 0, 0.84 Q -0.015, 0.80 0, 0.76 Q 0.015, 0.72 0, 0.68 Q -0.015, 0.64 0, 0.60
              Q 0.015, 0.56 0, 0.52 Q -0.015, 0.48 0, 0.44 Q 0.015, 0.40 0, 0.36 Q -0.015, 0.32 0, 0.28
              Q 0.015, 0.24 0, 0.20 Q -0.015, 0.16 0, 0.12 Q 0.015, 0.08 0, 0.04 Q 0, 0 0.08, 0 Z
            " />
          </clipPath>
        </defs>
      </svg>

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PROMOS.map((promo) => (
            <div
              key={promo.id}
              className="relative transition-transform duration-300 hover:scale-[1.01]"
            >
              <div
                className={`${promo.bgColor} text-white p-6 sm:p-8 flex items-center justify-between gap-4 min-h-[280px] shadow-xl relative group overflow-hidden ${
                  promo.imagePosition === "right" ? "flex-row" : "flex-row-reverse"
                }`}
                style={{ clipPath: "url(#scalloped-card-subtle)" }}
              >
                {/* ISI TEKS & INFORMASI */}
                <div className="w-1/2 flex flex-col justify-between items-start text-left z-10">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-wider block mb-1">
                      {promo.tipeDiskon}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                      {promo.nama}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-200 mt-1">
                      {promo.nilaiDiskon}
                    </p>

                    <p className="text-[11px] sm:text-xs text-white/90 font-medium mt-1.5 leading-snug">
                      {promo.minPembelian} {promo.maxDiskon ? `• ${promo.maxDiskon}` : ""}<br />
                      <span className="text-white/80">• s/d {promo.tanggalBerakhir}</span>
                    </p>
                  </div>

                  {/* TOMBOL AKSI */}
                  <div className="mt-4 w-full">
                    {promo.kode !== "AUTO_APPLIED" ? (
                      <button
                        onClick={() => handleCopy(promo.kode)}
                        className="w-full sm:w-auto border-2 border-white/90 text-white hover:bg-white hover:text-stone-900 px-5 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-md"
                      >
                        {copiedCode === promo.kode ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300 group-hover:text-emerald-600" />
                            <span>TERSALIN!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>KODE: {promo.kode}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button className="w-full sm:w-auto border-2 border-white/90 text-white hover:bg-white hover:text-stone-900 px-5 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-md">
                        <span>GUNAKAN DISKON</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* GAMBAR PRODUK - LEBIH BESAR */}
                <div className="w-1/2 h-44 sm:h-56 relative flex items-center justify-center shrink-0">
                  <img
                    src={promo.imgUrl}
                    alt={promo.nama}
                    className="w-full h-full object-contain filter drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
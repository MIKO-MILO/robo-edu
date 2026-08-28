"use client";

import { Tag, Clock, Gift, ArrowRight, Sparkles } from "lucide-react";

export default function DiskonPromo() {
  return (
    <section className="relative bg-[#F1ECE0] py-12 sm:py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-gradient-to-r from-[#FF7E5F] via-[#FEB47B] to-[#F5C045] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          {/* Background Decorative Element */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Promo Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm font-extrabold backdrop-blur-md uppercase tracking-wider">
                <Tag className="w-4 h-4 text-[#FFF6A0]" />
                <span>Promo Spesial Liburan Sekolah</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Diskon Hingga <span className="text-[#FFF6A0] underline underline-offset-4">35% OFF</span> + Gratis Ongkir!
              </h2>

              <p className="font-body text-sm sm:text-base text-white/90 max-w-xl">
                Dapatkan bonus eksklusif Buku Panduan Proyek Robotik 50 Halaman & Sticker Maskot lucu setiap pembelian Kit RoboEdu hari ini.
              </p>

              {/* Promo Benefits */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm">
                  <Gift className="w-4 h-4 text-[#FFF6A0]" />
                  <span>Free Bonus E-Book Proyek</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#FFF6A0]" />
                  <span>Garansi Tukar Baru 30 Hari</span>
                </div>
              </div>
            </div>

            {/* Countdown & Action Box */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
              <div className="bg-white/95 text-[#3D2900] p-6 rounded-2xl shadow-lg w-full max-w-sm text-center border border-white/40">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 mb-3">
                  <Clock className="w-4 h-4 text-[#FF7E5F]" />
                  <span>BERAKHIR DALAM</span>
                </div>

                {/* Timer Display */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="bg-[#F7F5F0] p-2 rounded-xl text-center">
                    <span className="font-mono text-2xl font-black text-[#18598D]">02</span>
                    <span className="block text-[10px] text-gray-500 font-semibold uppercase">Hari</span>
                  </div>
                  <div className="bg-[#F7F5F0] p-2 rounded-xl text-center">
                    <span className="font-mono text-2xl font-black text-[#18598D]">14</span>
                    <span className="block text-[10px] text-gray-500 font-semibold uppercase">Jam</span>
                  </div>
                  <div className="bg-[#F7F5F0] p-2 rounded-xl text-center">
                    <span className="font-mono text-2xl font-black text-[#18598D]">45</span>
                    <span className="block text-[10px] text-gray-500 font-semibold uppercase">Menit</span>
                  </div>
                </div>

                {/* Claim Voucher Button */}
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#18598D] hover:bg-[#134670] text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:scale-[1.02] transition-all cursor-pointer text-sm"
                >
                  <span>Klaim Kode Promo Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

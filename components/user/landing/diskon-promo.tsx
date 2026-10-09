"use client";

import { useState } from"react";
import { Copy, Check, ArrowRight } from"lucide-react";

const PROMOS = [
 {
 id: 1,
 kode:"MERDEKA24",
 nama:"Diskon Kemerdekaan",
 tipeDiskon:"PROMO TERBATAS",
 nilaiDiskon:"Diskon 20%",
 minPembelian:"Min. Rp 150rb",
 maxDiskon:"Maks. Rp 50rb",
 tanggalBerakhir:"31 Agt 2026",
 bgColor:"bg-[#E8808C]", // Pink Soft (TIDAK DIUBAH SAMA SEKALI)
 imgUrl:"images/product.webp",
 },
 {
 id: 2,
 nama:"Spesial Robotik Anak",
 kode:"AUTO_APPLIED",
 tipeDiskon:"DISKON OTOMATIS",
 nilaiDiskon:"Potongan Rp 75rb",
 minPembelian:"Min. Rp 300rb",
 maxDiskon: null,
 tanggalBerakhir:"15 Jul 2026",
 bgColor:"bg-[#6AA2B8]", // Biru Soft
 imgUrl:"images/product2.webp"
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
 <section className="bg-background py-10 px-4 font-sans flex flex-col items-center mb-5 mt-5">
 <div className="max-w-6xl mx-auto w-full">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
 {PROMOS.map((promo) => {
 // Jika Card Pink (id: 1)
 if (promo.id === 1) {
 return (
 <div key={promo.id} className="relative transition-transform duration-300 hover:scale-[1.01] h-full flex">
 <div className={`${promo.bgColor} text-white p-6 sm:p-6 lg:p-8 flex flex-col sm:flex-row-reverse items-center justify-center sm:gap-6 lg:gap-10 rounded-2xl relative group overflow-hidden w-full h-full`}>
 <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
 <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
 <line x1="-50" y1="350" x2="350" y2="-50" stroke="white" strokeWidth="20" />
 <line x1="50" y1="350" x2="450" y2="-50" stroke="white" strokeWidth="20" />
 <line x1="150" y1="350" x2="550" y2="-50" stroke="white" strokeWidth="20" />
 </svg>
 </div>
 <div className="w-full sm:w-[55%] flex flex-col justify-between items-start text-left z-15 h-full order-2 sm:order-none">
 <div>
 <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-wider block mb-1">{promo.tipeDiskon}</span>
 <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">{promo.nama}</h3>
 <p className="text-2xl sm:text-3xl font-extrabold text-amber-200 mt-1">{promo.nilaiDiskon}</p>
 <p className="text-[11px] sm:text-xs text-white/90 font-medium mt-1.5 leading-snug">
 {promo.minPembelian} {promo.maxDiskon ? `• ${promo.maxDiskon}` :""}<br />
 <span className="text-white/80">• s/d {promo.tanggalBerakhir}</span>
 </p>
 </div>
 <div className="mt-4 w-full z-20">
 <button onClick={() => handleCopy(promo.kode)} className="w-full sm:w-auto border-2 border-white/90 text-white hover:bg-white hover:text-stone-900 px-5 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
 {copiedCode === promo.kode ? (
 <>
 <Check className="w-4 h-4 text-emerald-300" />
 <span>TERSALIN!</span>
 </>
 ) : (
 <>
 <Copy className="w-4 h-4" />
 <span>KODE: {promo.kode}</span>
 </>
 )}
 </button>
 </div>
 </div>
 <div className="w-full sm:w-[45%] h-60 sm:h-52 relative flex items-center justify-center shrink-0 z-10 order-1 sm:order-none">
 <img src={promo.imgUrl} alt={promo.nama} className="h-full w-full object-contain filter drop-shadow-2xl scale-110 sm:scale-105 lg:scale-95 transform group-hover:scale-110 transition-transform duration-300" />
 </div>
 </div>
 </div>
 );
 }

 // Khusus Card Biru (id: 2) - Diatur agar jarak/gap di 768px sangat pas dan rapat
 return (
 <div key={promo.id} className="relative transition-transform duration-300 hover:scale-[1.01] h-full flex">
 <div className={`${promo.bgColor} text-white p-6 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between sm:px-6 lg:px-8 rounded-2xl relative group overflow-hidden w-full h-full`}>
 <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
 <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
 <line x1="-50" y1="350" x2="350" y2="-50" stroke="white" strokeWidth="20" />
 <line x1="50" y1="350" x2="450" y2="-50" stroke="white" strokeWidth="20" />
 <line x1="150" y1="350" x2="550" y2="-50" stroke="white" strokeWidth="20" />
 </svg>
 </div>

 {/* Teks Card Biru */}
 <div className="w-full sm:w-[50%] flex flex-col justify-between items-start text-left z-15 h-full order-2 sm:order-1 sm:pr-2 sm:pl-8 lg:pl-0">
 <div>
 <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-wider block mb-1">{promo.tipeDiskon}</span>
 <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">{promo.nama}</h3>
 <p className="text-2xl sm:text-3xl font-extrabold text-amber-200 mt-1">{promo.nilaiDiskon}</p>
 <p className="text-[11px] sm:text-xs text-white/90 font-medium mt-1.5 leading-snug">
 {promo.minPembelian} {promo.maxDiskon ? `• ${promo.maxDiskon}` :""}<br />
 <span className="text-white/80">• s/d {promo.tanggalBerakhir}</span>
 </p>
 </div>
 <div className="mt-4 w-full z-20">
 <button className="w-full sm:w-auto border-2 border-white/90 text-white hover:bg-white hover:text-stone-900 px-5 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
 <span>GUNAKAN DISKON</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Gambar Card Biru */}
 <div className="w-full sm:w-[48%] h-60 sm:h-52 relative flex items-center justify-center shrink-0 z-10 order-1 sm:order-2 sm:pl-2">
 <img src={promo.imgUrl} alt={promo.nama} className="h-full w-full object-contain filter drop-shadow-2xl scale-110 sm:scale-105 lg:scale-95 transform group-hover:scale-110 transition-transform duration-300" />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}
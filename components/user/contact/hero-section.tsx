"use client";

import { Clock, MessageCircle, Mail } from "lucide-react";

export function ContactHeroSection() {
  return (
    <section className="relative w-full bg-accent-soft-blue border-b-2 border-foreground pt-28 pb-16 overflow-hidden">
      {/* Polka dot texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:radial-gradient(#3D2900_1.5px,transparent_0)] [background-size:28px_28px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left: headline + badges */}
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 px-4 py-1.5 rounded-full border-2 border-foreground bg-accent-yellow font-body font-bold text-xs text-foreground">
              <MessageCircle className="w-3.5 h-3.5" />
              Tim siap membantu Anda
            </span>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.15] tracking-tight">
              Hubungi <br className="hidden sm:block" />
              <span className="bg-accent-yellow px-3 py-0.5 rounded-xl border-2 border-foreground inline-block mt-1">
                RoboEdu
              </span>
            </h1>

            <p className="font-body text-sm sm:text-base text-foreground/80 leading-relaxed max-w-lg">
              Pertanyaan produk, konsultasi sekolah, atau pengajuan reseller — 
              pilih jalur yang paling nyaman. Kami merespons cepat dan ramah.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <div className="inline-flex items-center gap-2 bg-card border-2 border-foreground rounded-full px-4 py-2 font-body font-bold text-xs text-foreground">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                Senin–Sabtu, 08.00–17.00 WIB
              </div>
              <div className="inline-flex items-center gap-2 bg-card border-2 border-foreground rounded-full px-4 py-2 font-body font-bold text-xs text-foreground">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                Balas dalam 1×24 jam
              </div>
            </div>
          </div>

          {/* Right: stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Respons WhatsApp", value: "< 1 Jam", accent: "bg-accent-green" },
              { label: "Kepuasan Pelanggan", value: "98%", accent: "bg-accent-yellow" },
              { label: "Sekolah & Institusi", value: "200+", accent: "bg-accent-pink" },
              { label: "Produk Tersedia", value: "50+", accent: "bg-accent-soft-blue" },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className={`${accent} border-2 border-foreground rounded-2xl p-5 flex flex-col gap-1`}
              >
                <span className="font-heading font-black text-2xl text-foreground">{value}</span>
                <span className="font-body text-xs text-foreground/70 leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

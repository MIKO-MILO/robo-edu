"use client";

import { MessageSquare, Zap, Building2, Clock } from "lucide-react";

export function ContactHeroSection() {
  return (
    <section className="relative w-full bg-accent-soft-blue border-b-2 border-foreground pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Polka Dot Background Accent */}
      <div className="absolute inset-0 opacity-40 pointer-events-none [background-image:radial-gradient(#3D2900_1.5px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Title, Highlighted Badge, Subtitle */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">

          {/* Main Headline with Highlighted Badge */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.2] text-foreground tracking-tight">
            Hubungi RoboEdu — Kami Siap{" "}
            <span className="relative inline-block my-1 px-4 py-1 bg-accent-yellow rounded-2xl border-2 border-foreground neo-shadow rotate-[-1deg] text-foreground">
              Membantu!
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg lg:text-xl text-foreground/85 leading-relaxed max-w-2xl">
            Punya pertanyaan seputar kit robotika, konsultasi kebutuhan sekolah atau komunitas, atau tertarik mengajukan status Reseller? Tim kami siap melayani Anda dengan ramah dan cepat.
          </p>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 bg-card border-2 border-foreground rounded-full px-4 py-2 text-xs font-bold font-body text-foreground neo-shadow-icon">
              <Clock className="w-4 h-4 text-primary" />
              <span>Jam Operasional: Senin - Sabtu (08.00 - 17.00 WIB)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Card Showcase */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-full max-w-md bg-accent-yellow border-2 border-foreground rounded-3xl p-6 sm:p-8 neo-shadow flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-card border-2 border-foreground flex items-center justify-center neo-shadow-icon shrink-0">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Respon Cepat & Ramah
                </h3>
                <p className="font-body text-xs sm:text-sm text-foreground/80">
                  Tim Support RoboEdu Indonesia
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t-2 border-foreground/10">
              <div className="bg-card border-2 border-foreground rounded-2xl p-4 flex flex-col gap-1 neo-shadow-icon">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-heading font-bold text-sm text-foreground">
                    &lt; 1 Jam
                  </span>
                </div>
                <span className="font-body text-xs text-muted-foreground">
                  Balasan via WhatsApp
                </span>
              </div>

              <div className="bg-card border-2 border-foreground rounded-2xl p-4 flex flex-col gap-1 neo-shadow-icon">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-heading font-bold text-sm text-foreground">
                    Institusi
                  </span>
                </div>
                <span className="font-body text-xs text-muted-foreground">
                  Layanan Sekolah & Komunitas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

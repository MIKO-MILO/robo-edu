"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutHeroSection() {
  return (
    <section className="relative w-full bg-accent-soft-blue border-b-2 border-foreground pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Polka Dot Background Accent */}
      <div className="absolute inset-0 opacity-40 pointer-events-none [background-image:radial-gradient(#3D2900_1.5px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Title, Highlighted Badge, Subtitle, CTA */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">
          {/* Playful Tag Badge */}
          <div className="inline-flex items-center gap-2 bg-accent-yellow border-2 border-foreground neo-shadow-icon px-4 py-1.5 rounded-full font-body font-bold text-xs sm:text-sm text-foreground">
            <Zap className="w-4 h-4 text-primary fill-primary" />
            <span>Platform #1 Pembelajaran Robotik Edukasi</span>
          </div>

          {/* Main Headline with Highlighted Badge */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.2] text-foreground tracking-tight">
            Membangun Generasi{" "}
            <span className="relative inline-block my-1 px-4 py-1 bg-accent-yellow rounded-2xl border-2 border-foreground neo-shadow rotate-[-1deg] text-foreground">
              Inovator Robotik
            </span>{" "}
            Masa Depan!
          </h1>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg lg:text-xl text-foreground/85 leading-relaxed max-w-2xl">
            RoboEdu menghadirkan pengalaman belajar STEM interaktif bagi anak
            usia 6+ tahun. Kami percaya bahwa teknologi terbaik adalah teknologi
            yang dapat disentuh, dirakit, dan dimainkan secara langsung demi
            memicu rasa ingin tahu yang tak terbatas.
          </p>

          {/* CTA Button */}
          <div className="pt-2">
            <Link href="/products">
              <Button
                variant="primary"
                size="lg"
                neo
                className="font-bold text-base px-8 py-4 rounded-full"
              >
                <span>Jelajahi Produk Kami</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Yellow Showcase Card */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-full max-w-sm bg-accent-yellow border-2 border-foreground rounded-3xl p-6 sm:p-8 neo-shadow flex flex-col items-center text-center gap-5">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 bg-card border-2 border-foreground neo-shadow-icon px-3.5 py-1 rounded-full font-body font-bold text-xs text-foreground">
              <Bot className="w-4 h-4 text-primary" />
              <span>Made-by-Order Quota</span>
            </div>

            {/* Toy Image Container */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-card border-2 border-foreground rounded-2xl p-4 flex items-center justify-center neo-shadow-icon relative overflow-hidden">
              <Image
                src="/images/robobuddy_toy.png"
                alt="RoboEdu Robot Companion Toy"
                width={200}
                height={200}
                className="object-contain max-h-full"
                priority
              />
            </div>

            {/* Bottom Caption Box */}
            <div className="bg-card border-2 border-foreground rounded-xl p-3.5 neo-shadow-icon text-center">
              <p className="font-body text-xs sm:text-sm font-bold text-foreground leading-snug">
                &ldquo;Setiap kit dirakit & diuji kualitasnya sebelum dikirim ke rumah Anda.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

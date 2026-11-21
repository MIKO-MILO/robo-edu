"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MembershipAuthState } from "@/types";

export function ResellerCtaSection() {
  const router = useRouter();
  const [authState, setAuthState] = useState<MembershipAuthState>("loading");

  useEffect(() => {
    fetch("/api/membership/me", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          setAuthState("guest");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        if (json.success) {
          setAuthState(
            json.data.membership_status === "MEMBER" ? "member" : "not_member",
          );
        } else {
          setAuthState("guest");
        }
      })
      .catch(() => setAuthState("guest"));
  }, []);

  const ctaLabel =
    authState === "member"
      ? "PERPANJANG MEMBERSHIP SEKARANG"
      : "BELI MEMBERSHIP PLUS SEKARANG";

  function handleCtaClick() {
    if (authState === "guest") {
      router.push("/login?next=/membership");
      return;
    }
    router.push("/membership/confirm");
  }

  return (
    <section className="relative w-full bg-transparent">
      {/* Container Full-Width dengan background transparan total & tanpa garis atas */}
      <div className="w-full relative overflow-hidden bg-transparent border-b border-border/10">
        
        {/* Pattern Background tetap ada di belakang */}
        <div 
          className="absolute inset-0 opacity-[0.15] pointer-events-none z-0"
          style={{
            backgroundImage: `url('/images/pattern.webp')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '240px 240px',
          }}
        />

        {/* Content Wrapper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Area Kiri: Teks & Tombol */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-card/10 text-foreground font-semibold text-xs backdrop-blur-sm border border-card/20 shadow-sm">
                Gabung Bersama Kami
              </span>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[2.75rem] text-foreground tracking-tight leading-snug">
                Siap Memulai Kemitraan Bersama RoboEdu?
              </h2>

              <p className="font-body text-sm sm:text-base text-foreground/80 leading-relaxed font-medium max-w-xl">
                Cetak generasi inventor masa depan dengan penyediaan produk robotika berkualitas tinggi, dukungan kurikulum STEM, dan keuntungan menarik untuk mitra resmi.
              </p>

              <div className="pt-2">
                <Button
                  asChild
                  variant="primary"
                  neo={false}
                  size="lg"
                  className="rounded-full font-heading font-bold text-xs sm:text-sm"
                >
                  <Link href="/contact">
                    AJUKAN JADI RESELLER SEKARANG
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Area Kanan: Gambar Maskot / Robot dengan Outline Biru yang Dikecilkan */}
           <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
  <div className="relative w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[560px] aspect-square flex items-center justify-center">
    <Image
      src="/images/robo3.png"
      alt="RoboEdu Mascot"
      width={620}
      height={620}
      className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
      style={{
        filter: `
          drop-shadow(3px 0 0 var(--color-membership-blue-dark)) 
          drop-shadow(-3px 0 0 var(--color-membership-blue-dark)) 
          drop-shadow(0 3px 0 var(--color-membership-blue-dark)) 
          drop-shadow(0 -3px 0 var(--color-membership-blue-dark))
          drop-shadow(2px 2px 0 var(--color-membership-blue-dark))
          drop-shadow(-2px -2px 0 var(--color-membership-blue-dark))
          drop-shadow(2px -2px 0 var(--color-membership-blue-dark))
          drop-shadow(-2px 2px 0 var(--color-membership-blue-dark))
          drop-shadow(0 4px 8px rgba(2, 132, 199, 0.2))
        `,
      }}
      priority
    />
  </div>
</div>
          </div>
        </div>

      </div>
    </section>
  );
}
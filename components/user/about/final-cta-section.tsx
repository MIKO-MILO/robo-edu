import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutFinalCtaSection() {
  return (
    <section className="relative w-full py-16 sm:py-24 bg-accent-soft-blue border-b-2 border-foreground overflow-hidden">
      {/* Polka Dot Background Accent */}
      <div className="absolute inset-0 opacity-40 pointer-events-none [background-image:radial-gradient(#3D2900_1.5px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Yellow Banner Container Card */}
        <div className="bg-accent-yellow border-2 border-foreground rounded-3xl p-8 sm:p-14 neo-shadow flex flex-col items-center text-center gap-6 max-w-4xl mx-auto relative">
          {/* Main Headline */}
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.2] tracking-tight">
            Siap Wujudkan{" "}
            <span className="relative inline-block my-1 px-4 py-1 bg-accent-pink rounded-2xl border-2 border-foreground neo-shadow rotate-[-1deg] text-foreground">
              Robot Impian
            </span>{" "}
            Anak Anda Hari Ini?
          </h2>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-lg lg:text-xl text-foreground/85 max-w-2xl leading-relaxed">
            Jelajahi berbagai kit robotika dan sparepart lengkap RoboEdu. Pilih kit yang sesuai dengan usia dan tingkat keterampilan anak!
          </p>

          {/* Action Button */}
          <div className="pt-2">
            <Link href="/products">
              <Button
                variant="primary"
                size="lg"
                neo
                className="font-bold text-base sm:text-lg px-8 py-4 rounded-full"
              >
                <span>Jelajahi Katalog Produk</span>
                <ArrowRight className="w-6 h-6 stroke-[2.5px]" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

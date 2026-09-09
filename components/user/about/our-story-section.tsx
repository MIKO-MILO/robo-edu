import Image from "next/image";
import { Sparkle } from "lucide-react";

export function OurStorySection() {
  return (
    <section
      id="our-story"
      className="w-full py-16 sm:py-24 bg-background border-b-2 border-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Slanted Pink Card Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md bg-accent-pink border-2 border-foreground rounded-3xl p-5 sm:p-6 neo-shadow rotate-[-2deg] flex flex-col gap-4">
            {/* Header Tag inside Pink Card */}
            <div className="flex justify-end items-end border-b-2 border-foreground/20 pb-3">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-foreground bg-card border-2 border-foreground px-3 py-1 rounded-full neo-shadow-icon">
                CERITA KAMI
              </span>
            </div>

            {/* Photo / Kit Image Box */}
            <div className="relative w-full h-56 sm:h-64 bg-card border-2 border-foreground rounded-2xl overflow-hidden p-2">
              <Image
                src="/images/blockbot_toy.png"
                alt="Eksperimen Kit Robotik RoboEdu"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-contain p-4"
              />
            </div>

            {/* Bottom Caption Box */}
            <div className="bg-card border-2 border-foreground rounded-2xl p-4 flex flex-col gap-1.5 neo-shadow-icon">
              <div className="flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-primary fill-primary" />
                <span className="font-heading font-bold text-sm text-primary">
                  Visi Utama Kami
                </span>
                <Sparkle className="w-4 h-4 text-primary fill-primary" />
              </div>
              <p className="font-body text-xs sm:text-sm text-foreground/90 leading-snug">
                Mengalihkan perhatian anak dari layar gadget (*screen time*) ke eksperimen nyata yang seru, aman, dan edukatif untuk anak Indonesia.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative Story & Feature Cards */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">

          {/* Headline */}
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.2] text-foreground tracking-tight">
            Dari Rasa Ingin Tahu, Menjadi{" "}
            <span className="relative inline-block my-1 px-4 py-1 bg-accent-yellow rounded-2xl border-2 border-foreground neo-shadow text-foreground">
              Karya Nyata
            </span>
          </h2>

          {/* Story Paragraphs */}
          <div className="font-body text-base sm:text-lg text-foreground/85 leading-relaxed flex flex-col gap-4">
            <p>
              RoboEdu berawal dari keprihatinan kami terhadap dominasi layar gadget (*screen time*) pada anak-anak. Kami ingin mengembalikan keceriaan eksplorasi fisik, di mana anak dapat memegang, merakit, dan melihat langsung bagaimana sebuah roda dapat berputar karena logika yang mereka bangun sendiri.
            </p>
            <p>
              Setiap kit robotik RoboEdu dirancang khusus dengan filosofi <strong className="text-foreground font-bold">Made-by-Order</strong>. Kami tidak sekadar memproduksi barang masal di gudang, melainkan memastikan setiap komponen telah melalui kontrol mutu ketat dan kalibrasi khusus sebelum siap dikirimkan begitu saja ke rumah Anda.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

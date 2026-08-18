import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="w-full flex-grow flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      {/* Left Column: Image */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative border-b-2 md:border-b-0 border-on-surface">
        <Image
          src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=85"
          alt="Anak-anak sedang bermain kit edukasi RoboEdu"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Right Column: Polka Dot Background */}
      <div className="w-full md:w-1/2 flex flex-col items-start justify-center p-8 md:p-16 relative md:border-l-2 border-foreground min-h-[50vh] bg-accent-soft-blue [background-image:radial-gradient(#3D2900_1.5px,transparent_0)] [background-size:24px_24px]">
        {/* Content Box */}
        <div className="max-w-md w-full mx-auto md:mx-0 relative z-20">
          <span className="font-body font-semibold text-xs md:text-sm uppercase tracking-widest text-primary mb-4 block">
            a new way to play
          </span>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 leading-tight">
            Main Belajar Jadi Lebih Seru!
          </h1>

          <p className="font-body text-base md:text-lg text-foreground/80 mb-8">
            Temukan berbagai kit eksperimen dan mainan edukatif yang dirancang
            untuk memicu rasa ingin tahu serta kreativitas si kecil.
          </p>

          <Link
            href="#katalog"
            className="bg-[#FF5C38] text-white font-body font-bold text-sm uppercase px-8 py-4 rounded-full border-2 border-foreground neo-shadow neo-shadow-hover inline-flex items-center gap-2 active:scale-95 transition-transform"
          >
            JELAJAHI KATALOG
            <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
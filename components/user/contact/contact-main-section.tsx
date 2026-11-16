import { SocialSection } from "./social-section";
import { ContactForm } from "./contact-form";

export function ContactMainSection() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        
        {/* 1. BAGIAN JUDUL (Di atas secara penuh) */}
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="inline-flex w-fit items-center px-3.5 py-1 rounded-full bg-accent-soft-blue font-body font-bold text-xs text-foreground shadow-xs">
            Informasi Kontak
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight">
            Hubungi & Kunjungi Kami
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Pilih jalur komunikasi yang paling nyaman untuk mulai berkonsultasi dengan tim RoboEdu.
          </p>
        </div>

        {/* 2. GRID UTAMA DI BAWAH (Kiri: 4 Kartu Sosial, Kanan: Form Langsung Tanpa Card Putih) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-16 items-start">
          {/* Kolom Kiri: 4 Kartu Sosial */}
          <SocialSection />
          
          {/* Kolom Kanan: Langsung ContactForm tanpa background card putih */}
          <div className="w-full">
            <ContactForm />
          </div>
        </div>

      </div>
    </section>
  );
}
import { Lightbulb, Search, BookOpen } from "lucide-react";
import { ValueCard } from "./value-card";

export function AboutValuesSection() {
  const values = [
    {
      title: "Pembelajaran STEM Interaktif",
      description:
        "Anak tidak hanya belajar teori sains & coding, tetapi langsung mempraktikkannya melalui mekanika fisik yang memicu rasa ingin tahu secara berkelanjutan.",
      badgeText: "EXPERIENCE",
      icon: Lightbulb,
      bgColorClass: "bg-accent-yellow",
    },
    {
      title: "Komponen Pre-Tested & Presisi",
      description:
        "Setiap sensor, motor, dan chassis dibuat dari bahan berkualitas tinggi yang tidak mudah aus, presisi saat dipasang, dan tahan lama untuk anak.",
      badgeText: "QUALITY",
      icon: Search,
      bgColorClass: "bg-accent-soft-blue",
    },
    {
      title: "Panduan Intuitif & Garansi",
      description:
        "Buku petunjuk bergambar lengkap dan akses tutorial video interaktif. Garansi ganti part bila ada kerusakan produksi.",
      badgeText: "GUIDANCE",
      icon: BookOpen,
      bgColorClass: "bg-accent-pink",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-background border-b-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 sm:gap-16">
        {/* Headline Center */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">

          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight">
            Keunggulan Utama Dalam{" "}
            <span className="relative inline-block my-1 px-4 py-1 bg-accent-soft-blue rounded-2xl border-2 border-foreground neo-shadow text-foreground">
              Setiap Kit
            </span>
          </h2>

          <p className="font-body text-base sm:text-lg text-muted-foreground">
            Dirancang khusus untuk mengasah kecerdasan spasial, pemecahan masalah, dan kreativitas anak melalui cara yang menyenangkan.
          </p>
        </div>

        {/* 3 Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((item, index) => (
            <ValueCard
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              bgColorClass={item.bgColorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

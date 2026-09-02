import { ShieldCheck, Zap, CheckCircle2, Heart } from "lucide-react";

export function KidSafeSection() {
  const features = [
    {
      title: "Bahan Bebas BPA & Non-Toxic",
      description:
        "Plastik ramah lingkungan tanpa bahan kimia keras yang berbahaya bagi jemari anak.",
      icon: ShieldCheck,
      iconBg: "bg-accent-soft-blue",
    },
    {
      title: "Daya Aman Rendah (3-6V DC)",
      description:
        "Menggunakan daya listrik rendah aman tanpa risiko sengatan listrik tinggi.",
      icon: Zap,
      iconBg: "bg-accent-yellow",
    },
    {
      title: "Tepi Tidak Tajam (Smooth)",
      description:
        "Finishing komponen halus tanpa sudut tajam yang berpotensi melukai.",
      icon: CheckCircle2,
      iconBg: "bg-accent-green",
    },
    {
      title: "Garansi Retur 90 Hari",
      description:
        "Jaminan penggantian suku cadang jika tidak sesuai dengan harapan.",
      icon: Heart,
      iconBg: "bg-accent-pink",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-accent-butter/60 border-b-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large White Container Card */}
        <div className="bg-card border-2 border-foreground rounded-3xl p-6 sm:p-10 lg:p-12 neo-shadow grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Title, Subtitle, 2x2 Feature Grid */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-accent-green border-2 border-foreground neo-shadow-icon px-4 py-1.5 rounded-full font-body font-bold text-xs sm:text-sm text-foreground">
              <ShieldCheck className="w-4 h-4 text-foreground" />
              <span>ROBO-EDU GUARANTEE KID-SAFE</span>
            </div>

            {/* Main Heading */}
            <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-[1.2] text-foreground tracking-tight">
              Keamanan & Kenyamanan Si Kecil Adalah{" "}
              <span className="relative inline-block my-1 px-4 py-1 bg-accent-yellow rounded-2xl border-2 border-foreground neo-shadow text-foreground">
                Prioritas Utama
              </span>
            </h2>

            {/* Subtitle */}
            <p className="font-body text-base sm:text-lg text-muted-foreground leading-relaxed">
              Setiap komponen dalam kit robotika RoboEdu telah melewati serangkaian uji keamanan ketat agar orang tua dapat merasa tenang saat anak berkreasi.
            </p>

            {/* 2x2 Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-background border-2 border-foreground rounded-2xl p-4 neo-shadow-icon flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${item.iconBg} w-9 h-9 rounded-full border-2 border-foreground flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <h4 className="font-heading font-bold text-sm text-foreground leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <p className="font-body text-xs text-muted-foreground leading-snug pl-1">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Mint Green Approved Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-accent-green border-2 border-foreground rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-5 neo-shadow">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card border-2 border-foreground flex items-center justify-center neo-shadow-icon">
                <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-foreground" />
              </div>

              <h3 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                100% Kid Safe Approved
              </h3>

              <p className="font-body text-xs sm:text-sm text-foreground/90 leading-relaxed">
                &ldquo;Diuji oleh pakar edukasi & aman untuk jemari anak usia 6+ tahun. Kami memastikan setiap komponen bebas risiko dan dirancang khusus demi kenyamanan anak saat belajar merakit.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

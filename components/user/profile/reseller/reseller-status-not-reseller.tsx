import Link from "next/link";
import { HandshakeIcon, Tag, Zap, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ResellerStatusNotReseller
 * -------------------------
 * Tampilan untuk user dengan reseller_status = NOT_RESELLER.
 * Berisi ajakan bergabung, ringkasan 3 manfaat, dan CTA ke /reseller/apply.
 *
 * Konten murni statis — tidak butuh props.
 * PRD Bab 6.6: "Ajakan bergabung dan ringkasan manfaat."
 */

const BENEFITS = [
  {
    Icon: Tag,
    title: "Harga Khusus Reseller",
    description:
      "Dapatkan harga lebih hemat di seluruh katalog produk RoboEdu, aktif otomatis setelah disetujui.",
  },
  {
    Icon: Zap,
    title: "Akses Prioritas",
    description:
      "Notifikasi lebih awal untuk produk baru, stok terbatas, dan penawaran eksklusif.",
  },
  {
    Icon: HeadphonesIcon,
    title: "Dukungan Dedicated",
    description:
      "Kontak langsung dengan tim RoboEdu untuk pertanyaan produk, pengiriman massal, dan konsultasi.",
  },
] as const;

export function ResellerStatusNotReseller() {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-3xl border-2 border-foreground bg-card p-8 neo-shadow">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-foreground bg-accent-soft-blue neo-shadow-icon">
            <HandshakeIcon className="size-8 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Bergabunglah sebagai Reseller RoboEdu
            </h2>
            <p className="mt-2 font-body text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Kamu belum terdaftar sebagai reseller. Ajukan sekarang dan nikmati
              keuntungan harga khusus untuk semua produk robotika edukasi kami.
            </p>
          </div>
        </div>

        {/* Manfaat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {BENEFITS.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border-2 border-foreground bg-muted p-5 flex flex-col gap-3"
            >
              <div className="flex size-10 items-center justify-center rounded-xl border-2 border-foreground bg-accent-yellow neo-shadow-icon">
                <Icon className="size-5 text-foreground" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">{title}</p>
                <p className="mt-1 font-body text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Alur singkat */}
        <div className="mb-8 rounded-2xl border-2 border-foreground bg-accent-butter p-5">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Alur Pengajuan
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {(
              [
                { step: "1", label: "Isi Formulir" },
                { step: "2", label: "Tunggu Review (1–3 hari kerja)" },
                { step: "3", label: "Harga Reseller Aktif" },
              ] as const
            ).map(({ step, label }, idx, arr) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full border-2 border-foreground bg-card font-heading text-xs font-bold">
                    {step}
                  </span>
                  <span className="font-body text-sm text-foreground">{label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <span className="hidden sm:block font-body text-muted-foreground text-lg">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Button asChild variant="primary" size="lg" neo className="font-heading font-bold px-10 rounded-2xl">
            <Link href="/reseller/apply">
              <HandshakeIcon className="size-5" />
              Ajukan Jadi Reseller
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

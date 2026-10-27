import Link from "next/link";
import { CrownIcon, Tag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * MembershipNotMember
 * -------------------
 * Tampilan untuk user dengan membership_status = NOT_MEMBER.
 *
 * Konten (PRD Bab 6.8):
 *   - Ajakan bergabung sebagai member
 *   - Ringkasan 2 manfaat: Harga Member dan Dropship
 *   - Alur 3 langkah singkat
 *   - CTA: "Beli Membership Plus" → /reseller
 *
 * Card tanpa neo-shadow — pakai shadow-sm + border ringan.
 * PRD Bab 6.8 | FR-022 | US-005
 */

const BENEFITS = [
  {
    Icon: Tag,
    color: "bg-accent-yellow",
    title: "Harga Member",
    description:
      "Dapatkan harga khusus member yang lebih hemat di seluruh katalog produk RoboEdu. Aktif langsung setelah pembayaran dikonfirmasi.",
  },
  {
    Icon: Truck,
    color: "bg-accent-green",
    title: "Dropship",
    description:
      "Kirim pesanan langsung ke pembeli akhir atas namamu — nama dan nomor teleponmu muncul di resi pengiriman.",
  },
] as const;

export function MembershipNotMember() {
  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className="rounded-3xl bg-white border border-[#C7C4BB] shadow-sm px-8 py-8">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-accent-butter">
            <CrownIcon className="size-8 text-foreground" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Bergabunglah sebagai Member Plus
            </h2>
            <p className="mt-2 font-body text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Dapatkan harga khusus member dan akses dropship — langsung aktif
              setelah pembayaran, tanpa formulir dan tanpa menunggu persetujuan.
            </p>
          </div>
        </div>

        {/* Manfaat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {BENEFITS.map(({ Icon, color, title, description }) => (
            <div
              key={title}
              className="rounded-2xl bg-muted/50 border border-[#C7C4BB] p-5 flex flex-col gap-3"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${color}`}
              >
                <Icon className="size-5 text-foreground" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">
                  {title}
                </p>
                <p className="mt-1 font-body text-xs text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Alur singkat */}
        <div className="mb-8 rounded-2xl bg-accent-butter/60 border border-[#C7C4BB] p-5">
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Cara Bergabung
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {(
              [
                { step: "1", label: "Pilih Paket Plus" },
                { step: "2", label: "Bayar via Midtrans" },
                { step: "3", label: "Harga Member Langsung Aktif" },
              ] as const
            ).map(({ step, label }, idx, arr) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-white border border-[#C7C4BB] font-heading text-xs font-bold text-foreground">
                    {step}
                  </span>
                  <span className="font-body text-sm text-foreground">
                    {label}
                  </span>
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
          <Button
            asChild
            variant="primary"
            size="lg"
            className="font-heading font-bold px-10 rounded-2xl shadow-sm"
          >
            <Link href="/reseller">
              <CrownIcon className="size-5" />
              Beli Membership Plus
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

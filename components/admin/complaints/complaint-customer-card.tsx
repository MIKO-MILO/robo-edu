import * as React from "react";
import { User, Mail, Phone } from "lucide-react";

export interface ComplaintCustomerCardProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
}

/**
 * Molecule — kartu kontak customer untuk tindak lanjut manual.
 * Menampilkan nama, email, dan nomor WA sebagai informasi referensi
 * (bukan untuk mengirim pesan lewat system).
 */
export function ComplaintCustomerCard({
  customerName,
  customerEmail,
  customerPhone,
}: ComplaintCustomerCardProps) {
  return (
    <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b-2 border-border pb-3">
        <User className="size-4 text-primary" />
        <h3 className="font-heading font-bold text-base text-foreground">
          Kontak Customer
        </h3>
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <User className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Nama Pelanggan
            </p>
            <p className="font-semibold text-foreground text-sm truncate">{customerName}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-info-bg text-info shrink-0">
            <Mail className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Email
            </p>
            <p className="text-sm text-foreground truncate">{customerEmail}</p>
          </div>
        </div>

        {/* WhatsApp */}
        {customerPhone ? (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-success-bg text-success shrink-0">
              <Phone className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Nomor WhatsApp
              </p>
              <p className="font-mono font-semibold text-sm text-foreground">
                {customerPhone}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
              <Phone className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Nomor WhatsApp
              </p>
              <p className="text-xs text-muted-foreground italic">Tidak tersedia</p>
            </div>
          </div>
        )}
      </div>

      {/* Helper note */}
      <p className="text-[11px] text-muted-foreground bg-muted/60 rounded-xl p-2.5 leading-relaxed">
        ℹ️ Hubungi customer secara manual melalui WhatsApp atau email di atas. 
        Pesan tidak dikirim otomatis oleh sistem.
      </p>
    </div>
  );
}

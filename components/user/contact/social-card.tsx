import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialMediaContact } from "@/types";

export interface SocialCardProps {
  contact: SocialMediaContact;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

/**
 * Atom — Kartu Media Sosial / Kontak RoboEdu (Centering & Compact Handle Style)
 * Layout:
 * 1. Atas (Center): Box Ikon Putih
 * 2. Tengah (Center): Handle / Nomor HP / Username (ukuran font lebih compact & terpusat) + Deskripsi Singkat
 * 3. Bawah (Center): Tombol Aksi Putih
 */
export function SocialCard({
  contact,
  icon: Icon,
  className,
}: SocialCardProps) {
  return (
    <article
      className={cn(
        contact.bgColorClass,
        "border-2 border-foreground rounded-[28px] p-5 sm:p-6",
        "neo-shadow neo-shadow-hover",
        "flex flex-col items-center text-center justify-between gap-4 transition-all duration-200 h-full overflow-hidden",
        className
      )}
    >
      {/* ── 1. Atas: Box Ikon Putih (Center) ── */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] bg-card border-2 border-foreground flex items-center justify-center neo-shadow-icon shrink-0 mx-auto">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" />
      </div>

      {/* ── 2. Tengah: Handle / Nomor HP / Username & Deskripsi (Center & Compact) ── */}
      <div className="flex flex-col items-center text-center gap-1.5 w-full my-auto">
        <h3 className="font-heading font-bold text-base sm:text-base text-foreground text-center break-all w-full leading-tight">
          {contact.handle}
        </h3>
        <p className="font-body text-xs sm:text-sm text-foreground/90 text-center leading-snug w-full">
          {contact.description}
        </p>
      </div>

      {/* ── 3. Bawah: Tombol Link Putih (Center) ── */}
      <a
        href={contact.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 font-body font-bold text-xs sm:text-sm text-foreground bg-card border-2 border-foreground neo-shadow-icon hover:neo-shadow px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all active:scale-95 mx-auto mt-auto"
      >
        <span>{contact.actionText}</span>
        <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" aria-hidden="true" />
      </a>
    </article>
  );
}

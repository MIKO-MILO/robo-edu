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
 * Atom — Kartu Media Sosial / Kontak RoboEdu
 * Menampilkan ikon media sosial, nama akun/handle, deskripsi singkat, dan tombol tautan.
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
        "border-2 border-foreground rounded-3xl p-5 sm:p-6",
        "neo-shadow neo-shadow-hover",
        "flex flex-col justify-between gap-4 transition-all duration-200",
        className
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-2xl bg-card border-2 border-foreground flex items-center justify-center neo-shadow-icon shrink-0">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
        <span className="font-body font-bold text-[11px] uppercase tracking-wider bg-card border-2 border-foreground px-3 py-1 rounded-full text-foreground neo-shadow-icon">
          {contact.platform}
        </span>
      </div>

      {/* Info Body */}
      <div className="flex flex-col gap-1">
        <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground leading-snug">
          {contact.handle}
        </h3>
        <p className="font-body text-xs sm:text-sm text-foreground/80 leading-relaxed">
          {contact.description}
        </p>
      </div>

      {/* External Link Action */}
      <a
        href={contact.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-body font-bold text-xs sm:text-sm text-foreground bg-card border-2 border-foreground neo-shadow-icon hover:neo-shadow px-4 py-2 rounded-full transition-all self-start active:scale-95"
      >
        <span>{contact.actionText}</span>
        <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" aria-hidden="true" />
      </a>
    </article>
  );
}

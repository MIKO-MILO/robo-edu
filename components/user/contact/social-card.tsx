import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialMediaContact } from "@/types";

export interface SocialCardProps {
  contact: SocialMediaContact;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

/** Atom — Kartu media sosial / kontak. Flat, border-based, no shadow. */
export function SocialCard({ contact, icon: Icon, className }: SocialCardProps) {
  return (
    <article
      className={cn(
        contact.bgColorClass,
        "rounded-2xl border-2 border-foreground p-5",
        "flex flex-col items-center text-center gap-4",
        "transition-colors duration-150",
        className,
      )}
    >
      {/* Icon box */}
      <div className="w-12 h-12 rounded-xl bg-card border-2 border-foreground flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-foreground" />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1 flex-1">
        <h3 className="font-heading font-bold text-sm text-foreground break-all leading-tight">
          {contact.handle}
        </h3>
        <p className="font-body text-xs text-foreground/80 leading-snug">
          {contact.description}
        </p>
      </div>

      {/* CTA */}
      <a
        href={contact.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 bg-card border-2 border-foreground rounded-full px-4 py-2 font-body font-bold text-xs text-foreground hover:bg-muted transition-colors mt-auto"
      >
        {contact.actionText}
        <ExternalLink className="w-3 h-3 stroke-[2.5px]" aria-hidden />
      </a>
    </article>
  );
}

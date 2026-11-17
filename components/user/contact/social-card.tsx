"use client";

import React from "react";
import { ExternalLink, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SocialMediaContact } from "@/types";

export interface SocialCardProps {
  contact: SocialMediaContact;
  className?: string;
}

const SHADOW_COLOR_MAP: Record<string, string> = {
  "bg-accent-green": "shadow-[0_6px_0_0_var(--color-accent-green-shadow)]",
  "bg-accent-soft-blue": "shadow-[0_6px_0_0_var(--color-accent-soft-blue-shadow)]",
  "bg-accent-pink": "shadow-[0_6px_0_0_var(--color-accent-pink-shadow)]",
  "bg-accent-yellow": "shadow-[0_6px_0_0_var(--color-accent-yellow-shadow)]",
};

// SVG kustom untuk Instagram & YouTube agar aman dan tidak bergantung pada versi Lucide
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

function PlatformIcon({ iconName, className }: { iconName: string; className?: string }) {
  switch (iconName) {
    case "message-circle":
      return <MessageCircle className={className} />;
    case "mail":
      return <Mail className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "youtube":
      return <YoutubeIcon className={className} />;
    default:
      return <MessageCircle className={className} />;
  }
}

export function SocialCard({ contact, className }: SocialCardProps) {
  const bottomShadowClass =
    SHADOW_COLOR_MAP[contact.bgColorClass] ?? "shadow-[0_6px_0_0_rgba(61,41,0,0.12)]";

  return (
    <article
      className={cn(
        contact.bgColorClass,
        bottomShadowClass,
        "rounded-3xl p-5 border-0",
        "flex flex-col items-center text-center gap-4",
        "transition-transform hover:-translate-y-1 duration-200",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-card shadow-xs flex items-center justify-center shrink-0">
        <PlatformIcon iconName={contact.iconName} className="w-6 h-6 text-foreground" />
      </div>

      <div className="flex flex-col items-center gap-1 flex-1">
        <h3 className="font-heading font-bold text-sm text-foreground break-all leading-tight">
          {contact.handle}
        </h3>
        <p className="font-body text-xs text-foreground/80 leading-snug">
          {contact.description}
        </p>
      </div>

      <Button
        asChild
        variant="card"
        size="sm"
        neo={false}
        className="rounded-full px-4 py-2 font-body font-bold text-xs bg-card text-foreground hover:bg-muted shadow-xs mt-auto"
      >
        <a href={contact.href} target="_blank" rel="noopener noreferrer">
          {contact.actionText}
          <ExternalLink className="w-3 h-3 stroke-[2.5px] ml-1.5" aria-hidden />
        </a>
      </Button>
    </article>
  );
}
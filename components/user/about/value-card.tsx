import React from "react";
import { cn } from "@/lib/utils";

export interface ValueCardProps {
  title: string;
  description: string;
  badgeText?: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColorClass: string;
  className?: string;
}

export function ValueCard({
  title,
  description,
  badgeText,
  icon: Icon,
  bgColorClass,
  className,
}: ValueCardProps) {
  return (
    <article
      className={cn(
        bgColorClass,
        "border-2 border-foreground rounded-3xl p-6 sm:p-8",
        "neo-shadow neo-shadow-hover",
        "relative flex flex-col items-start gap-4 transition-all duration-200",
        className
      )}
    >
      {/* Top Header Row with Icon and Badge */}
      <div className="w-full flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-card border-2 border-foreground flex items-center justify-center neo-shadow-icon shrink-0">
          <Icon className="w-6 h-6 text-foreground" />
        </div>

        {badgeText && (
          <span className="font-body font-bold text-[10px] uppercase tracking-wider bg-card border-2 border-foreground px-3 py-1 rounded-full text-foreground neo-shadow-icon">
            {badgeText}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 pt-2">
        <h3 className="font-heading font-bold text-xl sm:text-2xl text-foreground leading-snug">
          {title}
        </h3>
        <p className="font-body text-xs sm:text-sm text-foreground/80 leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}

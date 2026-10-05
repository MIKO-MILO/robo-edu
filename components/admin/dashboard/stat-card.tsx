"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatCardVariant = "primary" | "success" | "warning" | "info" | "purple";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: StatCardVariant;
  trend?: {
    value: number; // e.g. 12.5 means +12.5%
    label?: string; // e.g. "vs bulan lalu"
  };
  badgeText?: string;
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<
  StatCardVariant,
  {
    cardBg: string;
    iconBg: string;
    iconText: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  primary: {
    cardBg: "bg-card",
    iconBg: "bg-primary text-primary-100",
    iconText: "text-primary-100",
    badgeBg: "bg-primary-100 text-primary-900 border border-primary-300",
    badgeText: "text-primary-900",
  },
  success: {
    cardBg: "bg-card",
    iconBg: "bg-accent-green text-[#1A472A]",
    iconText: "text-[#1A472A]",
    badgeBg: "bg-accent-green/40 text-success border border-[#4C684E]/30",
    badgeText: "text-success",
  },
  warning: {
    cardBg: "bg-card",
    iconBg: "bg-accent-yellow text-secondary",
    iconText: "text-secondary",
    badgeBg: "bg-accent-yellow text-secondary font-bold border border-secondary/20",
    badgeText: "text-secondary",
  },
  info: {
    cardBg: "bg-card",
    iconBg: "bg-accent-blue text-[#0C4A6E]",
    iconText: "text-[#0C4A6E]",
    badgeBg: "bg-accent-soft-blue text-[#103B5E] border border-primary-300",
    badgeText: "text-[#103B5E]",
  },
  purple: {
    cardBg: "bg-card",
    iconBg: "bg-accent-purple text-[#2E1065]",
    iconText: "text-[#2E1065]",
    badgeBg: "bg-accent-purple/40 text-[#2E1065] border border-border/20",
    badgeText: "text-[#2E1065]",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "primary",
  trend,
  badgeText,
  onClick,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const renderTrend = () => {
    if (!trend) return null;
    const isPositive = trend.value > 0;
    const isNegative = trend.value < 0;

    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border border-border/20",
          isPositive && "bg-accent-green/30 text-success",
          isNegative && "bg-accent-peach/40 text-danger",
          !isPositive && !isNegative && "bg-muted text-muted-foreground"
        )}
      >
        {isPositive && <TrendingUp className="size-3.5 stroke-[2.5]" />}
        {isNegative && <TrendingDown className="size-3.5 stroke-[2.5]" />}
        {!isPositive && !isNegative && <Minus className="size-3.5" />}
        <span>
          {isPositive ? "+" : ""}
          {trend.value}%
        </span>
        {trend.label && (
          <span className="font-normal text-muted-foreground ml-0.5">
            {trend.label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-3xl border-2 border-border neo-shadow transition-all duration-200",
        styles.cardBg,
        onClick && "cursor-pointer neo-shadow-hover active:translate-y-1",
        className
      )}
    >
      {/* Header Stat Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="font-body text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight break-all">
            {value}
          </div>
        </div>

        {/* Icon Container with Neo shadow */}
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl border-2 border-border neo-shadow-icon shrink-0 transition-transform group-hover:scale-105",
            styles.iconBg
          )}
        >
          {icon}
        </div>
      </div>

      {/* Subtitle / Trend / Badge Footer */}
      {(subtitle || trend || badgeText) && (
        <div className="mt-4 pt-3 border-t border-border/15 flex items-center justify-between gap-2 flex-wrap">
          {renderTrend()}
          {badgeText && (
            <span
              className={cn(
                "px-2.5 py-0.5 text-[11px] font-bold rounded-full border neo-shadow-icon",
                styles.badgeBg
              )}
            >
              {badgeText}
            </span>
          )}
          {subtitle && !trend && (
            <span className="font-body text-xs text-muted-foreground font-medium truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

interface TicketNotchProps {
  position: "left" | "right" | "top" | "bottom";
  className?: string;
  strokeWidth?: number;
}

/**
 * Atom — Setengah Lingkaran Cutout (Ticket Notch) presisi.
 * Menghasilkan lekukan tiket setengah lingkaran ke dalam tanpa ada garis luar
 * yang mengambang atau menutup di sisi luar kartu.
 */
export function TicketNotch({
  position,
  className,
  strokeWidth = 6,
}: TicketNotchProps) {
  if (position === "left") {
    return (
      <svg
        viewBox="0 0 20 40"
        className={cn(
          "w-4 sm:w-5 h-8 sm:h-10 absolute left-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none overflow-visible",
          className
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M 0 -2 A 20 20 0 0 1 0 42 L -4 42 L -4 -2 Z" fill="var(--color-background)" />
        <path
          d="M 0 -1 A 20 20 0 0 1 0 41"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (position === "right") {
    return (
      <svg
        viewBox="0 0 20 40"
        className={cn(
          "w-4 sm:w-5 h-8 sm:h-10 absolute right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none overflow-visible",
          className
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M 20 -2 A 20 20 0 0 0 20 42 L 24 42 L 24 -2 Z" fill="var(--color-background)" />
        <path
          d="M 20 -1 A 20 20 0 0 0 20 41"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (position === "top") {
    return (
      <svg
        viewBox="0 0 40 20"
        className={cn(
          "w-8 sm:w-10 h-4 sm:h-5 absolute top-0 z-20 pointer-events-none overflow-visible",
          className
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M -2 0 A 20 20 0 0 0 42 0 L 42 -4 L -2 -4 Z" fill="var(--color-background)" />
        <path
          d="M -1 0 A 20 20 0 0 0 41 0"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // position === "bottom"
  return (
    <svg
      viewBox="0 0 40 20"
      className={cn(
        "w-8 sm:w-10 h-4 sm:h-5 absolute bottom-0 z-20 pointer-events-none overflow-visible",
        className
      )}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M -2 20 A 20 20 0 0 1 42 20 L 42 24 L -2 24 Z" fill="var(--color-background)" />
      <path
        d="M -1 20 A 20 20 0 0 1 41 20"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

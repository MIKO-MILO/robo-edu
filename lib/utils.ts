import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility untuk menggabungkan class Tailwind secara aman.
 * Dipakai oleh shadcn/ui dan komponen internal.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

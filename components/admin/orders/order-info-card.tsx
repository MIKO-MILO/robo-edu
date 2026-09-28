import * as React from "react";
import { cn } from "@/lib/utils";

export interface OrderInfoCardProps {
  /** Heading area: ikon + judul */
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Atom — reusable card container dengan heading berikon untuk halaman detail pesanan.
 * Dipakai sebagai wrapper oleh OrderCustomerCard, OrderShippingCard, OrderPaymentCard.
 */
export function OrderInfoCard({
  icon,
  title,
  children,
  className,
}: OrderInfoCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-card border-2 border-border shadow-xs space-y-3",
        className
      )}
    >
      <h2 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

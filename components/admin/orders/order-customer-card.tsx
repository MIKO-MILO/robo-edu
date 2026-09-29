import * as React from "react";
import Link from "next/link";
import { User, Mail, Phone, ExternalLink } from "lucide-react";
import { OrderInfoCard } from "./order-info-card";

export interface OrderCustomerInfo {
  id?: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface OrderCustomerCardProps {
  customer: OrderCustomerInfo;
}

/**
 * Molecule — card informasi pemesan (nama, email, telepon).
 * Menyediakan tautan cepat ke halaman detail pelanggan jika id tersedia.
 */
export function OrderCustomerCard({ customer }: OrderCustomerCardProps) {
  return (
    <OrderInfoCard icon={<User className="size-4" />} title="Informasi Pemesan">
      <div className="space-y-2 text-xs font-body">
        <div className="font-bold text-sm text-foreground">{customer.name}</div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-3.5 shrink-0" />
          <span>{customer.email}</span>
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            <span>{customer.phone}</span>
          </div>
        )}
        {customer.id && (
          <div className="pt-2 border-t border-border mt-2">
            <Link
              href={`/admin/customers/${customer.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-heading font-bold hover:underline"
            >
              <ExternalLink className="size-3.5" />
              <span>Lihat Detail Pelanggan</span>
            </Link>
          </div>
        )}
      </div>
    </OrderInfoCard>
  );
}


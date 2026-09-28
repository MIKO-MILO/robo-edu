import * as React from "react";
import { User, Mail, Phone } from "lucide-react";
import { OrderInfoCard } from "./order-info-card";

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OrderCustomerCardProps {
  customer: OrderCustomerInfo;
}

/**
 * Molecule — card informasi pemesan (nama, email, telepon).
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="size-3.5 shrink-0" />
          <span>{customer.phone}</span>
        </div>
      </div>
    </OrderInfoCard>
  );
}

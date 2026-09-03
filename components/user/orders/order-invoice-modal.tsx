"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Download, CheckCircle2 } from "lucide-react";
import { OrderStatus } from "@/types";

export interface InvoiceItem {
  name: string;
  variant?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  recipientName: string;
  recipientPhone?: string;
  shippingAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount?: number;
  voucherCode?: string | null;
  total: number;
  paymentMethod?: string;
}

export function OrderInvoiceModal({
  isOpen,
  onClose,
  orderNumber,
  orderDate,
  status,
  recipientName,
  recipientPhone = "+62 812-3456-7890",
  shippingAddress = "Jl. Sudirman No. 45, Jakarta Selatan, DKI Jakarta 12190",
  items,
  subtotal,
  shippingCost,
  discountAmount = 0,
  voucherCode,
  total,
  paymentMethod = "BCA Virtual Account",
}: OrderInvoiceModalProps) {
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl border-2 border-foreground bg-card p-6 sm:p-8 rounded-3xl neo-shadow max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-accent-soft-blue border-2 border-foreground neo-shadow-icon">
              <FileText className="w-6 h-6 text-foreground stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="font-heading font-bold text-xl text-foreground">
                Invoice Resmi RoboEdu
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-muted-foreground">
                No. Order: <span className="font-bold text-foreground">{orderNumber}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-accent-green px-3 py-1 rounded-full text-xs font-bold border-2 border-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
              {status}
            </span>
          </div>
        </DialogHeader>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted p-4 rounded-2xl border-2 border-foreground text-xs font-body">
          <div>
            <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Diterbitkan Untuk:
            </p>
            <p className="font-heading font-bold text-sm text-foreground">{recipientName}</p>
            <p className="text-muted-foreground mt-0.5">{recipientPhone}</p>
            <p className="text-muted-foreground mt-1 leading-relaxed">{shippingAddress}</p>
          </div>

          <div className="sm:text-right flex flex-col sm:items-end justify-between">
            <div>
              <p className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Detail Transaksi:
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground">Tanggal:</span> {orderDate}
              </p>
              <p className="text-foreground">
                <span className="text-muted-foreground">Metode Bayar:</span> {paymentMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border-2 border-foreground rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-secondary-100 border-b-2 border-foreground text-foreground font-heading font-bold">
              <tr>
                <th className="p-3">Produk</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Harga Satuan</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10 bg-card">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3">
                    <p className="font-bold text-foreground text-sm">{item.name}</p>
                    {item.variant && (
                      <p className="text-muted-foreground text-xs">{item.variant}</p>
                    )}
                  </td>
                  <td className="p-3 text-center font-bold text-foreground">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-right text-foreground">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="p-3 text-right font-bold text-foreground">
                    {formatRupiah(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Calculation */}
        <div className="bg-muted p-4 rounded-2xl border-2 border-foreground flex flex-col gap-2 font-body text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal Produk</span>
            <span className="font-bold text-foreground">{formatRupiah(subtotal)}</span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Biaya Pengiriman</span>
            <span className="font-bold text-foreground">{formatRupiah(shippingCost)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Diskon Voucher {voucherCode ? `(${voucherCode})` : ""}</span>
              <span className="font-bold">-{formatRupiah(discountAmount)}</span>
            </div>
          )}

          <div className="border-t-2 border-foreground/20 pt-2.5 mt-1 flex justify-between items-center">
            <span className="font-heading font-bold text-sm text-foreground">
              Total Pembayaran
            </span>
            <span className="font-heading font-bold text-lg text-primary">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-2">
          <Button variant="card" onClick={onClose} size="default" className="w-full sm:w-auto">
            Tutup
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="card"
              onClick={handlePrint}
              size="default"
              className="flex-1 sm:flex-initial flex items-center gap-2"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              Cetak
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              size="default"
              className="flex-1 sm:flex-initial flex items-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Unduh PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

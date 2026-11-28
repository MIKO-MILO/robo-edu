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
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { OrderStatus } from "@/types";

export interface InvoiceItem {
  name: string;
  variant?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export type ReceiptItem = InvoiceItem;

export interface OrderReceiptData {
  orderNumber: string;
  orderDate: string;
  status: string;
  recipientName: string;
  recipientPhone?: string;
  shippingAddress?: string;
  courierName?: string;
  shippingService?: string;
  trackingNumber?: string;
  items: ReceiptItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount?: number;
  voucherCode?: string | null;
  total: number;
  paymentMethod?: string;
}

/**
 * Format plain text receipt / struk kasir tanpa styling dekoratif.
 */
export function generateReceiptText(data: OrderReceiptData): string {
  const formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  // Lebar total 68 karakter agar kolom ke samping muat rapi di PDF A4 (Courier ~8.5pt)
  const width = 68;
  const divider = "=".repeat(width);
  const subDivider = "-".repeat(width);

  const padRight = (text: string, len: number) => {
    const clean = text.length > len ? text.slice(0, len - 1) + "…" : text;
    return clean.padEnd(len, " ");
  };

  const padLeft = (text: string, len: number) => {
    const clean = text.length > len ? text.slice(0, len) : text;
    return clean.padStart(len, " ");
  };

  const lines: string[] = [
    divider,
    "                         ROBOEDU                                    ",
    "               Smart Learning & Robotic Toys                        ",
    "                     www.roboedu.id                                 ",
    divider,
    "STRUK BUKTI PEMESANAN",
    subDivider,
    `No. Pesanan     : ${data.orderNumber}`,
    `Tanggal         : ${data.orderDate}`,
    `Status          : ${data.status}`,
    subDivider,
    "DATA PENERIMA",
    `Nama            : ${data.recipientName}`,
    ...(data.recipientPhone ? [`No. HP          : ${data.recipientPhone}`] : []),
    ...(data.shippingAddress ? [`Alamat          : ${data.shippingAddress}`] : []),
    ...(data.courierName
      ? [`Kurir           : ${data.courierName}${data.shippingService ? ` (${data.shippingService})` : ""}`]
      : []),
    ...(data.trackingNumber ? [`No. Resi        : ${data.trackingNumber}`] : []),
    subDivider,
    "RINCIAN PRODUK",
    subDivider,
    // Header ke samping: No(3) + Spasi(1) + Produk(23) + Spasi(1) + Qty(4) + Spasi(1) + Harga(15) + Spasi(1) + Subtotal(15) = 68
    `${padRight("No", 3)} ${padRight("Produk", 23)} ${padLeft("Qty", 4)} ${padLeft("Harga", 15)} ${padLeft("Subtotal", 15)}`,
    subDivider,
  ];

  data.items.forEach((item, index) => {
    const label = item.variant ? `${item.name} (${item.variant})` : item.name;
    lines.push(
      `${padRight(String(index + 1), 3)} ${padRight(label, 23)} ${padLeft(String(item.quantity), 4)} ${padLeft(formatIDR(item.price), 15)} ${padLeft(formatIDR(item.subtotal), 15)}`
    );
  });

  lines.push(
    subDivider,
    "RINCIAN PEMBAYARAN",
    subDivider,
    `Subtotal Produk       : ${formatIDR(data.subtotal)}`,
    `Ongkos Kirim          : ${formatIDR(data.shippingCost)}`
  );

  if (data.discountAmount && data.discountAmount > 0) {
    lines.push(
      `Diskon Promo${data.voucherCode ? ` (${data.voucherCode})` : ""} : -${formatIDR(data.discountAmount)}`
    );
  }

  lines.push(
    subDivider,
    `TOTAL PEMBAYARAN      : ${formatIDR(data.total)}`,
    subDivider,
    ...(data.paymentMethod ? [`Metode Pembayaran     : ${data.paymentMethod}`] : []),
    divider,
    "            Terima kasih telah berbelanja di RoboEdu!               ",
    "           Simpan struk ini sebagai bukti transaksi.                ",
    divider
  );

  return lines.join("\r\n");
}
/**
 * Membangun buffer file PDF 1.4 murni standar ISO 32000 tanpa library eksternal.
 * Menghasilkan tampilan struk kasir polos dengan font monospaced Courier.
 */
export function buildReceiptPdfBytes(lines: string[]): Uint8Array {
  const sanitize = (str: string) =>
    str
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/[^\x20-\x7E]/g, " ");

  // Standar A4 = 595.28 x 841.89 points
  // Margin kiri: 45pt, Mulai Y: 800pt, Font: Courier 9.5pt, Leading (line height): 13.5pt
  let contentStream = "BT\n/F1 9.5 Tf\n13.5 TL\n45 800 Td\n";
  for (let i = 0; i < lines.length; i++) {
    contentStream += "(" + sanitize(lines[i]) + ") '\n";
  }
  contentStream += "ET\n";

  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(contentStream);
  const streamLen = streamBytes.length;

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] =
    "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";
  objects[5] =
    "<< /Length " + streamLen + " >>\nstream\n" + contentStream + "endstream";

  let out = "%PDF-1.4\n";
  const xref: string[] = [];
  xref[0] = "0000000000 65535 f \n";

  for (let i = 1; i <= 5; i++) {
    const currentOffset = encoder.encode(out).length;
    xref[i] = String(currentOffset).padStart(10, "0") + " 00000 n \n";
    out += i + " 0 obj\n" + objects[i] + "\nendobj\n";
  }

  const startxref = encoder.encode(out).length;
  out +=
    "xref\n0 6\n" +
    xref.join("") +
    "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" +
    startxref +
    "\n%%EOF\n";

  return encoder.encode(out);
}

/**
 * Unduh langsung file invoice berformat PDF standar polos seperti struk biasa.
 */
export function downloadOrderReceiptPdf(data: OrderReceiptData) {
  const receiptText = generateReceiptText(data);
  const lines = receiptText.split(/\r?\n/);
  const pdfBytes = buildReceiptPdfBytes(lines);

  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${data.orderNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Unduh langsung struk pesanan sebagai file .txt tanpa modal popup.
 */
export function downloadOrderReceipt(data: OrderReceiptData) {
  downloadOrderReceiptPdf(data);
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

  const handleDownloadPdf = () => {
    downloadOrderReceiptPdf({
      orderNumber,
      orderDate,
      status,
      recipientName,
      recipientPhone,
      shippingAddress,
      items,
      subtotal,
      shippingCost,
      discountAmount,
      voucherCode,
      total,
      paymentMethod,
    });
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

          <Button
            variant="primary"
            onClick={handleDownloadPdf}
            size="default"
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            Unduh PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

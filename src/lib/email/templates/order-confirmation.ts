import { baseTemplate, emailButton, emailHeading, emailParagraph, emailDivider } from "./base";

export interface OrderItem {
  productNameSnapshot: string;
  variantNameSnapshot: string;
  quantity: number;
  priceSnapshot: number;
  subtotal: number;
}

export interface OrderConfirmationEmailData {
  recipientName: string;
  orderNumber: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  paidAt: Date;
  appUrl: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
  }).format(date) + " WIB";
}

export function orderConfirmationEmailSubject(orderNumber: string): string {
  return `Pesanan ${orderNumber} berhasil dibayar ✅`;
}

export function orderConfirmationEmailHtml(data: OrderConfirmationEmailData): string {
  const firstName = data.recipientName.split(" ")[0];

  const itemRows = data.items
    .map(
      (item) => /* html */ `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;">${item.productNameSnapshot}</p>
          <p style="margin:0;font-size:12px;color:#6b7280;font-family:'Helvetica Neue',Arial,sans-serif;">${item.variantNameSnapshot} × ${item.quantity}</p>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;vertical-align:top;white-space:nowrap;">
          <span style="font-size:14px;font-weight:700;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;">${formatRupiah(item.subtotal)}</span>
        </td>
      </tr>`,
    )
    .join("");

  const fullAddress = [
    data.shippingAddress,
    data.shippingCity,
    data.shippingProvince,
    data.shippingPostalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const content = /* html */ `
    ${emailHeading(`Pembayaran berhasil, ${firstName}! 🎉`)}
    ${emailParagraph("Pesananmu sudah kami terima dan sedang diproses. Berikut ringkasan pesananmu:")}

    <!-- Order number badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="margin-bottom:20px;background-color:#faf6ed;border-radius:12px;border:2px solid #e5e7eb;padding:0;">
      <tr>
        <td style="padding:14px 20px;">
          <span style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">Nomor Pesanan</span><br/>
          <span style="font-size:18px;font-weight:800;color:#f97316;font-family:'Helvetica Neue',Arial,sans-serif;">${data.orderNumber}</span>
        </td>
        <td style="padding:14px 20px;text-align:right;vertical-align:top;">
          <span style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">Tanggal Bayar</span><br/>
          <span style="font-size:13px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">${formatDate(data.paidAt)}</span>
        </td>
      </tr>
    </table>

    <!-- Items table -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="margin-bottom:20px;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
      <thead>
        <tr style="background-color:#f9fafb;">
          <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">Produk</th>
          <th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="margin-bottom:20px;">
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#6b7280;font-family:'Helvetica Neue',Arial,sans-serif;">Subtotal</td>
        <td style="padding:4px 0;text-align:right;font-size:14px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">${formatRupiah(data.subtotal)}</td>
      </tr>
      ${data.discountAmount > 0 ? /* html */ `
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#16a34a;font-family:'Helvetica Neue',Arial,sans-serif;">Diskon Voucher</td>
        <td style="padding:4px 0;text-align:right;font-size:14px;color:#16a34a;font-weight:600;font-family:'Helvetica Neue',Arial,sans-serif;">−${formatRupiah(data.discountAmount)}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:4px 0;font-size:14px;color:#6b7280;font-family:'Helvetica Neue',Arial,sans-serif;">Biaya Pengiriman</td>
        <td style="padding:4px 0;text-align:right;font-size:14px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">${data.shippingCost === 0 ? '<span style="color:#16a34a;font-weight:700;">GRATIS</span>' : formatRupiah(data.shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 4px;font-size:16px;font-weight:800;color:#111827;border-top:2px solid #111827;font-family:'Helvetica Neue',Arial,sans-serif;">Total Pembayaran</td>
        <td style="padding:12px 0 4px;text-align:right;font-size:18px;font-weight:800;color:#f97316;border-top:2px solid #111827;font-family:'Helvetica Neue',Arial,sans-serif;">${formatRupiah(data.total)}</td>
      </tr>
    </table>

    ${emailDivider()}

    <!-- Shipping address -->
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">Dikirim ke</p>
    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;font-family:'Helvetica Neue',Arial,sans-serif;">
      <strong>${data.recipientName}</strong><br/>${fullAddress}
    </p>

    ${emailButton(`${data.appUrl}/profile/orders`, "Lihat Detail Pesanan")}
    ${emailDivider()}
    ${emailParagraph("Terima kasih sudah berbelanja di RoboEdu! Tim kami akan segera memproses pesananmu.", true)}
  `;

  return baseTemplate(
    content,
    `Pesanan ${data.orderNumber} berhasil dibayar — ${formatRupiah(data.total)}`,
  );
}

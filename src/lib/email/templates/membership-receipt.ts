import { baseTemplate, emailHeading, emailParagraph, emailButton, emailDivider } from "./base";

export interface MembershipReceiptEmailData {
  /** Full name of the member. */
  recipientName: string;
  /** Membership purchase number, e.g. "MBR-1234567890-ABC123". */
  purchaseNumber: string;
  /** Plan name snapshot, e.g. "Plus". */
  planName: string;
  /** Price paid in Rupiah (integer). */
  pricePaid: number;
  /** Duration in months. */
  durationMonths: number;
  /** ISO string or Date for when the membership starts. */
  startsAt: Date | string;
  /** ISO string or Date for when the membership expires. */
  endsAt: Date | string;
  /** Payment method, e.g. "gopay". */
  paymentMethod: string | null;
  /** Base URL of the app for CTA links. */
  appUrl: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(d));
}

export function membershipReceiptEmailSubject(purchaseNumber: string): string {
  return `Membership Plus aktif! ${purchaseNumber} ✅`;
}

export function membershipReceiptEmailHtml(
  data: MembershipReceiptEmailData,
): string {
  const firstName = data.recipientName.split(" ")[0];
  const methodLabel = data.paymentMethod
    ? data.paymentMethod
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";

  const content = /* html */ `
    ${emailHeading(`Selamat, ${firstName}! Membership Plus kamu aktif 🎉`)}
    ${emailParagraph(
      "Pembayaranmu telah dikonfirmasi. Mulai sekarang kamu menikmati harga khusus member di seluruh produk RoboEdu.",
    )}

    <!-- Purchase number badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="margin-bottom:20px;background-color:#faf6ed;border-radius:12px;border:2px solid #e5e7eb;">
      <tr>
        <td style="padding:14px 20px;">
          <span style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">Nomor Pembelian</span><br/>
          <span style="font-size:16px;font-weight:800;color:#f97316;font-family:'Helvetica Neue',Arial,sans-serif;">${data.purchaseNumber}</span>
        </td>
        <td style="padding:14px 20px;text-align:right;vertical-align:top;">
          <span style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">Paket</span><br/>
          <span style="font-size:16px;font-weight:800;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;">${data.planName}</span>
        </td>
      </tr>
    </table>

    <!-- Membership details -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="margin-bottom:20px;border-radius:12px;border:1px solid #e5e7eb;">
      <tr style="background-color:#f9fafb;">
        <th colspan="2" style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-family:'Helvetica Neue',Arial,sans-serif;">
          Detail Membership
        </th>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">Nominal Dibayar</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;font-weight:700;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;">${formatRupiah(data.pricePaid)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">Durasi</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;font-weight:700;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;">${data.durationMonths} bulan</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">Metode Pembayaran</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;font-weight:700;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;">${methodLabel}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">Aktif Sejak</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:14px;font-weight:700;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;">${formatDate(data.startsAt)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;">Berlaku Hingga</td>
        <td style="padding:12px 16px;text-align:right;font-size:14px;font-weight:700;color:#16a34a;font-family:'Helvetica Neue',Arial,sans-serif;">${formatDate(data.endsAt)}</td>
      </tr>
    </table>

    ${emailDivider()}
    ${emailParagraph(
      "Nikmati harga member eksklusif di semua produk robotika dan edukasi RoboEdu. " +
        "Cek status membership-mu kapan saja di halaman profil.",
    )}
    ${emailButton("Lihat Status Membership", `${data.appUrl}/profile/reseller`)}
  `;

  return baseTemplate(
    content,
    `Membership Plus kamu aktif hingga ${formatDate(data.endsAt)} — nikmati harga khusus member!`,
  );
}

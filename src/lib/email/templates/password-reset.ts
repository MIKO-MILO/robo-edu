import { baseTemplate, emailButton, emailHeading, emailParagraph, emailDivider } from "./base";

export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function passwordResetEmailSubject(): string {
  return "Reset password RoboEdu kamu";
}

export function passwordResetEmailHtml({ name, resetUrl, expiresInMinutes }: PasswordResetEmailData): string {
  const firstName = name.split(" ")[0];

  const content = /* html */ `
    ${emailHeading("Reset Password")}
    ${emailParagraph(`Hei ${firstName}, kami menerima permintaan untuk mereset password akun RoboEdu kamu.`)}
    ${emailParagraph("Klik tombol di bawah untuk membuat password baru. Link ini hanya berlaku selama <strong>${expiresInMinutes} menit</strong>.".replace("${expiresInMinutes}", String(expiresInMinutes)))}

    ${emailButton(resetUrl, "Reset Password Sekarang")}

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="margin-bottom:20px;background-color:#fff7ed;border-radius:12px;border-left:4px solid #f97316;padding:0;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0;font-size:13px;color:#92400e;font-family:'Helvetica Neue',Arial,sans-serif;">
            ⚠️ <strong>Jika kamu tidak meminta reset password</strong>, abaikan email ini. Password kamu tidak akan berubah.
          </p>
        </td>
      </tr>
    </table>

    ${emailDivider()}

    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-family:'Helvetica Neue',Arial,sans-serif;">
      Jika tombol di atas tidak berfungsi, salin dan tempel link berikut di browser kamu:
    </p>
    <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;font-family:'Courier New',monospace;">
      ${resetUrl}
    </p>
  `;

  return baseTemplate(content, `Reset password RoboEdu kamu — link berlaku ${expiresInMinutes} menit`);
}

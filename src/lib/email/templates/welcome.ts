import { baseTemplate, emailButton, emailHeading, emailParagraph, emailDivider } from "./base";

export interface WelcomeEmailData {
  name: string;
  appUrl: string;
}

export function welcomeEmailSubject(): string {
  return "Selamat datang di RoboEdu! 🎉";
}

export function welcomeEmailHtml({ name, appUrl }: WelcomeEmailData): string {
  const firstName = name.split(" ")[0];

  const content = /* html */ `
    ${emailHeading(`Halo, ${firstName}! Selamat datang di RoboEdu 🤖`)}
    ${emailParagraph("Akun kamu sudah berhasil dibuat. Sekarang kamu bisa menjelajahi ratusan produk robotika dan elektronika edukasi pilihan.")}
    ${emailParagraph("Apa yang bisa kamu lakukan sekarang:")}

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="margin-bottom:20px;background-color:#faf6ed;border-radius:12px;border:1px solid #e5e7eb;padding:4px 0;">
      <tr>
        <td style="padding:12px 20px;">
          <span style="font-size:20px;">🛒</span>
          <span style="font-size:14px;font-weight:600;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;margin-left:10px;">Belanja produk robotika pilihan</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;border-top:1px solid #e5e7eb;">
          <span style="font-size:20px;">❤️</span>
          <span style="font-size:14px;font-weight:600;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;margin-left:10px;">Simpan produk favorit ke wishlist</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;border-top:1px solid #e5e7eb;">
          <span style="font-size:20px;">📍</span>
          <span style="font-size:14px;font-weight:600;color:#374151;font-family:'Helvetica Neue',Arial,sans-serif;margin-left:10px;">Tambah alamat pengiriman di profil</span>
        </td>
      </tr>
    </table>

    ${emailButton(`${appUrl}/product`, "Mulai Belanja Sekarang")}
    ${emailDivider()}
    ${emailParagraph("Butuh bantuan? Kunjungi halaman kontak kami atau balas email ini.", true)}
  `;

  return baseTemplate(content, `Halo ${firstName}, akun RoboEdu kamu sudah siap!`);
}

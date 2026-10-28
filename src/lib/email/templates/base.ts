/**
 * base.ts — shared HTML shell for all transactional emails.
 *
 * All styles are inlined because most email clients (Gmail, Outlook)
 * strip <style> blocks and ignore external stylesheets.
 */

export function baseTemplate(content: string, previewText = ""): string {
  return /* html */ `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>RoboEdu</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preview text (hidden, shown in inbox snippet) -->
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f5f0e8;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;background-color:#ffffff;border-radius:16px;border:2px solid #1a1a1a;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#f97316;padding:28px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;font-family:'Helvetica Neue',Arial,sans-serif;">
                🤖 RoboEdu
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf6ed;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-family:'Helvetica Neue',Arial,sans-serif;">
                © ${new Date().getFullYear()} RoboEdu — Toko Robotika &amp; Edukasi Terpercaya
              </p>
              <p style="margin:0;font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Arial,sans-serif;">
                Email ini dikirim otomatis. Jangan membalas email ini.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/** Reusable styled button link */
export function emailButton(href: string, label: string): string {
  return /* html */ `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:9999px;background-color:#f97316;border:2px solid #1a1a1a;">
      <a href="${href}" target="_blank"
        style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;border-radius:9999px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

/** Reusable heading */
export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111827;font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.3;">${text}</h1>`;
}

/** Reusable paragraph */
export function emailParagraph(text: string, muted = false): string {
  const color = muted ? "#6b7280" : "#374151";
  return `<p style="margin:0 0 16px;font-size:15px;color:${color};line-height:1.6;font-family:'Helvetica Neue',Arial,sans-serif;">${text}</p>`;
}

/** Horizontal divider */
export function emailDivider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`;
}

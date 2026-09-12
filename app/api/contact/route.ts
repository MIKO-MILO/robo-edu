import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { contactMessages } from "@/src/db/schema";
import { sendEmail } from "@/src/lib/email/send";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

const CONTACT_EMAIL =
  process.env.CONTACT_RECEIVER_EMAIL ??
  process.env.EMAIL_FROM ??
  "no-reply@roboedu.id";

/**
 * POST /api/contact
 * Simpan pesan ke tabel contact_messages DAN kirim notifikasi email ke admin.
 * Tidak butuh autentikasi — form kontak boleh diisi siapa saja.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name    = typeof body.name    === "string" ? body.name.trim()                : "";
    const email   = typeof body.email   === "string" ? body.email.trim().toLowerCase() : "";
    const phone   = typeof body.phone   === "string" ? body.phone.trim()               : "";
    const subject = typeof body.subject === "string" ? body.subject.trim()             : "";
    const message = typeof body.message === "string" ? body.message.trim()             : "";

    // ── Validasi ─────────────────────────────────────────────────────
    if (!name || name.length > 150) {
      return NextResponse.json({ success: false, message: "Nama tidak valid." }, { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Email tidak valid." }, { status: 400 });
    }
    if (!subject || subject.length > 255) {
      return NextResponse.json({ success: false, message: "Topik tidak valid." }, { status: 400 });
    }
    if (!message || message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { success: false, message: "Pesan harus antara 10–5000 karakter." },
        { status: 400 },
      );
    }

    // Ambil userId kalau user sedang login (opsional)
    const userId = await getSessionUserId().catch(() => null);

    // ── Simpan ke database ───────────────────────────────────────────
    const id = crypto.randomUUID();
    await db.insert(contactMessages).values({
      id,
      userId: userId ?? null,
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: "UNREAD",
    });

    // ── Kirim email notifikasi ke admin (non-fatal) ──────────────────
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">📬 Pesan Baru dari Contact Form</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#6b7280;width:120px;vertical-align:top;">Nama</td><td style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Email</td><td style="padding:8px 0;color:#111827;"><a href="mailto:${escapeHtml(email)}" style="color:#f97316;">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">No. HP/WA</td><td style="padding:8px 0;color:#111827;">${escapeHtml(phone)}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Topik</td><td style="padding:8px 0;color:#111827;">${escapeHtml(subject)}</td></tr>
          ${userId ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">User ID</td><td style="padding:8px 0;color:#6b7280;font-size:12px;">${escapeHtml(userId)}</td></tr>` : ""}
        </table>
        <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:6px;border-left:4px solid #f97316;">
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Pesan</p>
          <p style="margin:0;font-size:14px;color:#111827;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">ID Pesan: ${id} · ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</p>
      </div>
    `;

    void sendEmail({
      to: CONTACT_EMAIL,
      subject: `[RoboEdu Contact] ${subject} — dari ${name}`,
      html,
      type: "OTHER",
      userId: userId ?? null,
    });

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil dikirim. Tim kami akan merespons dalam 1×24 jam.",
    });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim pesan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

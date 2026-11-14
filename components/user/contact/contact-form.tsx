"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { ContactMessageRequestBody } from "@/types";

const SUBJECT_OPTIONS = [
  "Pertanyaan Produk & Eksperimen",
  "Pesanan Sekolah / Institusi / Komunitas",
  "Pengajuan Status Reseller",
  "Bantuan Garansi & Suku Cadang",
  "Lainnya",
];

/** Reusable form field label — DRY */
function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="font-body font-bold text-xs text-foreground">
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactMessageRequestBody>({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill dari data user yang login
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const json = await res.json();
        const user = json.data;
        if (!user) return;
        setFormData((prev) => ({
          ...prev,
          name:  user.name  ?? prev.name,
          email: user.email ?? prev.email,
          phone: user.phone ?? prev.phone,
        }));
      } catch { /* tidak login — abaikan */ }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) { setErrorMessage("Mohon masukkan nama lengkap Anda."); return; }
    if (!formData.email.trim() || !formData.email.includes("@")) { setErrorMessage("Mohon masukkan alamat email yang valid."); return; }
    if (!formData.message.trim()) { setErrorMessage("Mohon tuliskan pesan atau pertanyaan Anda."); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) { setErrorMessage(result.message ?? "Gagal mengirim pesan. Silakan coba lagi."); return; }
      setIsSubmitted(true);
    } catch {
      setErrorMessage("Gagal mengirim pesan. Periksa koneksi internet Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({ name: "", email: "", phone: "", subject: SUBJECT_OPTIONS[0], message: "" });
    setIsSubmitted(false);
    setErrorMessage("");
  };

  // ── Success state ────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-16 px-6 border-2 border-foreground rounded-2xl bg-card">
        <div className="w-14 h-14 rounded-2xl bg-accent-green border-2 border-foreground flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-heading font-bold text-xl text-foreground">Pesan Berhasil Dikirim!</h3>
          <p className="font-body text-sm text-muted-foreground max-w-sm">
            Tim kami akan merespons ke{" "}
            <strong className="text-foreground">{formData.email}</strong>{" "}
            dalam 1×24 jam.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetForm} className="border-2 border-foreground rounded-xl font-bold text-xs">
          Kirim Pesan Lain
        </Button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center px-3 py-1 rounded-full border-2 border-foreground bg-accent-yellow font-body font-bold text-xs text-foreground">
          Kirim Pesan
        </span>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight">
          Atau Kirim Pesan!
        </h2>
        <p className="font-body text-xs text-muted-foreground">
          Isi formulir di bawah dan kami akan menghubungi kamu secepatnya.
        </p>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="bg-accent-peach border-2 border-foreground rounded-xl p-4 flex items-center gap-3 text-danger font-body text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nama */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="contact-name" required>Nama Lengkap</FieldLabel>
          <Input
            id="contact-name" name="name" type="text" placeholder="Contoh: Budi Santoso"
            value={formData.name} onChange={handleChange} required
            className="border-2 border-foreground rounded-xl h-11 font-body text-sm bg-card focus-visible:ring-primary"
          />
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="contact-email" required>Email</FieldLabel>
            <Input
              id="contact-email" name="email" type="email" placeholder="budi@example.com"
              value={formData.email} onChange={handleChange} required
              className="border-2 border-foreground rounded-xl h-11 font-body text-sm bg-card focus-visible:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="contact-phone">Nomor WhatsApp / HP</FieldLabel>
            <Input
              id="contact-phone" name="phone" type="tel" placeholder="081234567890"
              value={formData.phone} onChange={handleChange}
              className="border-2 border-foreground rounded-xl h-11 font-body text-sm bg-card focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="contact-subject" required>Topik Pertanyaan</FieldLabel>
          <select
            id="contact-subject" name="subject"
            value={formData.subject} onChange={handleChange}
            className="w-full h-11 border-2 border-foreground rounded-xl bg-card text-foreground font-body text-sm px-4 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {SUBJECT_OPTIONS.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="contact-message" required>Pesan Anda</FieldLabel>
          <textarea
            id="contact-message" name="message" rows={5}
            placeholder="Tuliskan pertanyaan, masukan, atau detail kebutuhan pesanan Anda..."
            value={formData.message} onChange={handleChange} required
            className="w-full border-2 border-foreground rounded-xl bg-card text-foreground font-body text-sm p-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit" disabled={isSubmitting}
            className="font-heading font-bold text-sm px-7 py-3 rounded-xl inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary-600 border-2 border-foreground"
          >
            {isSubmitting ? (
              <><Spinner className="w-4 h-4 text-white" /><span>Mengirim...</span></>
            ) : (
              <><Send className="w-4 h-4" /><span>Kirim Pesan</span></>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

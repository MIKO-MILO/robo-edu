"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ContactMessageRequestBody } from "@/types";

const SUBJECT_OPTIONS = [
  "Pertanyaan Produk & Eksperimen",
  "Pesanan Sekolah / Institusi / Komunitas",
  "Pengajuan Status Membership",
  "Bantuan Garansi & Suku Cadang",
  "Lainnya",
] as const;

const FIELD_CLASS =
  "w-full bg-[var(--color-contact-input)] border-0 rounded-xl text-foreground font-body text-sm px-4 shadow-none placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors";
function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
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

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const json = await res.json();
        const user = json?.data;
        if (!user || !isMounted) return;

        setFormData((prev) => ({
          ...prev,
          name: user.name ?? prev.name,
          email: user.email ?? prev.email,
          phone: user.phone ?? prev.phone,
        }));
      } catch {
        // Pengguna tamu (tidak login)
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Mohon masukkan nama lengkap Anda.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Mohon masukkan alamat email yang valid.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage("Mohon tuliskan pesan atau pertanyaan Anda.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.message ?? "Gagal mengirim pesan. Silakan coba lagi.");
        return;
      }
      setIsSubmitted(true);
    } catch {
      setErrorMessage("Gagal mengirim pesan. Periksa koneksi internet Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: SUBJECT_OPTIONS[0],
      message: "",
    });
    setIsSubmitted(false);
    setErrorMessage("");
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-14 px-6 rounded-3xl bg-card shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-accent-green flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="font-heading font-bold text-xl text-foreground">
            Pesan Berhasil Dikirim!
          </h3>
          <p className="font-body text-sm text-muted-foreground max-w-sm">
            Tim kami akan merespons ke{" "}
            <strong className="text-foreground">{formData.email}</strong> dalam 1×24 jam.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          neo={false}
          onClick={handleResetForm}
          className="rounded-xl font-bold text-xs bg-muted hover:bg-muted/80"
        >
          Kirim Pesan Lain
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {errorMessage && (
        <div className="bg-accent-peach rounded-2xl p-4 flex items-center gap-3 text-danger font-body text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="contact-name" required>
            Nama Lengkap
          </FieldLabel>
          <Input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Contoh: Budi Santoso"
            value={formData.name}
            onChange={handleChange}
            required
            className={cn(FIELD_CLASS, "h-11")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="contact-email" required>
              Email
            </FieldLabel>
            <Input
              id="contact-email"
              name="email"
              type="email"
              placeholder="budi@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={cn(FIELD_CLASS, "h-11")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="contact-phone">Nomor WhatsApp / HP</FieldLabel>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              placeholder="081234567890"
              value={formData.phone}
              onChange={handleChange}
              className={cn(FIELD_CLASS, "h-11")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="contact-subject" required>
            Topik Pertanyaan
          </FieldLabel>
          <select
            id="contact-subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={cn(FIELD_CLASS, "h-11 cursor-pointer")}
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="contact-message" required>
            Pesan Anda
          </FieldLabel>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder="Tuliskan pertanyaan, masukan, atau detail kebutuhan pesanan Anda..."
            value={formData.message}
            onChange={handleChange}
            required
            className={cn(FIELD_CLASS, "p-4 resize-none")}
          />
        </div>

        <div className="flex justify-end mt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            neo={false}
            className="font-heading font-bold text-sm px-7 py-3 rounded-xl inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner className="w-4 h-4 text-primary-foreground" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Pesan</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
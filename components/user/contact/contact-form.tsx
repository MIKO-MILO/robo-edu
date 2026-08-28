"use client";

import React, { useState } from "react";
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch {
      setIsSubmitting(false);
      setErrorMessage("Gagal mengirim pesan. Silakan coba lagi beberapa saat lagi.");
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
      <div className="bg-card border-2 border-foreground rounded-[28px] p-8 sm:p-10 neo-shadow flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-accent-green border-2 border-foreground flex items-center justify-center neo-shadow-icon">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-heading font-bold text-2xl text-foreground">
            Pesan Berhasil Dikirim!
          </h3>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md">
            Terima kasih telah menghubungi RoboEdu. Tim kami akan merespon via email <strong className="text-foreground">{formData.email}</strong> dalam 1x24 jam.
          </p>
        </div>

        <Button
          variant="card"
          size="lg"
          neo
          onClick={handleResetForm}
          className="font-bold text-sm"
        >
          Kirim Pesan Lain
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-foreground rounded-[28px] p-6 sm:p-8 neo-shadow flex flex-col gap-5">
      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-accent-peach border-2 border-foreground rounded-2xl p-4 flex items-center gap-3 text-danger font-body text-xs sm:text-sm font-semibold neo-shadow-icon">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Controls */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-name"
            className="font-body font-bold text-xs sm:text-sm text-foreground"
          >
            Nama Lengkap <span className="text-danger">*</span>
          </label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Contoh: Budi Santoso"
            value={formData.name}
            onChange={handleChange}
            required
            className="border-2 border-foreground rounded-full h-11 bg-[#ECEAE6] text-foreground placeholder:text-muted-foreground/70 font-body text-sm px-4 focus:ring-0 focus:border-primary"
          />
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contact-email"
              className="font-body font-bold text-xs sm:text-sm text-foreground"
            >
              Email <span className="text-danger">*</span>
            </label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              placeholder="budi@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-2 border-foreground rounded-full h-11 bg-[#ECEAE6] text-foreground placeholder:text-muted-foreground/70 font-body text-sm px-4 focus:ring-0 focus:border-primary"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contact-phone"
              className="font-body font-bold text-xs sm:text-sm text-foreground"
            >
              Nomor WhatsApp / HP
            </label>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              placeholder="081234567890"
              value={formData.phone}
              onChange={handleChange}
              className="border-2 border-foreground rounded-full h-11 bg-[#ECEAE6] text-foreground placeholder:text-muted-foreground/70 font-body text-sm px-4 focus:ring-0 focus:border-primary"
            />
          </div>
        </div>

        {/* Subjek / Topik */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-subject"
            className="font-body font-bold text-xs sm:text-sm text-foreground"
          >
            Topik Pertanyaan <span className="text-danger">*</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full h-11 border-2 border-foreground rounded-full bg-[#ECEAE6] text-foreground font-body text-sm px-4 focus:outline-none focus:border-primary cursor-pointer"
          >
            {SUBJECT_OPTIONS.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Pesan */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-message"
            className="font-body font-bold text-xs sm:text-sm text-foreground"
          >
            Pesan Anda <span className="text-danger">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            placeholder="Tuliskan pertanyaan, masukan, atau detail kebutuhan pesanan Anda..."
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border-2 border-foreground rounded-[20px] bg-[#ECEAE6] text-foreground placeholder:text-muted-foreground/70 font-body text-sm p-4 focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          neo
          disabled={isSubmitting}
          className="w-full font-heading font-bold text-sm sm:text-base mt-2 py-4 rounded-full"
        >
          {isSubmitting ? (
            <>
              <Spinner className="w-5 h-5 text-white" />
              <span>Mengirim Pesan...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Kirim Pesan Sekarang</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

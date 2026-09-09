"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message ?? "Terjadi kesalahan.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      aria-label="Reset password"
      className="w-full max-w-md bg-card border-2 border-border neo-shadow rounded-none p-8 md:p-10"
    >
      <Link
        href="/login"
        className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke login
      </Link>

      {submitted ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full bg-accent-green border-2 border-border flex items-center justify-center">
            <MailCheck className="w-7 h-7 text-foreground" />
          </div>
          <h1
            className="font-heading font-bold text-2xl text-foreground"
          >
            Cek email kamu
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-xs">
            Jika email <span className="font-semibold text-foreground">{email}</span> terdaftar, kami sudah mengirimkan link reset password. Link berlaku selama 60 menit.
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Tidak menerima email? Cek folder spam, atau{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-primary font-bold hover:underline"
            >
              coba lagi
            </button>
            .
          </p>
        </div>
      ) : (
        /* ── Form state ── */
        <>
          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
            Lupa password?
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Masukkan email akun kamu dan kami akan mengirimkan link untuk membuat password baru.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-email"
                className="block font-body font-bold text-sm text-foreground"
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email kamu"
                className="w-full bg-muted text-foreground border-2 border-border rounded-none px-3 py-2.5 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-primary transition-colors duration-150"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-danger font-medium">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              neo
              disabled={isLoading}
              className="w-full rounded-lg uppercase tracking-wide font-body font-bold text-sm"
            >
              {isLoading ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
          </form>

          <p className="text-center mt-6 font-body text-sm text-muted-foreground">
            Ingat password?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Masuk
            </Link>
          </p>
        </>
      )}
    </main>
  );
}

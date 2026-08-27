"use client";

// Register Page Component - Roboedu Auth Group

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RegisterRequestBody } from "@/types/user";

// ── Google SVG Icon ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ── Decorative dot-grid pattern ───────────────────────────────────────────────
function DotGrid() {
  return (
    <div
      className="absolute inset-0 z-0 opacity-20 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(#3D2900 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
      aria-hidden="true"
    />
  );
}

// ── Page Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  // RegisterRequestBody: { name, email, password, phone? }
  const [form, setForm] = useState<RegisterRequestBody>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreedToTerms) return;
    setIsLoading(true);
    // TODO: wire up to POST /auth/register (api.md §2)
    console.log("Register payload:", form);
    setIsLoading(false);
  }

  function handleGoogleSignUp() {
    // TODO: wire up to OAuth flow
    console.log("Sign up with Google");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      {/* ── Card Shell ── */}
      <main
        aria-label="Daftar akun Roboedu"
        className="w-full max-w-5xl flex flex-col md:flex-row bg-card border-2 border-border neo-shadow overflow-hidden"
      >
        {/* ════════════════════════════════════════════
            LEFT — Image canvas (hidden on mobile)
            ════════════════════════════════════════════ */}
        <section
          aria-hidden="true"
          className="
            hidden md:flex
            w-1/2
            relative overflow-hidden
            flex-col justify-end
            bg-accent-pink
            border-r-2 border-border
            min-h-[560px]
          "
        >
          {/* Dot grid decorative background */}
          <DotGrid />

          {/* Team photo — mix-blend-multiply agar warna card-pink tetap dominan */}
          <Image
            src="/images/[Sinergi dan Komitmen Bersama Roboedu Team]Rangkaian profil yang telah ditampilkan merupakan sa.webp"
            alt="Tim Roboedu"
            fill
            className="object-cover object-center mix-blend-multiply opacity-80 z-10"
            priority
            sizes="50vw"
          />

          {/* Corner decorative badges */}
          <div className="absolute top-4 left-4 z-20 w-8 h-8 bg-card rounded-full border-2 border-border neo-shadow-icon flex items-center justify-center">
            {/* Gear icon — using unicode ⚙ since Material Symbols is not loaded in Next.js */}
            <span className="text-foreground text-xs leading-none select-none">⚙</span>
          </div>
          <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-card rounded-full border-2 border-border neo-shadow-icon flex items-center justify-center">
            <span className="text-foreground text-xs leading-none select-none">◈</span>
          </div>

          {/* Tagline overlay — sits above the image */}
          <div className="relative z-20 p-8">
            <p className="font-body text-sm text-foreground/70 uppercase tracking-widest mb-2">
              Platform Robotika Edukasi
            </p>
            <h1
              className="break-words leading-none tracking-tight uppercase"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 4.5vw, 4rem)",
                fontWeight: 800,
                color: "var(--color-foreground)",
                textShadow: "2px 2px 0px rgba(255,255,255,0.4)",
              }}
            >
              BUILD.<br />
              LEARN.<br />
              CREATE.
            </h1>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            RIGHT — Register form
            ════════════════════════════════════════════ */}
        <section className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-card">
          {/* ── Header ── */}
          <div className="mb-8 text-center flex flex-col items-center">
            {/* Brand badge */}
            {/* <div className="w-16 h-16 bg-primary mb-4 rounded-full border-2 border-border neo-shadow-icon flex items-center justify-center">
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.625rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.04em",
                }}
              >
                RE
              </span>
            </div> */}
            {/* Brand name */}
            {/* <p
              className="uppercase"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                fontWeight: 700,
                color: "var(--color-foreground)",
                letterSpacing: "0.05em",
              }}
            >
              RoboEdu
            </p> */}

            {/* Page title */}
            <h2
              className="uppercase mt-2"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "var(--color-foreground)",
              }}
            >
              Create Account
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Bergabunglah dan mulai perjalanan robotikamu.
            </p>
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4 w-full max-w-sm mx-auto"
          >
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-name"
                className="font-body font-bold text-sm text-foreground"
              >
                Nama Lengkap
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Ada Lovelace"
                className="
                  w-full
                  bg-muted text-foreground
                  border-2 border-border
                  rounded-none
                  px-3 py-2.5
                  font-body text-sm
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-0 focus:border-primary
                  transition-colors duration-150
                "
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-email"
                className="font-body font-bold text-sm text-foreground"
              >
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="ada@roboedu.com"
                className="
                  w-full
                  bg-muted text-foreground
                  border-2 border-border
                  rounded-none
                  px-3 py-2.5
                  font-body text-sm
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-0 focus:border-primary
                  transition-colors duration-150
                "
              />
            </div>

            {/* Password */}
            {/* <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-password"
                className="font-body font-bold text-sm text-foreground"
              >
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="
                  w-full
                  bg-muted text-foreground
                  border-2 border-border
                  rounded-none
                  px-3 py-2.5
                  font-body text-sm
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-0 focus:border-primary
                  transition-colors duration-150
                "
              />
            </div> */}

            {/* Phone (optional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-phone"
                className="font-body font-bold text-sm text-foreground"
              >
                No. HP{" "}
                <span className="font-normal text-muted-foreground">(opsional)</span>
              </label>
              <input
                id="register-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone ?? ""}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="
                  w-full
                  bg-muted text-foreground
                  border-2 border-border
                  rounded-none
                  px-3 py-2.5
                  font-body text-sm
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-0 focus:border-primary
                  transition-colors duration-150
                "
              />
            </div>

            {/* Terms & Conditions */}
            <label
              htmlFor="register-terms"
              className="flex items-start gap-2 mt-1 cursor-pointer select-none"
            >
              <input
                id="register-terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="
                  mt-0.5 w-4 h-4 shrink-0
                  bg-muted
                  border-2 border-border
                  rounded-none
                  accent-primary
                  cursor-pointer
                  focus:ring-0
                "
              />
              <span className="font-body text-xs text-muted-foreground leading-snug">
                Saya menyetujui{" "}
                <Link
                  href="/terms"
                  className="text-primary font-bold hover:underline"
                >
                  Syarat dan Ketentuan
                </Link>{" "}
                Roboedu.
              </span>
            </label>

            {/* Primary CTA — Sign Up */}
            <Button
              id="btn-register-submit"
              type="submit"
              variant="primary"
              size="lg"
              neo
              disabled={isLoading || !agreedToTerms}
              className="w-full rounded-none uppercase tracking-wide font-body font-bold text-sm mt-2"
            >
              {isLoading ? "Mendaftar…" : "Daftar"}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t-2 border-border" />
              <span className="mx-4 font-body text-xs text-muted-foreground uppercase shrink-0">
                atau
              </span>
              <div className="flex-grow border-t-2 border-border" />
            </div>

            {/* Secondary CTA — Google */}
            <Button
              id="btn-register-google"
              type="button"
              variant="default"
              size="lg"
              neo
              onClick={handleGoogleSignUp}
              className="w-full rounded-none font-body font-bold text-sm gap-3"
            >
              <GoogleIcon />
              Daftar dengan Google
            </Button>

            {/* Footer link */}
            <p className="text-center font-body text-sm text-muted-foreground mt-2">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline"
              >
                Masuk sekarang
              </Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}

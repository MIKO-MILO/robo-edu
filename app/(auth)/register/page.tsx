"use client";

// Register Page Component - Roboedu Auth Group

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [form, setForm] = useState<RegisterRequestBody>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // true = pernah mulai ketik password (baru tampilkan indikator)
  const [passwordTouched, setPasswordTouched] = useState(false);
  const router = useRouter();

  const passwordValid = form.password.length >= 8;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password" && !passwordTouched) setPasswordTouched(true);
    if (error) setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreedToTerms) return;
    if (!passwordValid) {
      setError("Password harus minimal 8 karakter.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? "Pendaftaran gagal.");
        return;
      }

      router.replace("/login?registered=1");
    } catch {
      setError("Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSignUp() {
    // TODO: wire up to OAuth flow
    console.log("Sign up with Google");
  }

  // Kelas border password — hanya aktif setelah user mulai mengetik
  const passwordBorderClass = passwordTouched
    ? passwordValid
      ? "border-green-500 focus:border-green-500"
      : "border-red-500 focus:border-red-500"
    : "border-border focus:border-primary";

  return (
    <>
      {/* ── Card Shell ── */}
      <main
        aria-label="Daftar akun Roboedu"
        className="w-full max-w-5xl flex flex-col md:flex-row md:h-[80vh] bg-card border-2 border-border neo-shadow overflow-hidden"
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
            min-h-140
          "
        >
          {/* Dot grid decorative background */}
          <DotGrid />

          {/* Team photo */}
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
            <span className="text-foreground text-xs leading-none select-none">⚙</span>
          </div>
          <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-card rounded-full border-2 border-border neo-shadow-icon flex items-center justify-center">
            <span className="text-foreground text-xs leading-none select-none">◈</span>
          </div>

          {/* Tagline overlay */}
          <div className="relative z-20 p-8">
            <p className="font-body text-sm text-foreground/70 uppercase tracking-widest mb-2">
              Platform Robotika Edukasi
            </p>
            <h1
              className="wrap-break-word leading-none tracking-tight uppercase"
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
        <section className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-card overflow-y-auto">
          {/* ── Header ── */}
          <div className="mb-8 text-center flex flex-col items-center">
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
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-password"
                className="font-body font-bold text-sm text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`
                    w-full
                    bg-muted text-foreground
                    border-2
                    rounded-none
                    px-3 py-2.5 pr-10
                    font-body text-sm
                    placeholder:text-muted-foreground
                    focus:outline-none focus:ring-0
                    transition-colors duration-150
                    ${passwordBorderClass}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Indikator panjang password — muncul setelah user mulai mengetik */}
              {passwordTouched && (
                <p
                  className={`font-body text-xs flex items-center gap-1 ${
                    passwordValid ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordValid ? (
                    <>
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Password sudah memenuhi syarat
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Password minimal 8 karakter ({form.password.length}/8)
                    </>
                  )}
                </p>
              )}
            </div>

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
                type="number"
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

            {/* Error message */}
            {error && (
              <p
                role="alert"
                className="flex items-center gap-1.5 font-body text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}

            {/* Primary CTA — Sign Up */}
            <Button
              id="btn-register-submit"
              type="submit"
              variant="primary"
              size="lg"
              neo
              disabled={isLoading || !agreedToTerms}
              className="w-full rounded-lg uppercase tracking-wide font-body font-bold text-sm mt-2"
            >
              {isLoading ? "Mendaftar…" : "Daftar"}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="grow border-t-2 border-border" />
              <span className="mx-4 font-body text-xs text-muted-foreground uppercase shrink-0">
                atau
              </span>
              <div className="grow border-t-2 border-border" />
            </div>

            {/* Secondary CTA — Google */}
            <Button
              id="btn-register-google"
              type="button"
              variant="default"
              size="lg"
              neo
              onClick={handleGoogleSignUp}
              className="w-full rounded-lg font-body font-bold text-sm gap-3"
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
    </>
  );
}

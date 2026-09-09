"use client";

// Login Page Component - Roboedu Auth Group

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { LoginRequestBody } from "@/types/user";

// ── Google SVG Icon ──────────────────────────────────────────────────────────
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

// ── Page Component ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [form, setForm] = useState<LoginRequestBody>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Per-field errors untuk validasi kosong
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  // Tandai field mana yang perlu border merah saat salah credentials
  const [credentialError, setCredentialError] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Hapus error field saat user mengetik
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Hapus credential error saat user mengetik
    if (credentialError) setCredentialError(false);
    if (error) setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCredentialError(false);

    // Validasi kosong sebelum hit API
    const newFieldErrors = { email: "", password: "" };
    if (!form.email.trim()) newFieldErrors.email = "Email wajib diisi.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newFieldErrors.email = "Format email tidak valid.";
    if (!form.password) newFieldErrors.password = "Password wajib diisi.";

    if (newFieldErrors.email || newFieldErrors.password) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rememberMe }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? "Email atau password salah.");
        setCredentialError(true);
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/") ? next : "/");
      router.refresh();
    } catch {
      setError("Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSignIn() {
    // TODO: wire up to OAuth flow
    console.log("Sign in with Google");
  }

  return (
    <>
      {/* ── Card Shell ── */}
      <main
        aria-label="Login ke akun Roboedu"
        className="w-full max-w-5xl flex flex-col md:flex-row md:h-[80vh] bg-card border-2 border-border neo-shadow overflow-hidden rounded-none"
      >
        {/* ════════════════════════════════════════════
            LEFT — Image canvas
            ════════════════════════════════════════════ */}
        <div
          className="
            w-full md:w-1/2
            relative overflow-hidden
            flex flex-col justify-between
            bg-accent-soft-blue
            border-b-2 md:border-b-0 md:border-r-2 border-border
            min-h-80 md:min-h-0
            p-8
          "
        >
          {/* Background team photo */}
          <Image
            src="/images/[Sinergi dan Komitmen Bersama Roboedu Team]Rangkaian profil yang telah ditampilkan merupakan sa.webp"
            alt="Tim Roboedu yang berkomitmen memberikan pengalaman belajar robotika terbaik"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Gradient overlay — bottom-to-top so headline is readable */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(36,131,208,0.85) 0%, rgba(36,131,208,0.35) 50%, rgba(36,131,208,0.10) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Logo mark — top-left */}
          <div className="relative z-20 self-start">
            <Link href="/" aria-label="Kembali ke beranda Roboedu">
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                }}
              >
                roboedu
              </span>
            </Link>
          </div>

          {/* Tagline — bottom-left */}
          <div className="relative z-20 self-start mt-auto">
            <p className="text-white/80 font-body text-sm mb-2 uppercase tracking-widest">
              Platform Robotika Edukasi
            </p>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                textShadow: "2px 2px 0px rgba(0,0,0,0.25)",
              }}
            >
              BUILD.<br />
              LEARN.<br />
              CREATE.
            </h1>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT — Login form
            ════════════════════════════════════════════ */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-card overflow-y-auto">
          {/* ── Header ── */}
          <div className="text-center mb-8">
            <h2
              className="uppercase mb-2"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "24px",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--color-foreground)",
              }}
            >
              Welcome
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Masukkan email dan password untuk mengakses akunmu
            </p>
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 w-full max-w-sm mx-auto"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block font-body font-bold text-sm text-foreground"
              >
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan email kamu"
                className={`
                  w-full
                  bg-muted text-foreground
                  border-2
                  rounded-none
                  px-3 py-2.5
                  font-body text-sm
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-0
                  transition-colors duration-150
                  ${fieldErrors.email || credentialError ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}
                `}
              />
              {fieldErrors.email && (
                <p className="font-body text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block font-body font-bold text-sm text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password kamu"
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
                    ${fieldErrors.password || credentialError ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}
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
              {fieldErrors.password && (
                <p className="font-body text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>

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

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-remember"
                className="flex items-center gap-2 cursor-pointer font-body text-xs text-foreground select-none"
              >
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="
                    w-4 h-4
                    bg-muted
                    border-2 border-border
                    rounded-none
                    accent-primary
                    cursor-pointer
                    focus:ring-0
                  "
                />
                Ingat saya
              </label>

              <Link
                href="/forgot-password"
                className="font-body font-bold text-xs text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            {/* Primary CTA — Sign In */}
            <Button
              id="btn-login-submit"
              type="submit"
              variant="primary"
              size="lg"
              neo
              disabled={isLoading}
              className="w-full rounded-lg uppercase tracking-wide font-body font-bold text-sm"
            >
              {isLoading ? "Masuk…" : "Masuk"}
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
              id="btn-login-google"
              type="button"
              variant="default"
              size="lg"
              neo
              onClick={handleGoogleSignIn}
              className="w-full rounded-lg font-body font-bold text-sm gap-3"
            >
              <GoogleIcon />
              Masuk dengan Google
            </Button>
          </form>

          {/* ── Footer link ── */}
          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

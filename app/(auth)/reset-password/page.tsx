"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Link reset password tidak valid atau sudah kedaluwarsa.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message ?? "Terjadi kesalahan.");
        return;
      }
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-accent-green border-2 border-border flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-foreground" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Password berhasil diubah!
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          Kamu akan diarahkan ke halaman login dalam beberapa detik...
        </p>
        <Link href="/login" className="text-primary font-bold text-sm hover:underline font-body">
          Login sekarang
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-danger-bg border-2 border-border flex items-center justify-center">
          <XCircle className="w-7 h-7 text-danger" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Link tidak valid
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          Link reset password ini tidak valid atau sudah kedaluwarsa.
        </p>
        <Link href="/forgot-password" className="text-primary font-bold text-sm hover:underline font-body">
          Minta link baru
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
        Buat password baru
      </h1>
      <p className="font-body text-sm text-muted-foreground mb-8">
        Masukkan password baru untuk akunmu. Minimal 8 karakter.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="reset-password"
            className="block font-body font-bold text-sm text-foreground"
          >
            Password Baru
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full bg-muted text-foreground border-2 border-border rounded-none px-3 py-2.5 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-primary transition-colors duration-150"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="reset-confirm"
            className="block font-body font-bold text-sm text-foreground"
          >
            Konfirmasi Password
          </label>
          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ulangi password baru"
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
          {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main
      aria-label="Buat password baru"
      className="w-full max-w-md bg-card border-2 border-border neo-shadow rounded-none p-8 md:p-10"
    >
      <Suspense fallback={<p className="font-body text-sm text-muted-foreground">Memuat...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

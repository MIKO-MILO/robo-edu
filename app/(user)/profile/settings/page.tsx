"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const newPasswordValid = form.newPassword.length >= 8;
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.newPassword === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  }

  function toggleShow(field: keyof typeof show) {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword) {
      setError("Password saat ini wajib diisi.");
      return;
    }
    if (!newPasswordValid) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (passwordsMismatch || !form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message ?? "Gagal memperbarui password.");
        return;
      }
      setSuccess(result.message ?? "Password berhasil diperbarui.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-foreground flex items-center justify-center neo-shadow-icon">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-xl text-foreground">Password & Keamanan</h2>
          <p className="font-body text-sm text-muted-foreground">
            Pastikan akun kamu menggunakan password yang kuat dan unik.
          </p>
        </div>
      </div>

      <div className="bg-card border-2 border-foreground rounded-2xl neo-shadow p-6 sm:p-8 max-w-md">
        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 font-body text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 font-body text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Password saat ini */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="currentPassword" className="font-body font-bold text-sm text-foreground">
              Password Saat Ini <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={show.currentPassword ? "text" : "password"}
                placeholder="Masukkan password saat ini"
                value={form.currentPassword}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleShow("currentPassword")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={show.currentPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {show.currentPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          {/* Password baru */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="font-body font-bold text-sm text-foreground">
              Password Baru <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={show.newPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={form.newPassword}
                onChange={handleChange}
                className={`pr-10 ${
                  form.newPassword.length > 0
                    ? newPasswordValid
                      ? "border-green-500 focus-visible:ring-green-300"
                      : "border-red-500 focus-visible:ring-red-300"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShow("newPassword")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={show.newPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {show.newPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>
            {form.newPassword.length > 0 && (
              <p className={`font-body text-xs flex items-center gap-1 ${newPasswordValid ? "text-green-600" : "text-red-500"}`}>
                {newPasswordValid
                  ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Password sudah memenuhi syarat</>
                  : <><AlertCircle className="w-3.5 h-3.5 shrink-0" /> Password minimal 8 karakter ({form.newPassword.length}/8)</>
                }
              </p>
            )}
          </div>

          {/* Konfirmasi password baru */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="font-body font-bold text-sm text-foreground">
              Konfirmasi Password Baru <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={show.confirmPassword ? "text" : "password"}
                placeholder="Ulangi password baru"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`pr-10 ${
                  form.confirmPassword.length > 0
                    ? passwordsMatch
                      ? "border-green-500 focus-visible:ring-green-300"
                      : "border-red-500 focus-visible:ring-red-300"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShow("confirmPassword")}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={show.confirmPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {show.confirmPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>
            {form.confirmPassword.length > 0 && (
              <p className={`font-body text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                {passwordsMatch
                  ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Password cocok</>
                  : <><AlertCircle className="w-3.5 h-3.5 shrink-0" /> Password tidak cocok</>
                }
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            neo
            disabled={isLoading}
            className="w-full mt-2 font-body font-bold"
          >
            {isLoading ? "Menyimpan..." : "Perbarui Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

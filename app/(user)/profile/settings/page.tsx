"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileField } from "@/components/user/profile/profile-field";

type SaveState = "idle" | "saving" | "success" | "error";

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">
        {label} <span className="text-danger">*</span>
      </label>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
          className={`w-full bg-primary-100/30 border rounded-md px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
            error ? "border-red-400 focus-visible:ring-red-400" : "border-primary-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Sembunyikan" : "Tampilkan"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [serverMessage, setServerMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (saveState !== "idle") setSaveState("idle");
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.currentPassword) errors.currentPassword = "Password saat ini wajib diisi.";
    if (!form.newPassword) errors.newPassword = "Password baru wajib diisi.";
    else if (form.newPassword.length < 8) errors.newPassword = "Password baru minimal 8 karakter.";
    if (!form.confirmPassword) errors.confirmPassword = "Konfirmasi password wajib diisi.";
    else if (form.newPassword !== form.confirmPassword)
      errors.confirmPassword = "Konfirmasi password tidak cocok.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setSaveState("saving");
    setServerMessage("");

    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerMessage(json.message ?? "Gagal memperbarui password.");
        setSaveState("error");
        return;
      }

      setSaveState("success");
      setServerMessage("Password berhasil diperbarui.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSaveState("idle"), 4000);
    } catch {
      setServerMessage("Terjadi kesalahan. Silakan coba lagi.");
      setSaveState("error");
    }
  }

  return (
    <div className="bg-card border-2 border-foreground rounded-3xl overflow-hidden p-8">
      <h2 className="text-xl font-bold font-heading mb-1 text-foreground">
        Password &amp; Keamanan
      </h2>
      <p className="text-sm text-muted-foreground font-body mb-6">
        Gunakan password yang kuat dan unik agar akunmu tetap aman.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 max-w-md">
        <PasswordField
          label="Password Saat Ini"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="Masukkan password saat ini"
          error={fieldErrors.currentPassword}
        />

        <PasswordField
          label="Password Baru"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="Minimal 8 karakter"
          error={fieldErrors.newPassword}
        />

        <PasswordField
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Ulangi password baru"
          error={fieldErrors.confirmPassword}
        />

        {/* Server feedback */}
        {saveState === "success" && (
          <div role="status" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-body">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {serverMessage}
          </div>
        )}
        {saveState === "error" && (
          <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-body">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {serverMessage}
          </div>
        )}

        <div className="mt-2">
          <Button
            type="submit"
            variant="primary"
            size="default"
            neo
            disabled={saveState === "saving"}
            className="px-8"
          >
            {saveState === "saving" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              "Perbarui Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

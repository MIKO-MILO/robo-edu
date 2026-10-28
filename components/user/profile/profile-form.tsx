"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileField } from "./profile-field";
import { TextareaField } from "./textarea-field";
import { StatusBadge } from "./status-badge";
import { AvatarCropModal } from "./avatar-crop-modal";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  taxIdentificationNumber: string;
  taxIdentificationCountry: string;
  residentialAddress: string;
  avatarUrl: string | null;
  role: string;
  resellerStatus: string;
}

interface ProfileFormProps {
  initialData: ProfileData;
}

type SaveState = "idle" | "saving" | "success" | "error";

// Derive badge label from role/resellerStatus
function badgeLabel(role: string, resellerStatus: string): string {
  if (role === "ADMIN" || role === "admin") return "Admin";
  if (resellerStatus === "APPROVED" || resellerStatus === "approved") return "Reseller";
  return "Member";
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: initialData.name,
    phone: initialData.phone,
    gender: initialData.gender,
    taxIdentificationNumber: initialData.taxIdentificationNumber,
    taxIdentificationCountry: initialData.taxIdentificationCountry,
    residentialAddress: initialData.residentialAddress,
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropMime, setCropMime] = useState<string>("image/jpeg");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (saveState !== "idle") setSaveState("idle");
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Open crop modal instead of uploading directly
    const objectUrl = URL.createObjectURL(file);
    setCropMime(file.type || "image/jpeg");
    setCropSrc(objectUrl);
    // Reset input so same file can trigger onChange again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCropConfirm(croppedBlob: Blob) {
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", croppedBlob, "avatar.jpg");
      const res = await fetch("/api/profile", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal upload foto.");
      setAvatarUrl(json.data.avatarUrl);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal upload foto.");
      setSaveState("error");
    } finally {
      setAvatarUploading(false);
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaveState("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal menyimpan profil.");
      setSaveState("success");
      router.refresh();
      // Auto-reset success indicator
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setSaveState("error");
    }
  }

  const isSaving = saveState === "saving";

  return (
    <>
    <div className="bg-card border-2 border-foreground rounded-3xl overflow-hidden p-8">
      {/* ── Avatar Section ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="relative w-32 h-32 shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary neo-shadow relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Foto profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-accent-yellow/40 flex items-center justify-center">
                <span className="font-heading font-bold text-4xl text-foreground select-none">
                  {form.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
            aria-label="Ganti foto profil"
          >
            {avatarUploading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-3xl font-bold text-foreground leading-tight">
            {form.name || "—"}
          </h2>
          <StatusBadge label={badgeLabel(initialData.role, initialData.resellerStatus)} />
          <p className="font-body text-sm text-muted-foreground">{initialData.email}</p>
        </div>
      </div>

      {/* ── Feedback Banner ── */}
      {saveState === "success" && (
        <div role="status" className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-body text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Profil berhasil disimpan.
        </div>
      )}
      {saveState === "error" && (
        <div role="alert" className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-body text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button type="button" onClick={() => setSaveState("idle")} aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {/* Name */}
          <ProfileField
            label="Nama Lengkap"
            required
            name="name"
            placeholder="Nama lengkap"
            value={form.name}
            onChange={handleChange}
          />

          {/* Email — read only */}
          <ProfileField
            label="Email"
            type="email"
            placeholder="Email"
            value={initialData.email}
            readOnly
            className="bg-muted text-muted-foreground cursor-not-allowed"
          />

          {/* Phone */}
          <ProfileField
            label="Nomor HP"
            name="phone"
            type="tel"
            placeholder="+62 812 3456 7890"
            value={form.phone}
            onChange={handleChange}
          />

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Gender</label>
            <div className="flex gap-4">
              {(["male", "female"] as const).map((g) => (
                <label
                  key={g}
                  className="flex flex-1 items-center gap-2 border border-primary-300 bg-primary-100/30 rounded-md px-4 py-2 cursor-pointer hover:bg-primary-100/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                    className="accent-primary"
                  />
                  <span className="text-sm capitalize">{g === "male" ? "Pria" : "Wanita"}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tax ID */}
          <ProfileField
            label="NPWP / Tax ID"
            name="taxIdentificationNumber"
            placeholder="Nomor NPWP (opsional)"
            value={form.taxIdentificationNumber}
            onChange={handleChange}
          />

          {/* Tax Country */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Negara Pajak</label>
            <select
              name="taxIdentificationCountry"
              value={form.taxIdentificationCountry}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-primary-300 rounded-md bg-primary-100/30 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">Pilih negara</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Singapore">Singapore</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>

          {/* Residential Address */}
          <div className="md:col-span-2">
            <TextareaField
              label="Alamat Domisili"
              name="residentialAddress"
              placeholder="Jl. Contoh No. 1, Kota, Provinsi"
              value={form.residentialAddress}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2 mt-2">
            <Button
              type="submit"
              variant="primary"
              size="default"
              neo
              disabled={isSaving}
              className="px-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>

    {/* ── Avatar crop modal ── */}
    <AvatarCropModal
      imageSrc={cropSrc}
      mimeType={cropMime}
      onConfirm={handleCropConfirm}
      onCancel={handleCropCancel}
      isUploading={avatarUploading}
    />
  </>
  );
}

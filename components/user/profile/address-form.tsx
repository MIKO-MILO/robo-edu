"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

export interface AddressFormData {
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  isPrimary: boolean;
}

const EMPTY_FORM: AddressFormData = {
  label: "",
  recipientName: "",
  phone: "",
  address: "",
  province: "",
  city: "",
  district: "",
  village: "",
  postalCode: "",
  isPrimary: false,
};

interface PostalSuggestion {
  postalCode: string;
  village: string;
  district: string;
  city: string;
  province: string;
}

interface AddressFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: AddressFormData | null;
  isFirstAddress?: boolean;
  onSave: (data: AddressFormData) => Promise<void>;
}

export function AddressForm({
  open,
  onClose,
  initialData,
  isFirstAddress = false,
  onSave,
}: AddressFormProps) {
  const [form, setForm] = useState<AddressFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Postal code lookup state
  const [postalStatus, setPostalStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [postalMessage, setPostalMessage] = useState("");
  const [suggestions, setSuggestions] = useState<PostalSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const lookupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? { ...initialData }
          : { ...EMPTY_FORM, isPrimary: isFirstAddress },
      );
      setError(null);
      setPostalStatus("idle");
      setPostalMessage("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [open, initialData, isFirstAddress]);

  function set<K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Postal code lookup ────────────────────────────────────────────────
  function handlePostalCodeChange(value: string) {
    // Only allow digits, max 5
    const cleaned = value.replace(/\D/g, "").slice(0, 5);
    set("postalCode", cleaned);
    setShowSuggestions(false);
    setSuggestions([]);

    if (lookupTimeout.current) clearTimeout(lookupTimeout.current);

    if (cleaned.length < 5) {
      setPostalStatus("idle");
      setPostalMessage("");
      return;
    }

    // Debounce 400ms setelah digit ke-5
    setPostalStatus("loading");
    setPostalMessage("");
    lookupTimeout.current = setTimeout(() => void lookupPostalCode(cleaned), 400);
  }

  async function lookupPostalCode(code: string) {
    try {
      const res = await fetch(`/api/postal-code/${code}`);
      const json: { success: boolean; message?: string; data?: PostalSuggestion[] } = await res.json();

      if (!json.success || !json.data?.length) {
        setPostalStatus("error");
        setPostalMessage(json.message ?? "Kode pos tidak ditemukan.");
        return;
      }

      setSuggestions(json.data);

      if (json.data.length === 1) {
        // Langsung isi jika hanya satu hasil
        applyPostalSuggestion(json.data[0]);
        setPostalStatus("found");
        setPostalMessage(`${json.data[0].village}, ${json.data[0].district}, ${json.data[0].city}`);
      } else {
        // Tampilkan pilihan kelurahan
        setPostalStatus("found");
        setPostalMessage(`Ditemukan ${json.data.length} kelurahan — pilih salah satu`);
        setShowSuggestions(true);
      }
    } catch {
      setPostalStatus("error");
      setPostalMessage("Gagal mengambil data kode pos. Isi manual.");
    }
  }

  function applyPostalSuggestion(s: PostalSuggestion) {
    setForm((prev) => ({
      ...prev,
      province: s.province,
      city: s.city,
      district: s.district,
      village: s.village,
    }));
    setShowSuggestions(false);
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const required: (keyof AddressFormData)[] = [
      "label", "recipientName", "phone", "address",
      "province", "city", "district", "village", "postalCode",
    ];
    for (const field of required) {
      if (!String(form[field]).trim()) {
        setError("Semua field wajib diisi.");
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan alamat.");
    } finally {
      setIsSaving(false);
    }
  }

  const isEditing = Boolean(initialData);

  // Apakah field wilayah sudah terisi via autofill
  const regionFilled = form.province && form.city && form.district && form.village;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !isSaving) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold text-foreground">
            {isEditing ? "Edit Alamat" : "Tambah Alamat Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Label & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Label <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="mis. Rumah, Kantor"
                value={form.label}
                maxLength={50}
                onChange={(e) => set("label", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">
                Nama Penerima <span className="text-danger">*</span>
              </label>
              <Input
                placeholder="Nama lengkap penerima"
                value={form.recipientName}
                maxLength={150}
                onChange={(e) => set("recipientName", e.target.value)}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Nomor HP <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="mis. 08123456789"
              value={form.phone}
              maxLength={30}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          {/* Full address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Alamat Lengkap <span className="text-danger">*</span>
            </label>
            <textarea
              placeholder="Nama jalan, nomor rumah, RT/RW, dll."
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 resize-none"
            />
          </div>

          {/* ── Kode Pos — autofill trigger ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Kode Pos <span className="text-danger">*</span>
            </label>
            <div className="flex items-center gap-2 max-w-[200px]">
              <div className="relative flex-1">
                <Input
                  placeholder="mis. 40132"
                  value={form.postalCode}
                  maxLength={5}
                  inputMode="numeric"
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  className={
                    postalStatus === "found"
                      ? "border-green-500 focus-visible:ring-green-300"
                      : postalStatus === "error"
                      ? "border-red-500 focus-visible:ring-red-300"
                      : ""
                  }
                />
              </div>
              {postalStatus === "loading" && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
              )}
              {postalStatus === "found" && (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              )}
              {postalStatus === "error" && (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </div>

            {/* Status message */}
            {postalMessage && (
              <p className={`text-xs flex items-center gap-1 ${
                postalStatus === "found" ? "text-green-600" : "text-red-500"
              }`}>
                {postalMessage}
              </p>
            )}

            {/* Dropdown pilih kelurahan jika lebih dari satu */}
            {showSuggestions && suggestions.length > 1 && (
              <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground px-3 pt-2.5 pb-1.5 bg-muted/40">
                  Pilih kelurahan:
                </p>
                <ul className="divide-y divide-border max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          applyPostalSuggestion(s);
                          setPostalMessage(`${s.village}, ${s.district}, ${s.city}`);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-primary/5 transition-colors"
                      >
                        <span className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          <span>
                            <span className="text-sm font-semibold text-foreground">{s.village}</span>
                            <span className="text-xs text-muted-foreground block">
                              {s.district} · {s.city} · {s.province}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Wilayah (autofilled, tapi bisa diedit manual) ── */}
          <div className="flex flex-col gap-3">
            {/* Banner autofill berhasil */}
            {regionFilled && postalStatus === "found" && !showSuggestions && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Wilayah otomatis terisi dari kode pos. Bisa diedit manual jika perlu.
              </div>
            )}

            {/* Province & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Provinsi <span className="text-danger">*</span>
                </label>
                <Input
                  placeholder="mis. Jawa Barat"
                  value={form.province}
                  maxLength={100}
                  onChange={(e) => set("province", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Kota / Kabupaten <span className="text-danger">*</span>
                </label>
                <Input
                  placeholder="mis. Bandung"
                  value={form.city}
                  maxLength={100}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
            </div>

            {/* District & Village */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Kecamatan <span className="text-danger">*</span>
                </label>
                <Input
                  placeholder="mis. Coblong"
                  value={form.district}
                  maxLength={100}
                  onChange={(e) => set("district", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Kelurahan / Desa <span className="text-danger">*</span>
                </label>
                <Input
                  placeholder="mis. Lebakgede"
                  value={form.village}
                  maxLength={100}
                  onChange={(e) => set("village", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Primary checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => set("isPrimary", e.target.checked)}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm font-medium text-foreground">
              Jadikan sebagai alamat utama
            </span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger font-medium">{error}</p>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Alamat"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, MapPin, CheckCircle2, AlertCircle, X } from "lucide-react";
import { getSavedAddressNotes, saveAddressNotes } from "@/lib/address-notes";

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
  notes?: string;
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
  notes: "",
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

const REGION_FIELDS: Array<{
  key: "province" | "city" | "district" | "village";
  label: string;
  placeholder: string;
}> = [
  { key: "province", label: "Provinsi", placeholder: "mis. Jawa Barat" },
  { key: "city", label: "Kota / Kabupaten", placeholder: "mis. Bandung" },
  { key: "district", label: "Kecamatan", placeholder: "mis. Coblong" },
  { key: "village", label: "Kelurahan / Desa", placeholder: "mis. Lebakgede" },
];

const FORM_CONTROL_CLASS = "bg-card border-border-strong focus-visible:border-ring";

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
          ? {
              ...initialData,
              notes: initialData.notes ?? getSavedAddressNotes(initialData),
            }
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
      saveAddressNotes(form, form.notes ?? "");
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
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card p-6 sm:p-7 gap-5"
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle className="font-heading text-xl font-bold text-foreground">
            {isEditing ? "Edit Alamat" : "Tambah Alamat Baru"}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            neo={false}
            onClick={() => { if (!isSaving) onClose(); }}
            aria-label="Tutup"
            className="w-9 h-9 rounded-full bg-muted/60 hover:bg-muted text-foreground shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Label, Recipient & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Label" required>
              <Input
                placeholder="mis. Rumah, Kantor"
                value={form.label}
                maxLength={50}
                onChange={(e) => set("label", e.target.value)}
                className={FORM_CONTROL_CLASS}
              />
            </FormField>
            <FormField label="Nama Penerima" required>
              <Input
                placeholder="Nama lengkap penerima"
                value={form.recipientName}
                maxLength={150}
                onChange={(e) => set("recipientName", e.target.value)}
                className={FORM_CONTROL_CLASS}
              />
            </FormField>
            <FormField label="Nomor HP" required>
              <Input
                placeholder="mis. 08123456789"
                value={form.phone}
                maxLength={30}
                onChange={(e) => set("phone", e.target.value)}
                className={FORM_CONTROL_CLASS}
              />
            </FormField>
          </div>

          {/* Full address & Delivery notes side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Alamat Lengkap" required>
              <Textarea
                placeholder="Nama jalan, nomor rumah, RT/RW, dll."
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                rows={2}
                className={`${FORM_CONTROL_CLASS} min-h-[72px]`}
              />
            </FormField>

            <FormField label="Catatan Pengiriman">
              <Textarea
                placeholder="Contoh: Paket harap dititipkan di Pos Security depan Lab bila tidak ada di tempat."
                value={form.notes ?? ""}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
                className={`${FORM_CONTROL_CLASS} min-h-[72px]`}
              />
            </FormField>
          </div>

          {/* ── Kode Pos — autofill trigger ── */}
          <FormField label="Kode Pos" required>
            <div className="flex items-center gap-2 max-w-[220px]">
              <div className="relative flex-1">
                <Input
                  placeholder="mis. 40132"
                  value={form.postalCode}
                  maxLength={5}
                  inputMode="numeric"
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  className={
                    postalStatus === "found"
                      ? "bg-card border-success focus-visible:ring-success/30"
                      : postalStatus === "error"
                      ? "bg-card border-danger focus-visible:ring-danger/30"
                      : FORM_CONTROL_CLASS
                  }
                />
              </div>
              {postalStatus === "loading" && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
              )}
              {postalStatus === "found" && (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              )}
              {postalStatus === "error" && (
                <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              )}
            </div>

            {/* Status message */}
            {postalMessage && (
              <p className={`text-xs flex items-center gap-1 ${
                postalStatus === "found" ? "text-success" : "text-danger"
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
          </FormField>

          {/* ── Wilayah (autofilled, tapi bisa diedit manual) ── */}
          <div className="flex flex-col gap-3">
            {/* Banner autofill berhasil */}
            {regionFilled && postalStatus === "found" && !showSuggestions && (
              <div className="flex items-center gap-2 text-xs text-success bg-success-bg/30 border border-success/30 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Wilayah otomatis terisi dari kode pos. Bisa diedit manual jika perlu.
              </div>
            )}

            {/* Province, City, District & Village */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {REGION_FIELDS.map((field) => (
                <FormField key={field.key} label={field.label} required>
                  <Input
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    maxLength={100}
                    onChange={(e) => set(field.key, e.target.value)}
                    className={FORM_CONTROL_CLASS}
                  />
                </FormField>
              ))}
            </div>
          </div>

          {/* Primary checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => set("isPrimary", e.target.checked)}
              className="w-4 h-4 accent-primary rounded border-border/60"
            />
            <span className="text-sm font-medium text-foreground/80">
              Jadikan sebagai alamat utama
            </span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger font-medium">{error}</p>
          )}

          <DialogFooter className="pt-4 mt-1 border-t border-border/15 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              neo={false}
              onClick={onClose}
              disabled={isSaving}
              className="rounded-full px-5 text-muted-foreground hover:text-foreground font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              neo={false}
              disabled={isSaving}
              className="rounded-full px-6 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
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
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

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

interface AddressFormProps {
  open: boolean;
  onClose: () => void;
  /** Pass an existing address to pre-fill the form for editing */
  initialData?: AddressFormData | null;
  /** Whether there are no other primary addresses yet (auto-check isPrimary) */
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

  // Sync form whenever the dialog opens or initial data changes
  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? { ...initialData }
          : { ...EMPTY_FORM, isPrimary: isFirstAddress },
      );
      setError(null);
    }
  }, [open, initialData, isFirstAddress]);

  function set<K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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

          {/* Postal code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Kode Pos <span className="text-danger">*</span>
            </label>
            <Input
              placeholder="mis. 40132"
              value={form.postalCode}
              maxLength={10}
              onChange={(e) => set("postalCode", e.target.value)}
              className="max-w-[160px]"
            />
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

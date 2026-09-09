"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressCard, type AddressData } from "@/components/user/profile/address-card";
import { AddressForm, type AddressFormData } from "@/components/user/profile/address-form";

type ApiAddress = {
  id: string;
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
};

function toAddressData(a: ApiAddress): AddressData {
  return {
    id: a.id,
    label: a.label,
    recipientName: a.recipientName,
    phone: a.phone,
    address: a.address,
    province: a.province,
    city: a.city,
    district: a.district,
    village: a.village,
    postalCode: a.postalCode,
    isPrimary: a.isPrimary,
  };
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);

  // Per-card loading state for set-primary action
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  // Delete confirmation state
  const [deletingAddress, setDeletingAddress] = useState<AddressData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/profile/addresses", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal memuat alamat.");
      const sorted = (json.data as ApiAddress[]).sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
      setAddresses(sorted.map(toAddressData));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat alamat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  // ── Add / Edit ────────────────────────────────────────────────────────
  function handleAddClick() {
    setEditingAddress(null);
    setFormOpen(true);
  }

  function handleEditClick(address: AddressData) {
    setEditingAddress(address);
    setFormOpen(true);
  }

  async function handleSave(data: AddressFormData) {
    const isEditing = Boolean(editingAddress);
    const url = isEditing
      ? `/api/profile/addresses/${editingAddress!.id}`
      : "/api/profile/addresses";

    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal menyimpan alamat.");

    showToast(json.message ?? (isEditing ? "Alamat diperbarui." : "Alamat ditambahkan."));
    await loadAddresses();
  }

  // ── Set primary ───────────────────────────────────────────────────────
  async function handleSetPrimary(address: AddressData) {
    setSettingPrimaryId(address.id);
    try {
      const res = await fetch(`/api/profile/addresses/${address.id}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal mengatur alamat utama.");
      showToast(json.message ?? "Alamat utama diperbarui.");
      await loadAddresses();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal mengatur alamat utama.", "error");
    } finally {
      setSettingPrimaryId(null);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  function handleDeleteClick(address: AddressData) {
    setDeletingAddress(address);
  }

  async function confirmDelete() {
    if (!deletingAddress) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/profile/addresses/${deletingAddress.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal menghapus alamat.");
      showToast(json.message ?? "Alamat dihapus.");
      setDeletingAddress(null);
      await loadAddresses();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus alamat.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-card rounded-xl p-6 sm:p-8 border border-border/20 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
            Alamat Pengiriman
          </h1>
          {!isLoading && (
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {addresses.length}
            </span>
          )}
        </div>
        <Button variant="primary" size="sm" onClick={handleAddClick}>
          <Plus className="w-4 h-4" />
          Tambah Alamat
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-body text-sm">Memuat alamat...</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && loadError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-danger font-medium">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => void loadAddresses()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !loadError && addresses.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-100/40 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-heading font-bold text-base text-foreground mb-1">
              Belum ada alamat pengiriman
            </p>
            <p className="font-body text-sm text-muted-foreground max-w-xs">
              Tambahkan alamat pengiriman agar kamu bisa langsung checkout tanpa hambatan.
            </p>
          </div>
          <Button variant="primary" onClick={handleAddClick}>
            <Plus className="w-4 h-4" />
            Tambah Alamat Pertama
          </Button>
        </div>
      )}

      {/* Address grid */}
      {!isLoading && !loadError && addresses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onSetPrimary={handleSetPrimary}
              isSettingPrimary={settingPrimaryId === addr.id}
            />
          ))}
        </div>
      )}

      {/* Add / Edit form dialog */}
      <AddressForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingAddress}
        isFirstAddress={addresses.length === 0}
        onSave={handleSave}
      />

      {/* Delete confirmation dialog */}
      {deletingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => { if (!isDeleting) setDeletingAddress(null); }}
          />
          <div className="relative z-10 bg-popover rounded-3xl shadow-xl ring-1 ring-foreground/5 p-6 max-w-sm w-full mx-4">
            <h2 className="font-heading font-bold text-base text-foreground mb-2">
              Hapus Alamat?
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Alamat <span className="font-semibold text-foreground">{deletingAddress.label}</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingAddress(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger-solid"
                size="sm"
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-foreground neo-shadow animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toast.type === "error" ? "bg-danger-bg text-danger" : "bg-card text-foreground"
          }`}
        >
          <span className="font-body font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

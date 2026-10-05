"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ShieldCheck, Box, Info } from "lucide-react";

export function ShippingSection() {
  const [providers, setProviders] = useState([
    { id: 1, name: "JNE", isActive: true },
    { id: 2, name: "J&T Express", isActive: true },
    { id: 3, name: "SiCepat", isActive: false },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [providerName, setProviderName] = useState("");
  const [providerActive, setProviderActive] = useState(true);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleOpenAdd = () => {
    resetForm();
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (provider: any) => {
    resetForm();
    setIsEditing(true);
    setCurrentId(provider.id);
    setProviderName(provider.name);
    setProviderActive(provider.isActive);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!providerName.trim()) return;

    if (isEditing && currentId) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === currentId ? { ...p, name: providerName, isActive: providerActive } : p
        )
      );
    } else {
      setProviders((prev) => [
        ...prev,
        { id: Date.now(), name: providerName, isActive: providerActive },
      ]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentId(null);
    setProviderName("");
    setProviderActive(true);
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      setProviders((prev) => prev.filter((p) => p.id !== deletingId));
    }
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">Konfigurasi Pengiriman</h2>
          <p className="text-sm text-muted-foreground">Kelola penyedia jasa ekspedisi (provider) yang tersedia saat checkout.</p>
        </div>
        
        <Button onClick={handleOpenAdd} variant="primary" className="font-bold shrink-0">
          <Plus className="size-4 mr-2" />
          Tambah Provider
        </Button>
      </div>

      {/* List Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-bold border-b border-border">
              <tr>
                <th className="px-5 py-4 w-1/3">Nama Provider</th>
                <th className="px-5 py-4 w-1/3">Status</th>
                <th className="px-5 py-4 text-right w-1/3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {providers.length > 0 ? (
                providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-semibold text-foreground text-base">{provider.name}</td>
                    <td className="px-5 py-4">
                      {provider.isActive ? (
                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground bg-muted/30 gap-1.5">
                          Nonaktif
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 flex justify-end gap-2">
                      <Button
                        variant="accent-yellow"
                        size="sm"
                        onClick={() => handleOpenEdit(provider)}
                        className="font-bold px-4 rounded-full h-9 border border-border"
                        neo={false}
                      >
                        <Pencil className="size-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmDelete(provider.id)}
                        className="font-bold px-4 rounded-full h-9 border border-border"
                        neo={false}
                      >
                        <Trash2 className="size-3.5 mr-1.5" />
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                    Belum ada provider pengiriman.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-extrabold text-foreground">
              {isEditing ? "Edit Provider" : "Tambah Provider"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isEditing 
                ? "Ubah informasi penyedia jasa pengiriman di bawah ini." 
                : "Masukkan nama dan status untuk penyedia jasa pengiriman baru."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Nama Ekspedisi</label>
              <Input
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Misal: Pos Indonesia"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Status Provider</label>
              <select
                value={providerActive ? "active" : "inactive"}
                onChange={(e) => setProviderActive(e.target.value === "active")}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:border-primary/50 font-medium transition-colors"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold">
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave} className="font-bold">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Provider"
        description="Apakah Anda yakin ingin menghapus provider pengiriman ini? Tindakan ini tidak dapat dibatalkan."
        itemName={providers.find((p) => p.id === deletingId)?.name || "Item ini"}
        onConfirm={handleDelete}
        confirmText="Ya, Hapus"
        cancelText="Batal"
      />
    </div>
  );
}

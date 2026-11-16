"use client";

import React from "react";
import { StoreInfoSection } from "@/components/admin/settings/store-info-section";
import { GeneralSection } from "@/components/admin/settings/general-section";

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Pengaturan Sistem
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Kelola identitas dan pengaturan umum toko.
          </p>
        </div>
      </div>

      {/* Identitas Toko */}
      <StoreInfoSection />

      {/* Pengaturan Umum */}
      <GeneralSection />
    </div>
  );
}

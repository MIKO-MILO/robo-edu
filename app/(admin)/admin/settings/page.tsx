"use client";

import React, { useState } from "react";
import { StoreInfoSection } from "@/components/admin/settings/store-info-section";
import { PaymentSection } from "@/components/admin/settings/payment-section";
import { ShippingSection } from "@/components/admin/settings/shipping-section";
import { GeneralSection } from "@/components/admin/settings/general-section";
import { Store, CreditCard, Truck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type TabValue = "store" | "payment" | "shipping" | "general";

const TABS: { value: TabValue; label: string; icon: React.ReactNode }[] = [
  { value: "store", label: "Informasi Toko", icon: <Store className="size-4" /> },
  { value: "payment", label: "Pembayaran", icon: <CreditCard className="size-4" /> },
  { value: "shipping", label: "Pengiriman", icon: <Truck className="size-4" /> },
  { value: "general", label: "Pengaturan Umum", icon: <Settings className="size-4" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("store");

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Pengaturan Sistem
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Kelola informasi toko, metode pembayaran, pengiriman, dan konfigurasi umum aplikasi.
          </p>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6 overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "store" && <StoreInfoSection />}
        {activeTab === "payment" && <PaymentSection />}
        {activeTab === "shipping" && <ShippingSection />}
        {activeTab === "general" && <GeneralSection />}
      </div>
    </div>
  );
}

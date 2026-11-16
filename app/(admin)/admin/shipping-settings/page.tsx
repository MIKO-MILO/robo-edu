import { ShippingSection } from "@/components/admin/settings/shipping-section";

export const metadata = {
  title: "Kelola Pengiriman | Admin",
};

export default function AdminShippingSettingsPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
          Kelola Pengiriman
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Atur provider pengiriman default yang digunakan saat pelanggan checkout.
        </p>
      </div>

      {/* Content */}
      <ShippingSection />
    </div>
  );
}
